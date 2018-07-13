import { getMimeType } from './content-type';

export default {
    format404: url => {
        return new Response(
            `The requested URL ${url} was not found on this server.`,
            {
                status: 404,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' },
            }
        );
    },

    formatDir: (dirPath, entries) => {
        return new Response(JSON.stringify(entries), {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' },
        });
    },

    formatFile: ({ content, path }) => {
        return new Response(content, {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': getMimeType(path) },
        });
    },
};
