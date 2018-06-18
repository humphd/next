import fs from '../lib/fs';
const sh = new fs.Shell();
import WebTorrent from 'webtorrent';

var client = new WebTorrent();
const files = [];

document.getElementById('btnSeed').addEventListener('click', startSeeding);
console.log('inside of export.js!');

function processPath(path, next) {
    if (path.endsWith('/')) {
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
}

function startSeeding() {
    sh.find('/', { exec: processPath }, err => {
        if (err) {
            console.error(err);
            document.getElementById('magnetURI').innerHTML =
                'Error seeding files';
            return;
        }
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
            console.error(err);
        }
    });
}
