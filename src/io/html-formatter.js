import path from '../lib/path';
/**
 * Send an Apache-style 404
 */
export const format404 = url => {
    return `<!DOCTYPE html>
            <html><head>
            <title>404 Not Found</title>
            </head><body>
            <h1>Not Found</h1>
            <p>The requested URL ${url} was not found on this server.</p>
            <hr></body></html>`;
};

export const formatEntries = (dirPath, entries) => {
    var len = entries.length,
        output = [];
    for (var i = 0; i < len; i++) {
        let size, filePath;
        if (entries[i].type == 'DIRECTORY') {
            size = entries[i].contents.length;
            filePath =
                '/io/in' +
                path.join(dirPath, encodeURIComponent(entries[i].name));
        } else {
            size = entries[i].size;
            filePath =
                '/io/out' +
                path.join(dirPath, encodeURIComponent(entries[i].name));
        }
        var entry = {
            name: entries[i].name,
            type: entries[i].type,
            size: size,
            path: filePath,
        };
        output.push(JSON.stringify(entry));
    }

    return output;
}