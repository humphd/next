import { isMedia, isImage, getMimeType } from './content-type';
import iconImage from '../web-server/icons/image2.png';
import iconFolder from '../web-server/icons/folder.png';
import iconMovie from '../web-server/icons/movie.png';
import iconText from '../web-server/icons/text.png';
import iconUnknown from '../web-server/icons/unknown.png';
import iconBack from '../web-server/icons/back.png';
import iconBlank from '../web-server/icons/blank.png';
import Path from './path';

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

// 20-Apr-2004 17:14
const formatDate = d => {
    return `${d.getDate()}-${
        months[d.getMonth()]
    }-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
};

const formatSize = s => {
    const units = ['', 'K', 'M'];
    if (!s) {
        return '-';
    }
    const i = Math.floor(Math.log(s) / Math.log(1024)) | 0;
    return Math.round(s / Math.pow(1024, i), 2) + units[i];
};

const formatRow = (
    icon = iconUnknown,
    alt = '[   ]',
    href,
    name,
    modified,
    size
) => {
    modified = formatDate(new Date(modified));
    size = formatSize(size);

    return `<tr><td valign="top"><img src="${icon}" alt="${alt}"></td><td>
            <a href="${href}">${name}</a></td>
            <td align="right">${modified}</td>
            <td align="right">${size}</td><td>&nbsp;</td></tr>`;
};

const footerClose = '<address>nohost/0.0.2 (Web)</address></body></html>';
export default {
    /**
     * Send an Apache-style 404
     */
    format404: url => {
        return {
            body: `<!DOCTYPE html>
                <html><head>
                <title>404 Not Found</title>
                </head><body>
                <h1>Not Found</h1>
                <p>The requested URL ${url} was not found on this server.</p>
                <hr>${footerClose}`,
            type: 'text/html',
            status: 404,
        };
    },

    /**
     * Send an Apache-style directory listing
     */
    formatDir: (dirPath, entries) => {
        const parent = Path.dirname(dirPath);

        const header = `<!DOCTYPE html>
                        <html><head><title>Index of ${dirPath}</title></head>
                        <body><h1>Index of ${dirPath}</h1>
                        <table><tr><th><img src="${iconBlank}" alt="[ICO]"></th>
                        <th><b>Name</b></th><th><b>Last modified</b></th>
                        <th><b>Size</b></th><th><b>Description</b></th></tr>
                        <tr><th colspan="5"><hr></th></tr>
                        <tr><td valign="top"><img src="${iconBack}" alt="[DIR]"></td>
                        <td><a href="/www${parent}">Parent Directory</a></td><td>&nbsp;</td>
                        <td align="right">  - </td><td>&nbsp;</td></tr>`;

        const footer = `<tr><th colspan="5"><hr></th></tr></table>${footerClose}`;

        const rows = entries
            .map(entry => {
                const ext = Path.extname(entry.name);
                const href = '/www' + Path.join(dirPath, entry.name);
                let icon;
                let alt;

                if (entry.type === 'DIRECTORY') {
                    icon = iconFolder;
                    alt = '[DIR]';
                } else {
                    if (isImage(ext)) {
                        icon = iconImage;
                        alt = '[IMG]';
                    } else if (isMedia(ext)) {
                        icon = iconMovie;
                        alt = '[MOV]';
                    } else {
                        icon = iconText;
                        alt = '[TXT]';
                    }
                }

                return formatRow(
                    icon,
                    alt,
                    href,
                    entry.name,
                    entry.mtime,
                    entry.size
                );
            })
            .join('\n');

        return {
            type: 'text/html',
            status: 200,
            body: header + rows + footer,
        };
    },

    formatFile: ({ path, content }) => {
        return {
            body: content,
            type: getMimeType(path),
            status: 200,
        };
    },

    formatEntries: (dirPath, entries) => {
        var len = entries.length,
            output = [];
        for (var i = 0; i < len; i++) {
            let size, filePath;
            if (entries[i].type == 'DIRECTORY') {
                size = entries[i].contents.length;
                filePath = Path.join(
                    '/io/in',
                    dirPath,
                    encodeURIComponent(entries[i].name)
                );
            } else {
                size = entries[i].size;
                filePath = Path.join(
                    '/www',
                    dirPath,
                    encodeURIComponent(entries[i].name)
                );
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
    },
};
