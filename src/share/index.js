import fs from '../lib/fs';
import Filer from '../../node_modules/filer/dist/filer';
const sh = new fs.Shell();

import { getMimeType } from './content-type';
import { formatDir } from './html-formatter';
import registerRoute from './routes';

export default {
    init: workbox => {
        console.log('hello world...');
        registerRoute(workbox, this);
    },
};
