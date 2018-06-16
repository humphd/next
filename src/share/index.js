import fs from '../lib/fs';
import Filer from '../../node_modules/filer/dist/filer';
const sh = new fs.Shell();

import { formatIndex } from '../lib/html-formatter';
import registerRoute from './routes';

export default class {
    init(workbox) {
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
