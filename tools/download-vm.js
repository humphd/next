#!/usr/bin/env node

/**
 * Download a Linux ISO with Plan 9 resource sharing enabled
 * Also grab the bios from GitHub.
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

// Put all binary files in `dist/terminal/bin` and we'll cache these on travis.
const terminalDir = path.join(__dirname, '..', 'dist', 'terminal', 'bin');

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

    request.get(
        {
            url: 'https://api.github.com/repos/humphd/next/releases/latest',
            json: true,
            headers: {
                'User-Agent': 'Request-Promise',
            },
        },
        (err, resp, release) => {
            if (err) throw err;
            if (resp.statusCode !== 200)
                throw `Unable to get latest release. ${resp.statusMessage}`;
            Promise.all(
                release.assets.map(el =>
                    download(
                        el.browser_download_url,
                        path.join(
                            terminalDir,
                            path.basename(el.browser_download_url)
                        )
                    )
                )
            )
                .then(() => console.log('Done'))
                .catch(err => console.error(err));
        }
    );
});
