// Checks if URI is encoded
export const isEncoded = uri => {
    if (!uri) {
        return false;
    }
    return uri !== decodeURIComponent(uri);
};

// Completely decodes URI
export const fullyDecodeURI = uri => {
    while (isEncoded(uri)) {
        uri = decodeURIComponent(uri);
    }

    return uri;
};

export const formatSize = s => {
    const units = ['', 'K', 'M'];
    if (!s) {
        return '-';
    }
    const i = Math.floor(Math.log(s) / Math.log(1024)) | 0;
    return Math.round(s / Math.pow(1024, i), 2) + units[i];
};
