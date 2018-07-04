import rawFormatter from './raw-formatter';

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
            if (url.searchParams.get('raw') !== 'true') {
                return Response.redirect(
                    `${url.origin}?redirectTo=${encodeURIComponent(
                        url.pathname
                    )}`
                );
            }
            const formatter = rawFormatter;
            const path = url.pathname.match(wwwRegex)[1];

            let res;
            try {
                res = await webServer.serve(path, formatter);
            } catch (err) {
                res = formatter.format404(path);
            }
            return res;
        },
        'GET'
    );
};
