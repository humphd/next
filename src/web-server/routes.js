import htmlFormatter from './html-formatter';
import jsonFormatter from './json-formatter';

const wwwRegex = /^\/www(\/.*)/;
export default (workbox, webServer) => {
    // Cache service-worker icon files (PNG) in the root
    workbox.routing.registerRoute(
        /[^/]+\.png/,
        workbox.strategies.staleWhileRevalidate()
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        context => wwwRegex.test(context.url.pathname),
        async ({ url }) => {
            console.log('inside');
            const formatter =
                url.searchParams.get('json') === 'true'
                    ? jsonFormatter
                    : htmlFormatter;
            console.log(formatter);
            console.log(url.pathname.match(wwwRegex));
            const path = url.pathname.match(wwwRegex)[1];

            let res;
            try {
                res = await webServer.serve(path, formatter);
            } catch (err) {
                res = formatter.format404(path);
            }
            console.log(res);
            return res;
        },
        'GET'
    );
};
