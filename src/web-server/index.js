import fs from '../lib/fs';
const sh = new fs.Shell();

<<<<<<< HEAD
=======
import { getMimeType } from '../lib/content-type';
import { formatDir } from '../lib/html-formatter';
>>>>>>> 4c855cb0f451c78398b275fc726e20df22a61e5a
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
                    sh.ls(path, (err, entries) => {
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
