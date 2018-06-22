import htmlFormatter from '../lib/html-formatter';
import jsonFormatter from '../lib/json-formatter';
import { fullyDecodeURI } from '../lib/utils';
import Path from '../lib/path';

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
            const isDownload = url.searchParams.get('download') === 'true';
            const path = fullyDecodeURI(url.pathname.match(wwwRegex)[1]);

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
            if (isDownload) {
                config.headers[
                    'Content-Disposition'
                ] = `attachment; filename="${Path.basename(path)}"`;
            }
            return new Response(res.body, config);
        },
        'GET'
    );
};
