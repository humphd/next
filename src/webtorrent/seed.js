var dragDrop = require('drag-drop');
var WebTorrent = require('webtorrent');

var client = new WebTorrent();

var files;

// When user drops files on the browser, create a new torrent and start seeding it!
dragDrop('body', function(drop) {
    files = drop;
    populateList();
});

function handleFileSelect(evt) {
    files = evt.target.files; // FileList object
    populateList();
}

function populateList() {
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; (f = files[i]); i++) {
        output.push(
            '<li><strong>',
            escape(f.name),
            '</strong> (',
            f.type || 'n/a',
            ')',
            '</li>'
        );
    }
    document.getElementById('list').innerHTML =
        '<ul>' + output.join('') + '</ul>';
}

document
    .getElementById('files')
    .addEventListener('change', handleFileSelect, false);

document.getElementById('btnSeed').addEventListener('click', startSeed);

function startSeed() {
    if (files == null) {
        console.log('Need a torrent magnet link to proceed.');
        return;
    }
    client.seed(files, function(torrent) {
        console.log(typeof files);
        document.getElementById('descMagnet').innerHTML =
            'Your torrent magnet is:';
        document.getElementById('myMagnet').innerHTML = torrent.magnetURI;
        console.log('Client is seeding ' + torrent.magnetURI);
    });
}
