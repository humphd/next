'use strict';

import JSZip from 'jszip';
import fs from '../lib/fs';
import Path from '../lib/path';

// Zip specific file or folder path (defaults to `/`).
export default async (path = '/') => {
    const zip = new JSZip();

    const addFile = filename =>
        new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    return reject(err);
                }

                zip.file(filename, data.buffer, { binary: true });
                resolve(data);
            });
        });

    const addDir = dirname =>
        new Promise((resolve, reject) => {
            fs.readdir(dirname, (err, entries) => {
                if (err) {
                    return reject(err);
                }
                // Add the directory itself
                zip.folder(dirname);

                // Add all children of this dir, too
                Promise.all(
                    entries.map(entry => add(Path.join(dirname, entry)))
                ).then(resolve, reject);
            });
        });

    const add = path =>
        new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }

                const addFn = stats.isDirectory() ? addDir : addFile;
                addFn(path).then(resolve, reject);
            });
        });

    try {
        await add(path);
        return await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6,
            },
        });
    } catch (err) {
        throw err;
    }
};
