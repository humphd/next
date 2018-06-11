#!/usr/bin/env node

/**
 * Download a Linux ISO with Plan 9 resource sharing enabled
 * Also grab the bios from GitHub.
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const isoUrl = 'https://copy.sh/v86/images/linux3.iso';
const biosUrl =
    'https://github.com/copy/v86/blob/master/bios/seabios.bin?raw=true';
const vgaBiosUrl =
    'https://github.com/copy/v86/blob/master/bios/vgabios.bin?raw=true';

// Put all binary files in `dist/terminal/bin` and we'll cache these on travis.
const terminalDir = path.join(__dirname, '..', 'dist', 'terminal', 'bin');
const isoDestPath = path.join(terminalDir, 'linux3.iso');
const biosDestPath = path.join(terminalDir, 'seabios.bin');
const vgaBiosDest = path.join(terminalDir, 'vgabios.bin');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        fs.stat(dest, err => {
            if (err) {
                if (err.code !== 'ENOENT') {
                    return reject(err);
                } else {
                    console.log(`Downloading ${url} to ${dest}...`);
                    request(url)
                        .pipe(fs.createWriteStream(dest))
                        .on('finish', resolve);
                }
            } else {
                console.log(
                    `Skipping download for ${dest}. File already exists`
                );
                return resolve();
            }
        });
    });
};

mkdirp(terminalDir, err => {
    if (err) throw err;

    Promise.all([
        download(isoUrl, isoDestPath),
        download(biosUrl, biosDestPath),
        download(vgaBiosUrl, vgaBiosDest),
    ])
        .then(() => console.log('Done.'))
        .catch(err => console.error(err));
});
