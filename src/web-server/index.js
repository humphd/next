import Filer from 'filer';
import { formatDir, formatFile } from 'html-formatters';
import registerRoute from 'routes';

export default class {
    constructor() {
        this.fs = new Filer.FileSystem();
        this.sh = this.fs.shell();
    }

    init(workbox) {
        registerRoute(workbox, this);
    }

    async serve(path) {
        const fs = this.fs;
        const sh = this.sh;

        // TODO: need to add promises to Filer
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err) {
                    return reject(err);
                }

                // If this is a dir, show a dir listing
                if(stats.isDirectory()) {
                    sh.ls(path, (err, entries) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(formatDir(path, entries));
                    });
                } else {
                    fs.readFile(path, 'utf8', (err, contents) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(formatFile(path, contents));
                    });
                }
            });    
        });
    }
}
