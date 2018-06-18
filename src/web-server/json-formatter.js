import fs from '../lib/fs';

export default class {
    format404(url) {
        return {
            body: `The requested URL ${url} was not found on this server.`,
            type: 'application/json',
            status: 404,
        };
    }

    formatDir(dirPath, entries) {
        return {
            body: JSON.stringify(entries),
            type: 'application/json',
            status: 200,
        };
    }

    formatFile(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                resolve({
                    type: 'application/json',
                    body: JSON.stringify(stats),
                    status: 200,
                });
            });
        });
    }
}
