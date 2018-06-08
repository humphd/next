import mime from 'mime-types';

export const isMedia = ext => {
    return (
        ext === '.avi' ||
        ext === '.mpeg' ||
        ext === '.mp4' ||
        ext === '.ogg' ||
        ext === '.webm' ||
        ext === '.mov' ||
        ext === '.qt' ||
        ext === '.divx' ||
        ext === '.wmv' ||
        ext === '.mp3' ||
        ext === '.wav'
    );
};

export const isImage = ext => {
    return (
        ext === '.png' ||
        ext === '.jpg' ||
        ext === '.jpe' ||
        ext === '.pjpg' ||
        ext === '.jpeg' ||
        ext === '.gif' ||
        ext === '.bmp' ||
        ext === '.ico'
    );
};

export const getMimeType = filename => {
    return mime.lookup(filename) || 'application/octet-stream';
};
