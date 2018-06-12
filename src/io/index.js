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

    async upload(file) {
        return new Promise((resolve, reject) => {
            var buffer = new Filer.Buffer(file.buffer);
            fs.writeFile(file.path+file.name, buffer, function (err) {
                if (err) throw err;
                resolve({
                    type: 'text/html',
                    body: "yes"
                });
            });
        });
    }

    async uploadFiles(files) {
        for (const file of files ) {
            file.buffer = Object.values(file.buffer);
            const result = await this.upload(file);
        }
    }

    async serve(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    fs.mkdir(path, function(err) {
                        if(err) return reject(err);

                        serve(path);
                    });
                } else {
                    // If this is a dir, show a dir listing
                    if (stats.isDirectory()) {
                        sh.ls(path, { recursive: true }, (err, entries) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                type: 'text/html',
                                body: formatDir(path, entries)
                            });
                        });
                    } else {
                        fs.readFile(path, (err, contents) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve({
                                type: getMimeType(path),
                                body: contents
                            });
                        });
                    }
                }
            });
        });
    }
}
