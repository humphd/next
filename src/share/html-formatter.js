import path from '../lib/path';

//import style from '../css/filename.css';

const footerClose = '<address>nohost/0.0.2 (Web)</address></body></html>';

/**
 * Send an Apache-style 404
 */
export const format404 = url => {
    return `<!DOCTYPE html>
    <html><head>
    <title>404 Not Found</title>
    </head>
    <body>
    <h1>Not Found</h1>
    <p>The requested URL ${url} was not found on this server.</p>
    </hr>${footerClose}`;
};

/**
 * Send an Apache-style directory listing
 */
export const formatIndex = () => {
    const header = `<!DOCTYPE html>
                    <html><head><title>Index of Share</title></head>`;

    const body = `<body>
                    <ul>
                        <li>
                        <a href="import.html">Import</a> - import files</li>
                        <li>
                        <a href="export.html">Export</a> - export files</li>
                    </ul>

                    <script src="mainjs.js"></script>
                    <script src="index.js"></script>`;

    return header + body + footerClose;
};
