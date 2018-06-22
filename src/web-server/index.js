import fs from '../lib/fs';
const sh = new fs.Shell();

import registerRoute from './routes';

export default class {
    init(workbox) {
        registerRoute(workbox, this);
    }

    serve(path, formatter) {
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
                        resolve(formatter.formatDir(path, entries));
                    });
                } else {
                    fs.readFile(path, async (err, content) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(
                            formatter.formatFile({
                                path,
                                content,
                                stats,
                            })
                        );
                    });
                }
            });
        });
    }
}
