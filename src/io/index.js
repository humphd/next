import fs from '../lib/fs';
const sh = new fs.Shell();
import pth from '../lib/path';
import buffer from '../lib/buffer';
import { getMimeType } from '../lib/content-type';
import htmlFormatter from '../lib/html-formatter';
import { fullyDecodeURI } from '../lib/utils';
import registerRoutes from './routes';
import * as ioFiles from './io-files';
import strongDataUri from 'strong-data-uri';

export default class {
    init(workbox) {
        registerRoutes(workbox, this);
    }

    // Creates a file from an encoded text
    async createFileFromEncodedText(path) {
        try {
            let text = pth.basename(path);
            let paths = pth.join(path, '..');
            let fileName = pth.basename(paths);
            let directory = pth.dirname(paths);
            let filePath = pth.join(directory, fileName);

            await this.createPath(directory);

            return new Promise((resolve, reject) => {
                fs.writeFile(filePath, text, err => {
                    if (err) {
                        return reject({
                            success: false,
                            err: err,
                        });
                    }
                    resolve({
                        success: true,
                        path: pth.dirname(paths),
                    });
                });
            });
        } catch (err) {
            throw err;
        }
    }

    // Creates a file from an encoded data uri
    async createFileFromEncodedDataURI(path) {
        try {
            let dataUriRegex = /data:([\w\/\+]+);(charset=[\w-]+|base64).*,(.+={0,2})/;
            var index = path.match(dataUriRegex).index;
            let dataURL = path.substring(index);
            let paths = path.substring(0, index);
            let fileName = pth.basename(paths);
            let fileDirectory = pth.dirname(paths);
            let filePath = pth.join(pth.dirname(paths), fileName);

            await this.createPath(fileDirectory);

            let buffer = strongDataUri.decode(dataURL);
            let file = {
                name: fileName,
                path: filePath,
                buffer: buffer,
            };
            return await ioFiles.importFile(file);
        } catch (err) {
            throw err;
        }
    }

    // Generates a Data URI for the specified file
    async getFileDataURL(path) {
        try {
            const fileInfo = await this.getFileInfo(path);

            let daraUri = strongDataUri.encode(
                new buffer(fileInfo.body.contents),
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
                file.buffer = Object.values(file.buffer);
                file.path = fullyDecodeURI(pth.join(file.path, file.name));
                return await ioFiles.importFile(file);
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

    // Retrieves entries
    async getEntries(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                // If this is a dir, show a dir listing
                if (stats.isDirectory()) {
                    sh.ls(path, { recursive: true }, (err, entries) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({
                            type: 'text/html',
                            body: htmlFormatter.formatEntries(path, entries),
                        });
                    });
                } else {
                    reject('Path does not link to a Directory.');
                }
            });
        });
    }

    // Retrieves a file
    async getFile(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                // If this is a dir, show a dir listing
                if (stats.isDirectory()) {
                    // Todo: Better error handling needed.
                    reject('Path does not link to a File.');
                } else {
                    fs.readFile(path, (err, contents) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({
                            type: getMimeType(path),
                            body: contents,
                        });
                    });
                }
            });
        });
    }

    // Gets file info
    async getFileInfo(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(htmlFormatter.notAFile(path));
                }
                // If this is a dir, show a dir listing
                if (stats.isDirectory()) {
                    // Todo: Better error handling needed.
                    reject(htmlFormatter.notAFile(path));
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
