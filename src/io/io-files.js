import fs from '../lib/fs';
import buffer from '../lib/buffer';
import pth from '../lib/path';

// Makes FileReader Api work with async/await
// Get file as ArrayBuffer
export const blobToBuffer = async inputFile => {
    return new Promise((resolve, reject) => {
        const temporaryFileReader = new FileReader();
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject('Problem parsing input file.');
        };

        temporaryFileReader.onload = () => {
            resolve(new Int8Array(temporaryFileReader.result));
        };
        temporaryFileReader.readAsArrayBuffer(inputFile);
    });
};

// Makes FileReader Api work with async/await
// Get file as DataURL
export const fileToDataURI = async inputFile => {
    return new Promise((resolve, reject) => {
        const temporaryFileReader = new FileReader();
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject('Problem parsing input file.');
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsDataURL(inputFile);
    });
};

// Uploads a file into filesystem
export const importFile = async file => {
    return new Promise((resolve, reject) => {
        var buf = buffer(file.buffer);
        fs.writeFile(file.path, buf, err => {
            if (err) {
                return reject({
                    success: false,
                    err: err,
                });
            }
            resolve({
                success: true,
                path: pth.dirname(file.path),
            });
        });
    });
};
