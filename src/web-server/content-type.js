import Filer from 'filer';
const Path = Filer.Path;

export const isMedia = ext => {
    return  ext === '.avi' ||
            ext === '.mpeg' ||
            ext === '.mp4' ||
            ext === '.ogg' ||
            ext === '.webm' ||
            ext === '.mov' ||
            ext === '.qt' ||
            ext === '.divx' ||
            ext === '.wmv' ||
            ext === '.mp3' ||
            ext === '.wav';
};
  
export const isImage = ext => {
    return  ext === '.png' ||
            ext === '.jpg' ||
            ext === '.jpe' ||
            ext === '.pjpg' ||
            ext === '.jpeg'||
            ext === '.gif' ||
            ext === '.bmp' ||
            ext === '.ico';
};

export const getMimeType = path => {
    const ext = Path.extname(path);

    switch(ext) {
    case '.html':
    case '.htmls':
    case '.htm':
    case '.htx':
        return 'text/html';
    case '.ico':
        return 'image/x-icon';
    case '.bmp':
        return 'image/bmp';
    case '.css':
        return 'text/css';
    case '.js':
        return 'text/javascript';
    case '.svg':
        return 'image/svg+xml';
    case '.png':
        return 'image/png';
    case '.jpg':
    case '.jpe':
    case '.jpeg':
        return 'image/jpeg';
    case '.gif':
        return 'image/gif';
    //XXX: Some of these media types can be video or audio, prefer video.
    case '.mp4':
        return 'video/mp4';
    case '.mpeg':
        return 'video/mpeg';
    case '.ogg':
    case '.ogv':
        return 'video/ogg';
    case '.mov':
    case '.qt':
        return 'video/quicktime';
    case '.webm':
        return 'video/webm';
    case '.avi':
    case '.divx':
        return 'video/avi';
    case '.mpa':
    case '.mp3':
        return 'audio/mpeg';
    case '.wav':
        return 'audio/vnd.wave';
    default:
        return 'application/octet-stream';
    }
};
