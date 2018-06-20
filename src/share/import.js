import fs from '../lib/fs';
import Buffer from '../lib/buffer';
import Path from '../lib/path';
import WebTorrent from 'webtorrent';
const sh = new fs.Shell();

document.getElementById('torrentId').value = window.location.search.substring(
    1
);
document.getElementById('btnDownload').addEventListener('click', startDownload);

const downloadAllTorrentFiles = torrent =>
    Promise.all(
        torrent.files.map(
            file =>
                new Promise((resolve, reject) => {
                    console.log('file: ', file);
                    var filename = Path.join('/', file.path);
                    file.getBuffer((err, buffer) => {
                        if (err) {
                            writeError();
                            return reject(err);
                        }
                        sh.mkdirp(Path.dirname(filename), err => {
                            if (err) {
                                console.error(
                                    'Error writing file, error was ',
                                    err,
                                    filename
                                );
                                writeError();
                                return reject(err);
                            }
                            fs.writeFile(filename, new Buffer(buffer), err => {
                                if (err) {
                                    console.error(
                                        'Error writing file, error was ',
                                        err,
                                        filename
                                    );
                                    writeError();
                                    return reject(err);
                                }
                                console.log('Wrote to ', filename);
                                resolve();
                            });
                        });
                    });
                })
        )
    );

function startDownload() {
    let magnetURI = document.getElementById('torrentId').value;

    if (!magnetURI) {
        console.log('Need a torrent magnet link to proceed.');
        return;
    }

    const client = new WebTorrent();

    //Download the torrent
    client.add(magnetURI, function(torrent) {
        torrent.on('done', async () => {
            await downloadAllTorrentFiles(torrent);
            document.getElementById('isComplete').innerHTML =
                'Torrent download is complete';
            console.log('All torrents are complete');
        });
    });
}

function writeError() {
    document.getElementById('isComplete').innerHTML =
        'Error downloading files!';
}
