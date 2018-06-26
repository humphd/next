import fs from '../lib/fs';
import Buffer from '../lib/buffer';
import Path from '../lib/path';
import WebTorrent from 'webtorrent';
import magnet from 'magnet-uri';

// Look for a magnetURI inside of the window URL, if exists, place into the field
let magnetParsed = window.location.search.substring(1);
if (magnetParsed != '') {
    let result = parseMagnet(magnetParsed);
    if (result) document.getElementById('torrentId').value = magnetParsed;
}

document.getElementById('btnDownload').addEventListener('click', startDownload);

// Get bufer and download all items
const downloadAllTorrentFiles = torrent =>
    Promise.all(
        torrent.files.map(
            file =>
                new Promise((resolve, reject) => {
                    const sh = new fs.Shell();
                    let filename = Path.join('/', file.path);
                    file.getBuffer((err, buffer) => {
                        if (err) {
                            writeError(err, filename);
                            return reject(err);
                        }
                        sh.mkdirp(Path.dirname(filename), err => {
                            if (err) {
                                writeError(err, filename);
                                return reject(err);
                            }
                            fs.writeFile(filename, new Buffer(buffer), err => {
                                if (err) {
                                    writeError(err, filename);
                                    return reject(err);
                                }
                                console.log('Wrote to ', filename);
                                document.getElementById(
                                    'btnDownload'
                                ).disabled = false;
                                resolve();
                            });
                        });
                    });
                })
        )
    );

function startDownload() {
    document.getElementById('btnDownload').disabled = true;

    let magnetURI = document.getElementById('torrentId').value;
    let result = parseMagnet(magnetURI);

    if (!result) {
        console.log('Need a torrent magnet link to proceed.');
        document.getElementById('isComplete').innerHTML =
            'Incorrect torrent magnet';
        return;
    }

    const client = new WebTorrent();

    // Download torrent
    client.add(magnetURI, torrent => {
        document.getElementById('isComplete').innerHTML =
            'Torrent is downloading';

        torrent.on('error', err => {
            document.getElementById('isComplete').innerHTML =
                'Error seeding file';
            console.error(err);
            document.getElementById('btnDownload').disabled = false;
        });

        torrent.on('done', () => {
            downloadAllTorrentFiles(torrent);
            document.getElementById('isComplete').innerHTML =
                'Torrent download is complete';
            document.getElementById('btnDownload').disabled = false;
            console.log('All torrents are complete');
        });
    });
}

// Parse the magnetURI, is valid, place into the text field
function parseMagnet(magnetURI) {
    let parsed = magnet(magnetURI);

    if (parsed === null || parsed === '') {
        return false;
    }

    document.getElementById('torrentId').value = magnetURI;
    return true;
}

function writeError(err, filename) {
    console.error('Error writing file, error was ', err, filename);

    document.getElementById('isComplete').innerHTML =
        'Error downloading files!';
}
