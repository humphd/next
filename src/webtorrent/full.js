//var fs = require('fs')
var filer = require('filer');
var Path = filer.Path;

// fs.readFile('...')

// var inside = false;

//document.getElementById("btnDownload").addEventListener("click", gotMagnet);

var client = new WebTorrent();
var fs = new filer.FileSystem();

//console.log(document.getElementById("torrentId").value);

// HTML elements
var $body = document.body;
var $progressBar = document.querySelector('#progressBar');
var $numPeers = document.querySelector('#numPeers');
var $downloaded = document.querySelector('#downloaded');
var $total = document.querySelector('#total');
var $remaining = document.querySelector('#remaining');
var $uploadSpeed = document.querySelector('#uploadSpeed');
var $downloadSpeed = document.querySelector('#downloadSpeed');

//var magnetURI = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
//var magnetURI = 'magnet:?xt=urn:btih:efd9ed35cd3e4afd9d33c17f9389ef8af166cb1f&dn=ss.txt&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'
//var torrentId = 'https://webtorrent.io/torrents/sintel.torrent'

//var magnetURI = document.getElementById("torrentId").value;
var magnetURI =
    'magnet:?xt=urn:btih:158f9f68f721f86105348d1825e9865576b0fc94&dn=file.txt&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';
console.log('Downloading from: ' + magnetURI);

// Download the torrent
client.add(magnetURI, function(torrent) {
    // Torrents can contain many files. Let's use the .mp4 file
    var file = torrent.files.find(function(file) {
        return file.name.endsWith('.txt');
    });

    // Stream the file in the browser
    file.appendTo('#output');

    // Trigger statistics refresh
    torrent.on('done', onDone);
    setInterval(onProgress, 500);
    onProgress();

    torrent.on('done', function() {
        //fs.createReadStream().pipe(fs.createWriteStream('~/downloads/ss.txt')).on('close', function(){console.log('done!')})
        torrent.files.forEach(function(file) {
            var filename = Path.join('/', file.path);
            console.log(filename);
            file.getBuffer(function(err, buffer) {
                console.log(err + '   ' + buffer);
                if (err) throw err;
                buffer.toArrayBuffer = function() {
                    return buffer.buffer;
                };
                console.log('im further');
                fs.writeFile(filename, new filer.Buffer(buffer), function(err) {
                    if (err) {
                        console.log(
                            'Error writing file, error was ',
                            err,
                            filename
                        );
                    } else {
                        console.log('Wrote to ', filename);
                    }
                });
            });
        });
    });

    // Statistics
    function onProgress() {
        //document.getElementById("hero").style.visibility = "visible";

        // Peers
        $numPeers.innerHTML =
            torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers');

        // Progress
        var percent = Math.round(torrent.progress * 100 * 100) / 100;
        $progressBar.style.width = percent + '%';
        $downloaded.innerHTML = prettyBytes(torrent.downloaded);
        $total.innerHTML = prettyBytes(torrent.length);

        // Remaining time
        var remaining;
        if (torrent.done) {
            remaining = 'Done.';
        } else {
            remaining = moment
                .duration(torrent.timeRemaining / 1000, 'seconds')
                .humanize();
            remaining =
                remaining[0].toUpperCase() +
                remaining.substring(1) +
                ' remaining.';
        }
        $remaining.innerHTML = remaining;

        // Speed rates
        $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s';
        $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s';
    }
    function onDone() {
        $body.className += ' is-seed';
        onProgress();
    }

    function download(text, name, type) {
        console.log('i am starting to download the file');
        var a = document.getElementById(file);
        var file = new Blob([text], { type: type });
        //a.href = URL.createObjectURL(file);
        //a.download = name;
        file.download;
        console.log('i am done!');
    }
});

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
