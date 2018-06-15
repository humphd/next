import fs from '../lib/fs';
var sh = new fs.Shell();
import formatFS from '../lib/format-fs';
import buffer from '../lib/buffer';
import pth from '../lib/path';

import { getMimeType } from '../lib/content-type';
import { format404, formatEntries, notAFile } from '../lib/html-formatter';
import registerRoutes from './routes';

export default class {
    init(workbox) {
        registerRoutes(workbox, this);
    }

    // Checks if URI is encoded
    isEncoded(uri) {
        uri = uri || '';

        return uri !== decodeURIComponent(uri);
    }

    // Completely decodes URI
    fullyDecodeURI(uri) {
        while (this.isEncoded(uri)) {
            uri = decodeURIComponent(uri);
        }

        return uri;
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

    // Creates a file from an encoded text
    async createFileFromEncodedText(path) {
        return new Promise((resolve, reject) => {
            var text = pth.basename(path);
            var paths = pth.join(path, '..');
            var fileName = pth.basename(paths);
            var directory = pth.dirname(paths);
            var filePath = pth.join(directory, fileName);

            const createPath = async directory => {
                const result = await this.createPath(directory);
                fs.writeFile(filePath, text, function(err) {
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
            };
            const result = createPath(directory);
        });
    }

    // Makes FileReader Api work with async/await
    // Get file as ArrayBuffer
    async readUploadedFileAsArrayBuffer(inputFile) {
        return new Promise((resolve, reject) => {
            const temporaryFileReader = new FileReader();
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject('Problem parsing input file.');
            };

            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsArrayBuffer(inputFile);
        });
    }

    // Makes FileReader Api work with async/await
    // Get file as DataURL
    async readUploadedFileAsDataURL(inputFile) {
        return new Promise((resolve, reject) => {
            const temporaryFileReader = new FileReader();
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject('Problem parsing input file.');
            };

            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsDataURL(inputFile);
        });
    }

    // Creates a file from an encoded data uri
    async createFileFromEncodedDataURI(path) {
        return new Promise((resolve, reject) => {
            var dataURL = path.substring(path.indexOf('data:'));
            var blob = this.dataURLtoBlob(dataURL);
            var paths = pth.join(path, '../..');
            var fileName = pth.basename(paths);
            var filePath = pth.dirname(paths) + '/';

            const handleImport = async (blob, filePath) => {
                try {
                    const res = await this.createPath(filePath);
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
            handleImport(blob, filePath);
        });
    }

    // Generates a Data URI for the specified file
    async getFileDataURL(path) {
        return new Promise((resolve, reject) => {
            const handle = async () => {
                try {
                    const fileInfo = await this.getFileInfo(path);

                    var contents = fileInfo.body.contents;
                    var file = new File([contents], fileInfo.body.name, {
                        type: fileInfo.type,
                        lastModified: fileInfo.body.lastModified,
                    });

                    const fileDataURI = await this.readUploadedFileAsDataURL(
                        file
                    );

                    resolve({
                        name: fileInfo.body.name,
                        dataurl: fileDataURI,
                    });
                } catch (e) {
                    reject(e);
                }
            };
            handle();
        });
    }

    // Uploads a file into filesystem
    async createFileFromArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            var buf = buffer(file.buffer);
            fs.writeFile(file.path + file.name, buf, function(err) {
                if (err) {
                    return reject({
                        success: false,
                        err: err,
                    });
                }
                resolve({
                    success: true,
                });
            });
        });
    }

    // Uploads array of files into filesystem
    async createFilesFromArrayBuffer(files) {
        const promises = files.map(async file => {
            file.buffer = Object.values(file.buffer);
            file.path = this.fullyDecodeURI(file.path);
            return await this.createFileFromArrayBuffer(file);
        });

        return await Promise.all(promises);
    }

    // Deletes everything in Path
    async deletePath(path) {
        return new Promise((resolve, reject) => {
            sh.rm(path, { recursive: true }, function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(`Successfully removed ${path}.`);
            });
        });
    }

    // Format filesystem
    async clearFileSystem() {
        return new Promise((resolve, reject) => {
            formatFS(function(err) {
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
            sh.mkdirp(path, function(err) {
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
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        sh.ls(path, { recursive: true }, (err, entries) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                type: 'text/html',
                                body: formatEntries(path, entries),
                            });
                        });
                    } else {
                        reject('Path does not link to a Directory.');
                    }
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
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        // Todo: Better error handling needed.
                        return reject('Path does not link to a File.');
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

    // Gets file info
    async getFileInfo(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        // Todo: Better error handling needed.
                        reject(notAFile(path));
                    } else {
                        console.log('7');
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
                }
            });
        });
    }
}
