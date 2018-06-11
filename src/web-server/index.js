import fs from '../lib/fs';
const sh = new fs.Shell();

import { getMimeType } from './content-type';
import { formatDir } from './html-formatter';
import registerRoute from './routes';

export default class {
    init(workbox) {
        registerRoute(workbox, this);
    }

    async serve(path) {
        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                // If this is a dir, show a dir listing
                if (stats.isDirectory()) {
                    sh.ls(path, (err, entries) => {
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
            });
        });
    }
}
