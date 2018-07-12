import rawFormatter from './raw-formatter';

const wwwRegex = /^\/www(\/.*)/;

const isRaw = url =>
    wwwRegex.test(url.pathname) && url.searchParams.get('raw') === 'true';

export default (workbox, webServer) => {
    // Cache service-worker icon files (PNG) in the root
    workbox.routing.registerRoute(
        /[^/]+\.png/,
        workbox.strategies.staleWhileRevalidate()
    );

    workbox.routing.registerRoute(
        context => isRaw(context.url),
        async ({ url }) => {
            const path = url.pathname.match(wwwRegex)[1];

            let res;
            try {
                res = await webServer.serve(path, rawFormatter);
            } catch (err) {
                res = rawFormatter.format404(path);
            }
            return res;
        },
        'GET'
    );

    workbox.routing.registerRoute(
        context => !isRaw(context.url),
        ({ url }) =>
            Response.redirect(
                `${url.origin}?redirectTo=${encodeURIComponent(url.pathname)}`
            ),
        'GET'
    );
};
