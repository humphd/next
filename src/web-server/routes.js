import { format404 } from '../lib/html-formatter';

const wwwRegex = /\/www(\/.*)/;

export default (workbox, webServer) => {
    // Cache service-worker icon files (PNG) in the root
    workbox.routing.registerRoute(
        /[^/]+\.png/,
        workbox.strategies.staleWhileRevalidate()
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        wwwRegex,
        async ({ url }) => {
            const path = url.pathname.match(wwwRegex)[1];
            let body;
            let type;
            let status;
            try {
                const result = await webServer.serve(path);
                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = format404(path);
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
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
};
