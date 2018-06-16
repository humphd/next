import fs from '../lib/fs';
import Buffer from '../lib/buffer';
import Path from '../lib/path';
// var WebTorrent = require('webtorrent');
import WebTorrent from 'webtorrent';
const sh = new fs.Shell();

const downloadAllTorrentFiles = torrent =>
    Promise.all(
        torrent.files.map(
            file =>
                new Promise((resolve, reject) => {
                    var filename = Path.join('/', file.path);
                    console.log(filename);
                    file.getBuffer((err, buffer) => {
                        console.log(err, buffer);
                        if (err) {
                            return reject(err);
                        }
                        fs.writeFile(filename, new Buffer(buffer), err => {
                            if (err) {
                                console.error(
                                    'Error writing file, error was ',
                                    err,
                                    filename
                                );
                                return reject(err);
                            } else {
                                console.log('Wrote to ', filename);
                                resolve();
                            }
                        });
                    });
                })
        )
    );

export default magnetURI =>
    new Promise((resolve, reject) => {
        console.log('I am inside of imp promise');
        const client = new WebTorrent();

        console.log('webtorrent');

        console.log('Downloading from: ' + magnetURI);

        //Download the torrent
        client.add(magnetURI, function(torrent) {
            console.log('inside of client.add');
            torrent.on('done', async () => {
                console.log('inside of torrent.on');
                // promise.all(elements)

                await downloadAllTorrentFiles(torrent);
                console.log('All torrents are complete');
                // resolve('import is resolved');

                // function download(text, name, type) {
                //     var a = document.getElementById(file);
                //     var file = new Blob([text], { type: type });
                //     //a.href = URL.createObjectURL(file);
                //     //a.download = name;
                //     file.download;
                //     console.log('i am done!');
                // }
            });
        });
    });
