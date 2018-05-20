import { IndexedDb } from './db/db';
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);
self.addEventListener('install', function(event) {
    // The promise that skipWaiting() returns can be safely ignored.
    // @ts-ignore
    self.skipWaiting();

    // Perform any other actions required for your
    // service worker to install, potentially insmessagee
    // of event.waitUntil();
});

const apiUrl = 'data/api';
const db = new IndexedDb();
(async () => {
    await db.init();
})();

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
    async ({ url, event, param }) => {
        const params = pathFromUrl(url.pathname, apiUrl);
        let message = null;
        try {
            message = await db.getData({
                tableName: params[0],
                propertyName: params[1],
                value: params[2],
            });
        } catch (err) {
            console.error(err);
            message = err.message;
        }
        return new Response(JSON.stringify({ query: message, method: 'GET' }));
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
            let message = '';
            console.log(payload);
            payload = JSON.parse(payload);
            try {
                message = await db.addData({
                    tableName: params[0],
                    data: payload.data,
                    schema: payload.schema,
                });
            } catch (err) {
                console.error(err);
                message = err;
            }
            return new Response(
                JSON.stringify({ query: message, method: 'POST' })
            );
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
        return event.request.json().then(async payload => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = '';
            console.log(payload);
            payload = JSON.parse(payload);
            try {
                message = await db.putData({
                    tableName: params[0],
                    primaryKey: params[1],
                    data: payload.data,
                    schema: payload.schema,
                });
            } catch (err) {
                console.error(err);
                message = err;
            }
            return new Response(
                JSON.stringify({ query: message, method: 'PUT' })
            );
        });
    },
    'PUT'
);

// @ts-ignore
workbox.routing.registerRoute(
    ({ url, event }) => {
        return /\/data\/api.*/.test(url.pathname);
    },
    async ({ url, event, param }) => {
        const params = pathFromUrl(url.pathname, apiUrl);
        let message = 0;
        try {
            message = await db.deleteData({
                tableName: params[0],
                propertyName: params[1],
                value: params[2],
            });
        } catch (err) {
            console.error(err);
            message = err.message;
        }
        return new Response(
            JSON.stringify({ query: message, method: 'DELETE' })
        );
    },
    'DELETE'
);

// returns an array where first position is tha table name and the second is the property to be updated(if present).
function pathFromUrl(url, match = '') {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
}
