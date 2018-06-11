import fs from '../lib/fs';
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

    async createPath() {
        // Create /home and then /home/carl directories
        // fs.mkdir('/home/sam', function(err) {
        //     if(err) throw err;
        // });

        // fs.mkdir('/home/jerry/folder1', function(err) {
        //     if(err) throw err;
        // });

        // // Write UTF8 text file
        // fs.writeFile('/home/jerry/myfile2.txt', "...data...", function (err) {
        //     if (err) throw err;
        // });
    }

    async upload(file) {
        return new Promise((resolve, reject) => {
            fs.writeFile('/home/' + file.name, file.buffer, function (err) {
                if (err) throw err;
                resolve({
                    type: 'text/html',
                    body: "yes"
                });
            });
        });
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
