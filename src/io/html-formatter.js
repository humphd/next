import { isMedia, isImage } from './content-type';
import iconImage from './icons/image2.png';
import iconFolder from './icons/folder.png';
import iconMovie from './icons/movie.png';
import iconText from './icons/text.png';
import iconUnknown from './icons/unknown.png';
import iconBack from './icons/back.png';
import iconBlank from './icons/blank.png';
import path from '../lib/path';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 20-Apr-2004 17:14
const formatDate = d => {
    return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
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

const footerClose = '</html>';

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
            <hr>${footerClose}`;
};

/**
 * Send an Apache-style directory listing
 */
export const formatDir = (dirPath, entries) => {
    const parent = path.dirname(dirPath);

    const header = `<!DOCTYPE html>
                    <html>
                        <head>
                            <title>Index of IO</title>
                            <link href="/css/styles.css" rel="stylesheet"/>
                        </head>`;

    var len = entries.length, output = [];
    for(var i = 0; i < len; i++) {
        let size;
        if ( entries[i].type == "DIRECTORY" ) {
            size = entries[i].contents.length;
        } else {
            size = entries[i].size;
        }
        var entry = { "name": entries[i].name, "type": entries[i].type, "size": size, "path": '/io/in' + path.join(dirPath, entries[i].name) };
        output.push(JSON.stringify(entry));
    }

    const body = `  <body>
                        <div class="filemanager">

                            <div class="breadcrumbs"></div>

                            <ul class="data"></ul>

                            <div class="nothingfound">
                                <div class="nofiles"></div>
                                <span>No files here.</span>
                            </div>

                        </div>

                        <script> 
                            let entries = '${output}';

                            if ( entries != '') {
                                entries = entries
                                            .split('},')
                                            .map(entry => { if (entry.substr(-1) != '}') entry += '}'; return JSON.parse(entry) });
                            }
                            
                            console.log(entries);
                        </script>
                        <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
                        <script src="/scripts/in.js"></script>
                        <script src="/scripts/script.js"></script>
                    </body>`;

    const footer = `</html>`;

    return header + body + footer;
};
