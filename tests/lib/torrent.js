import fs from '../lib/fs.js'

function readySeed() {
    const ss = new fs.Shell();
    var fileContent = 'main test';
    var fileContent2 = 'directory test';
    var filepath = '/testFile.txt';
    var dirpath = '/test';
    var dirfile = '/dirFile.txt';

    fs.writeFile(filepath, fileContent, err => {
        if (err) {
            writeError(err, filepath);
            return false;
        }
    });

    ss.mkdirp(dirpath, err => {
        if (err) {
            writeError(err, dirpath);
            return false;
        }
    });

    fs.writeFile(dirpath + dirfile, fileContent2, err => {
        if (err) {
            writeError(err, dirpath + dirfile);
            throw err;
        }
    });
    return true;
}

module.exports = readySeed;

function readyDownload() {
    fs.stat('/textFile.txt', function(err, stat) {
        console.log(stat);
        console.log(err);
        if (err.code == 'ENOENT') {
            return false;
        } else {
            return false;
        }
    });

    fs.stat('/test/dirFile.txt', function(err, stat) {
        console.log(stat);
        console.log(err);
        if (err.code == 'ENOENT') {
            return false;
        } else {
            return false;
        }
    });
    return true;
}

module.exports = readyDownload;
