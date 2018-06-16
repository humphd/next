import { format404 } from './html-formatter';
import receiveTorrent from './imp';
import buildTorrent from './exp';

const importRegex = /\/import(\/*)/;
const exportRegex = /\/export(\/*)/;
const shareRegex = /\/share(\/?)$/;
//open package.json post build-server
export default (workbox, Share) => {
    workbox.routing.registerRoute(
        shareRegex,
        async ({ url }) => {
            console.log('Routes #1', url);
            //return fetch('/share/index.html');
            //console.log('Routes #2');
            const path = url.pathname.match(shareRegex);
            let body;
            let type;
            let status;
            try {
                const result = await Share.torrent();
                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                console.error(err);
                body = format404(path);
                type = 'text/html';
                status = 404;
            }

            const init = {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': type },
            };
            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        importRegex,
        async ({ url }) => {
            console.log('inside of import ' + url);
            const torrentURI = url.search.substr(1);

            try {
                console.log('importing: ' + torrentURI);
                await receiveTorrent(torrentURI);
            } catch (err) {
                console.error(err);
            }

            const init = {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/plain' },
            };
            return new Response(torrentURI, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        exportRegex,
        async ({ url }) => {
            // let torrentURI;
            // try {
            //     // torrentURI = 'export magnet';
            //     torrentURI = await buildTorrent();
            // } catch (err) {
            //     console.error(err);
            // }

            // const init = {
            //     status: 200,
            //     statusText: 'OK',
            //     headers: { 'Content-Type': 'text/plain' },
            // };

            //return new Response(torrentURI, init);
            return fetch('./export.html');
        },
        'GET'
    );
};
