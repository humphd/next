importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);

workbox.setConfig({
    debug: true,
});
const revision = '1234';

workbox.precaching.precacheAndRoute([
    {
        url: '/index.html',
        revision: revision,
    },
    {
        url: '/index.js',
        revision: revision,
    },
    {
        url: '/db/index.html',
        revision: revision,
    },
    {
        url: '/process.js',
        revision: revision,
    },
]);

workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    ({ url, event, params }) => {
        const res = {};
        console.log(url.searchParams.keys());
        for (const entrie of url.searchParams.entries()) {
            res[entrie[0]] = entrie[1];
        }
        return Promise.resolve(
            new Response(JSON.stringify({ query: res, method: 'GET' }))
        );
    },
    'GET'
);

workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    ({ url, event, params }) => {
        console.log(event);
        return event.request.json().then(data => {
            console.log(data);
            return new Response(
                JSON.stringify({ query: data, method: 'POST' })
            );
        });
    },
    'POST'
);

workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    ({ url, event, params }) => {
        console.log(event);
        return event.request.json().then(data => {
            console.log(data);
            return new Response(JSON.stringify({ query: data, method: 'PUT' }));
        });
    },
    'PUT'
);
