import fs from '../lib/fs';
import WebTorrent from 'webtorrent';

window.onload = () => {
    const files = [];
    const client = new WebTorrent();
    const sh = new fs.Shell();

    function processPath(path, next) {
        if (path.endsWith('/')) {
            return next();
        }
        fs.readFile(path, (err, data) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            data.name = path;
            files.push(data);
            next();
        });
    }

    sh.find('/', { exec: processPath }, err => {
        if (err) {
            console.error(err);
            document.getElementById('magnetURI').innerHTML =
                'Error seeding files';
            return;
        }

        client.seed(files, { name: '/' }, torrent => {
            document.getElementById('magnetProgress').innerHTML =
                'Magnet is seeding';
            document.getElementById('magnetURI_p').innerHTML = 'Magnet URI:';
            document.getElementById('magnetURI').innerHTML = torrent.magnetURI;
        });

        client.on('error', err => {
            document.getElementById('magnetProgress').innerHTML =
                'Error seeding file';
            document.getElementById('magnetURI').innerHTML = '';
            console.error(err);
        });
    });
};
