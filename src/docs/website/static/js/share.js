import fs from '../lib/fs';
import Buffer from '../lib/buffer';
import Path from '../lib/path';
import WebTorrent from 'webtorrent';
import magnet from 'magnet-uri';

alert('Hello sankar');

// Look for a magnetURI inside of the window URL, if exists, place into the field
let magnetParsed = window.location.search.substring(1);
if (magnetParsed != '') {
    let result = parseMagnet(magnetParsed);
    if (result) document.getElementById('torrentId').value = magnetParsed;
}

document.getElementById('btnDownload').addEventListener('click', startDownload);
document.getElementById('btnSeed').addEventListener('click', startSeed);

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
    alert('Hello sankar 2');
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
    var $progressBar = document.querySelector('#progressBar');
    var $numPeers = document.querySelector('#numPeers');
    var $downloaded = document.querySelector('#downloaded');
    var $total = document.querySelector('#total');
    var $remaining = document.querySelector('#remaining');
    var $uploadSpeed = document.querySelector('#uploadSpeed');
    var $downloadSpeed = document.querySelector('#downloadSpeed');

    // Human readable bytes util
    function prettyBytes(num) {
        var exponent,
            unit,
            neg = num < 0,
            units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if (neg) num = -num;
        if (num < 1) return (neg ? '-' : '') + num + ' B';
        exponent = Math.min(
            Math.floor(Math.log(num) / Math.log(1000)),
            units.length - 1
        );
        num = Number((num / Math.pow(1000, exponent)).toFixed(2));
        unit = units[exponent];
        return (neg ? '-' : '') + num + ' ' + unit;
    }

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

        // Trigger statistics refresh
        setInterval(onProgress, 500);
        onProgress();

        // Statistics
        function onProgress() {
            // Peers
            $numPeers.innerHTML =
                torrent.numPeers +
                (torrent.numPeers === 1 ? ' peer' : ' peers');

            // Progress
            var percent = Math.round(torrent.progress * 100 * 100) / 100;
            $progressBar.innerHTML = percent + '%';
            $downloaded.innerHTML = prettyBytes(torrent.downloaded);
            $total.innerHTML = prettyBytes(torrent.length);

            // Remaining time
            var remaining;
            if (torrent.done) {
                remaining = 'Done.';
            } else {
                // remaining = moment
                //     .duration(torrent.timeRemaining / 1000, 'seconds')
                //     .humanize();
                remaining =
                    remaining[0].toUpperCase() +
                    remaining.substring(1) +
                    ' remaining.';
            }
            $remaining.innerHTML = remaining;

            // Speed rates
            $downloadSpeed.innerHTML =
                prettyBytes(torrent.downloadSpeed) + '/s';
            $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s';
        }
    });
}

function startSeed() {
    const files = [];
    const torrent = new WebTorrent();
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

        torrent.seed(files, { name: '/' }, torrent => {
            document.getElementById('magnetProgress').innerHTML =
                'Magnet is seeding';
            document.getElementById('magnetURI_p').innerHTML = 'Magnet URI:';
            document.getElementById('magnetURI').innerHTML = torrent.magnetURI;
        });

        torrent.on('error', err => {
            document.getElementById('magnetProgress').innerHTML =
                'Error seeding file';
            document.getElementById('magnetURI').innerHTML = '';
            console.error(err);
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
