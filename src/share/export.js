import fs from '../lib/fs';
const sh = new fs.Shell();
import WebTorrent from 'webtorrent';

console.log('I am inside of export.js');

var client = new WebTorrent();
const files = [];

document.getElementById('btnSeed').addEventListener('click', startSeeding);

function processPath(path, next) {
    if (path.endsWith('/')) {
        console.log('Found dir: ', path);
        return next();
    }
    fs.readFile(path, function(err, data) {
        if (err) {
            console.error(err);
            return next(err);
        }
        console.log('Inside of readFile ', path);
        data.name = path;
        files.push(data);
        next();
    });
}

function startSeeding() {
  console.log('inside of startSeeding');
    sh.find('/', { exec: processPath }, err => {
        if (err) console.error(err);
        console.log('inside of export.js.sh.find');
        try {
            client.seed(files, function(torrent) {
                document.getElementById('magnetURI_p').innerHTML =
                    'Magnet URI:';
                document.getElementById('magnetURI').innerHTML =
                    torrent.magnetURI;
                console.log('magnetURI=', torrent.magnetURI);
            });
        } catch (err) {
            document.getElementById('magnetURI_p').innerHTML = '';
            document.getElementById('magnetURI').innerHTML = '';
            console.log('seed err:', err);
        }
    });
}
