var dragDrop = require('drag-drop');
var WebTorrent = require('webtorrent');

var client = new WebTorrent();

// When user drops files on the browser, create a new torrent and start seeding it!
dragDrop('body', function(files) {
    client.seed(files, function(torrent) {
        document.getElementById('descMagnet').innerHTML =
            'Your torrent magnet is:';
        document.getElementById('myMagnet').innerHTML = torrent.magnetURI;
        console.log('Client is seeding ' + torrent.magnetURI);
    });
});
