importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);

// const dexie = require('dexie');

workbox.setConfig({
    debug: true,
});
workbox.precaching.precacheAndRoute([]);

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
