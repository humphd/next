#!/usr/bin/env node

/**
 * Download a Linux ISO with Plan 9 resource sharing enabled
 * Also grab the bios from GitHub.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const isoUrl = 'https://copy.sh/v86/images/linux3.iso';
const biosUrl = 'https://github.com/copy/v86/blob/master/bios/seabios.bin?raw=true';

const terminalDir = path.join(__dirname, '..', 'dist', 'terminal');
const isoDestPath = path.join(terminalDir, 'linux3.iso');
const biosDestPath = path.join(terminalDir, 'seabios.bin');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        fs.stat(dest, err => {
            if(err) {
                if(err.code !== 'ENOENT') {
                    return reject(err);
                } else {
                    console.log(`Downloading ${url} to ${dest}...`);
                    https.get(url, response => {
                        response
                            .pipe(fs.createWriteStream(dest))
                            .on('finish', resolve);
                    });
                }
            } else {
                console.log(`Skipping download for ${dest}. File already exists`);
                return resolve();
            }
        });
    });
};

mkdirp(terminalDir, err => {
    if(err) throw err;

    Promise.all([
        download(isoUrl, isoDestPath),
        download(biosUrl, biosDestPath)
    ])
        .then(() => console.log('Done.'))
        .catch(err => console.error(err));
});
