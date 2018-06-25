import fs from '../lib/fs';
const sh = new fs.Shell();
import Path from '../lib/path';
import Buffer from '../lib/buffer';
import { getMimeType } from '../lib/content-type';
import htmlFormatter from '../lib/html-formatter';
import { fullyDecodeURI } from '../lib/utils';
import registerRoutes from './routes';
import strongDataUri from 'strong-data-uri';

export default class {
    init(workbox) {
        registerRoutes(workbox, this);
    }

    // Creates a file from an encoded text
    async createFileFromEncodedText(path, text) {
        const directory = Path.dirname(path);
        return this.createPath(directory).then(
            () =>
                new Promise((resolve, reject) => {
                    fs.writeFile(path, text, err => {
                        if (err) {
                            return reject({
                                err: err,
                            });
                        }
                        resolve({
                            path: directory,
                        });
                    });
                })
        );
    }

    // Creates a file from an encoded data uri
    createFileFromEncodedDataURI(path, dataUri) {
        const directory = Path.dirname(path);
        return this.createPath(directory).then(
            () =>
                new Promise((resolve, reject) => {
                    const buffer = new Buffer(strongDataUri.decode(dataUri));
                    fs.writeFile(path, buffer, err => {
                        if (err) {
                            return reject({
                                err: err,
                            });
                        }
                        resolve({
                            path: directory,
                        });
                    });
                })
        );
    }

    // Generates a Data URI for the specified file
    async getFileDataURL(path) {
        try {
            const fileInfo = await this.getFileInfo(path);

            const daraUri = strongDataUri.encode(
                new Buffer(fileInfo.body.contents),
                fileInfo.type
            );

            return {
                name: fileInfo.body.name,
                dataurl: daraUri,
            };
        } catch (err) {
            throw err;
        }
    }

    // Uploads array of files into filesystem
    async importFiles(files) {
        return Promise.all(
            files.map(async file => {
                file.buffer = new Buffer(Object.values(file.buffer));
                file.path = fullyDecodeURI(file.path);
                return await new Promise((resolve, reject) => {
                    fs.writeFile(file.path, file.buffer, err => {
                        if (err) {
                            return reject({
                                err: err,
                            });
                        }
                        resolve({
                            path: Path.dirname(file.path),
                        });
                    });
                });
            })
        );
    }

    // Deletes everything in Path
    async deletePath(path) {
        return new Promise((resolve, reject) => {
            sh.rm(path, { recursive: true }, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    // Creates a given Path /A
    async createPath(path) {
        return new Promise((resolve, reject) => {
            sh.mkdirp(path, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    // Gets file info
    async getFileInfo(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(htmlFormatter.format404(path));
                }
                // If this is a dir, show a dir listing
                if (stats.isDirectory()) {
                    // Todo: Better error handling needed.
                    reject(htmlFormatter.format404(path));
                } else {
                    fs.readFile(path, (err, contents) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({
                            type: getMimeType(path),
                            body: {
                                name: stats.name,
                                contents: contents,
                                lastModified: stats.mtime,
                            },
                        });
                    });
                }
            });
        });
    }
}
