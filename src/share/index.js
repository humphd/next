import fs from '../lib/fs';
import Filer from '../../node_modules/filer/dist/filer';
const sh = new fs.Shell();

import { getMimeType } from './content-type';
import { formatIndex } from './html-formatter';
import registerRoute from './routes';

export default class {
    init(workbox) {
        console.log('I am inside of index.js');
        registerRoute(workbox, this);
    }

    async torrent() {
        return new Promise((resolve, reject) => {
            resolve({
                type: 'text/html',
                body: formatIndex(),
            });
        });
    }
}
