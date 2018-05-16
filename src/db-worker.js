importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);
self.addEventListener('install', function(event) {
    // The promise that skipWaiting() returns can be safely ignored.
    // @ts-ignore
    self.skipWaiting();

    // Perform any other actions required for your
    // service worker to install, potentially inside
    // of event.waitUntil();
});
import { IndexedDb } from './db/db';

const db = new IndexedDb();
const apiUrl = 'data/api';
// @ts-ignore
workbox.setConfig({
    debug: true,
});
// @ts-ignore
workbox.precaching.precacheAndRoute([]);

// @ts-ignore
workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    ({ url, event, params }) => {
        const res = {};
        console.log(event);
        for (const entrie of url.searchParams.entries()) {
            res[entrie[0]] = entrie[1];
        }
        return Promise.resolve(
            new Response(JSON.stringify({ query: res, method: 'GET' }))
        );
    },
    'GET'
);

// @ts-ignore
workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    ({ url, event, params }) => {
        return event.request.json().then(async payload => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let id = '';
            console.log(payload);
            payload = JSON.parse(payload);
            try {
                id = await db.populateData({
                    tableName: params[0],
                    data: payload.data,
                    schema: payload.schema,
                });
            } catch (err) {
                console.error(err);
                id = 'Primary key now found.';
            }
            return new Response(JSON.stringify({ query: id, method: 'POST' }));
        });
    },
    'POST'
);

// @ts-ignore
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

// returns an array where first position is tha table name and the second is the property to be updated(if present).
function pathFromUrl(url, match = '') {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
}
