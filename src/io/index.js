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

    // Uploads a file into filesystem
    async upload(file) {
        return new Promise((resolve, reject) => {
            var buffer = new Filer.Buffer(file.buffer);
            fs.writeFile(file.path + file.name, buffer, function(err) {
                if (err) reject({ success: false, err: err });
                else resolve({ success: false, err: 'Error: ' + file.name });
            });
        });
    }

    // Uploads array of files into filesystem
    async uploadFiles(files) {
        const promises = files.map(async file => {
            file.buffer = Object.values(file.buffer);
            const result = await this.upload(file);
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
