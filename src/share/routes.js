import { format404 } from './html-formatter';
import receiveTorrent from './imp';
import buildTorrent from './exp';

const importRegex = /\/import(\/*)/;
const exportRegex = /\/export(\/*)/;

export default (workbox, share) => {
    workbox.routing.registerRoute(
        importRegex,
        async ({ url }) => {
            console.log('inside of import');
            exit;
            const path = url.pathname.match(importRegex)[1];
            let body, type, status;
            try {
                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = format404(path);
                status = 404;
            }

            const init = {
                status,
                statusText: 'OK',
                headers: { 'Content-Type': type },
            };

            return new Response(body, init);
        },
        'GET'
    );
    // use terminal or io to place files into the fileSystem
    workbox.routing.registerRoute(
        exportRegex,
        async ({ url }) => {
            console.log('inside of export');
            let torrentURI;
            try {
                torrentURI = await buildTorrent();
            } catch (err) {
                console.error(err);
            }

            const init = {
                status,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/plain' },
            };

            return new Response(torrentURI, init);
        },
        'GET'
    );
};
