import fs from '../lib/fs';
import Filer from '../../node_modules/filer/dist/filer';
const sh = new fs.Shell();

import { getMimeType } from './content-type';
import { formatDir } from './html-formatter';
import registerRoutes from './routes';

/**
 *
 */
export default class {
    init(workbox) {
        registerRoutes(workbox, this);
    }

    // Creates a file from an encoded text
    async createFileFromEncodedText(path) {
        return new Promise((resolve, reject) => {
            var pathPieces = path.split('/');
            var file = pathPieces.slice(Math.max(pathPieces.length - 2, 1));
            file[0] = pathPieces.slice(0, pathPieces.length - 1).join('/');
            file[1] = atob(file[1]);
            fs.writeFile(file[0], file[1], function(err) {
                if (err) reject({ success: false, err: err });
                var pathPieces = file[0].split('/');
                pathPieces.pop();
                var finalPath = pathPieces.join('/');
                resolve({ success: true, path: finalPath});
            });
        });
    }

    // Converts Data URL to a Blob
    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    // Makes FileReader Api work with async/await
    async readUploadedFileAsArrayBuffer(inputFile) {
        const temporaryFileReader = new FileReader();
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException('Problem parsing input file.'));
            };

            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsArrayBuffer(inputFile);
        });
    }

    // Creates a file from an encoded data uri
    async createFileFromEncodedDataURI(path) {
        return new Promise((resolve, reject) => {
            var pathPieces = path
                .substring(0, path.indexOf('data:'))
                .split('/')
                .filter(p => p != '');

            var fileName = pathPieces.pop();
            var filePath = '/' + pathPieces.join('/');
            filePath = filePath.replace(/\/?$/, '/');

            var dataURL = path.substring(path.indexOf('data:'));
            var blob = this.dataURLtoBlob(dataURL);

            const handleUpload = async blob => {
                try {
                    const fileContents = await this.readUploadedFileAsArrayBuffer(
                        blob
                    );
                    var buf = new Int8Array(fileContents);
                    var file = { name: fileName, path: filePath, buffer: buf };
                    const result = await this.createFileFromArrayBuffer(file);
                    result.path = filePath;
                    resolve(result);
                } catch (e) {
                    reject(e.message);
                }
            };
            handleUpload(blob);
        });
    }

    // Uploads a file into filesystem
    async createFileFromArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            var buffer = new Filer.Buffer(file.buffer);
            fs.writeFile(file.path + file.name, buffer, function(err) {
                if (err) reject({ success: false, err: err });
                else resolve({ success: true });
            });
        });
    }

    // Uploads array of files into filesystem
    async createFilesFromArrayBuffer(files) {
        const promises = files.map(async file => {
            file.buffer = Object.values(file.buffer);
            const result = await this.createFileFromArrayBuffer(file);
            return result;
        });

        const results = await Promise.all(promises).catch(function(err) {
            console.log(err.message);
        });

        return results;
    }

    // Creates Paths Recursively /A/B/C
    async createPathRecursive(paths) {
        var pathArray = paths
            .split('/')
            .filter(path => path != '')
            .map((path, index, array) => {
                return '/' + array.slice(0, index + 1).join('/');
            });
        const promises = pathArray.map(async path => {
            return await this.createPath(path);
        });

        const results = await Promise.all(promises).catch(function(err) {
            console.log(err.message);
        });

        return results;
    }

    // Checks if directory exists
    async dirExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, function(err, stats) {
                if (err) return reject(false);
                var exists = stats.type === 'DIRECTORY';
                resolve(exists);
            });
        });
    }

    // Creates a given Path /A
    async createPath(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, function(err) {
                if (err) reject(err);
                resolve();
            });
        });
    }

    async getFile(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        // Todo: Better error handling needed.
                        reject("Path does not link to a File.")
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
                }
            });
        });
    }

    async serve(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        sh.ls(path, { recursive: true }, (err, entries) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                type: 'text/html',
                                body: formatDir(path, entries),
                            });
                        });
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
                }
            });
        });
    }
}
