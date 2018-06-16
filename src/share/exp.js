import fs from '../lib/fs';
const sh = new fs.Shell();
// var WebTorrent = require('webtorrent')
import WebTorrent from 'webtorrent';

//route will call this function
export default () =>
    new Promise((resolve, reject) => {
        console.log('I am inside of exp promise #1');
        const client = new WebTorrent();

        const files = [];

        function processPath(path, next) {
            // Process the path somehow, in this case we print it.
            // Dir paths end with /
            if (path.endsWith('/')) {
                console.log('Found dir: ' + path);
                return next();
            }
            fs.readFile(path, function(err, data) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                data.name = path;
                files.push(data);
                next();
            });
            // All done, let the process continue by invoking second arg:
        }

        // Get every path (NOTE: no name or regex provided) below the root, depth first
        sh.find('/', { exec: processPath }, err => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            console.log('Inside of exp.sh.find');
            try {
                client.seed(files, function(torrent) {
                    console.log('magnetUR= ' + torrent.magnetURI);
                    resolve(torrent.magnetURI);
                });
            } catch (err) {
                console.log('seed err: ', err);
            }
        });

        //get list of all files in dir -> shell.ls
    });
