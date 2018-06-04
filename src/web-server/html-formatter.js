import { isMedia, isImage } from './content-type';
import iconImage from './icons/image2.png';
import iconFolder from './icons/folder.png';
import iconMovie from './icons/movie.png';
import iconText from './icons/text.png';
import iconUnknown from './icons/unknown.png';
import iconBack from './icons/back.png';
import iconBlank from './icons/blank.png';
import Filer from 'filer';
const Path = Filer.Path;

// 20-Apr-2004 17:14
const formatDate = d => {
    return `${d.getDay()}-${d.getMonth()}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
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
            <hr>
            <address>nohost/0.0.2 (Web) Server</address>
            </body></html>`;
};

/**
 * Send an Apache-style directory listing
 */
export const formatDir = (path, entries) => {
    const parent = Path.dirname(path);

    const header = `<!DOCTYPE html>
                    <html><head><title>Index of ${path}</title></head>
                    <body><h1>Index of ${path}</h1>
                    <table><tr><th><img src="${iconBlank}" alt="[ICO]"></th>
                    <th><a href="#">Name</a></th><th><a href="#">Last modified</a></th>
                    <th><a href="#">Size</a></th><th><a href="#">Description</a></th></tr>
                    <tr><th colspan="5"><hr></th></tr>
                    <tr><td valign="top"><img src=${iconBack}" alt="[DIR]"></td>
                    <td><a href="/www/${parent}">Parent Directory</a></td><td>&nbsp;</td>
                    <td align="right">  - </td><td>&nbsp;</td></tr>`;

    const footer = `<tr><th colspan="5"><hr></th></tr>
                    </table><address>nohost/0.0.1 (Web)</address>
                    </body></html>`;

    const rows = entries.map(entry => {
        const name = Path.basename(entry.path);
        const ext = Path.extname(entry.path);
        const href = '/www/' + Path.join(path, entry.path);
        let icon;
        let alt;

        if (entry.type === 'DIRECTORY') {
            icon = iconFolder;
            alt = '[DIR]';
        } else {
            // file
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

        return formatRow(icon, alt, href, name, entry.modified, entry.size);
    });

    return header + rows + footer;
};
