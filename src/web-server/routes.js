import htmlFormatter from './html-formatter';
import jsonFormatter from './json-formatter';

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
            const formatter =
                url.searchParams.get('json') === 'true'
                    ? jsonFormatter
                    : htmlFormatter;
            const path = url.pathname.match(wwwRegex)[1];

            let res;
            try {
                res = await webServer.serve(path, formatter);
            } catch (err) {
                res = formatter.format404(path);
            }
            const config = {
                status: res.status,
                statusText: 'OK',
                headers: { 'Content-Type': res.type },
            };
            return new Response(res.body, config);
        },
        'GET'
    );
};
