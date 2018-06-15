import fs from '../lib/fs';
const sh = new fs.Shell();
import WebTorrent from 'webtorrent';

//route wil lcall this function
export default () =>
    new Promise((resolve, reject) => {
        const client = new WebTorrent();

        const files = [];
        function startSeed() {}

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
        sh.find('/', { exec: processPath }, function(err) {
            if (err) {
                console.error(err);
                return reject(err);
            }

            client.seed(files, function(torrent) {
                // console.log(typeof files);
                // document.getElementById('descMagnet').innerHTML =
                //     'Your torrent magnet is:';
                // document.getElementById('myMagnet').innerHTML =
                //     torrent.magnetURI;
                // console.log('Client is seeding ' + torrent.magnetURI);
                resolve(torrent.magnetURI);
            });
        });

        //get list of all files in dir -> shell.ls
    });
