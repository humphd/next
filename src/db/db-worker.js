/* global workbox */
import { IndexedDb } from './db';
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);

workbox.skipWaiting();
workbox.clientsClaim();

const apiUrl = 'data/api';
const apiRegex = /\/data\/api.*/;

const db = new IndexedDb();
(async () => {
    await db.init();
})();

// @ts-ignore
workbox.setConfig();

workbox.routing.registerRoute(
    /\b(io\/from\/dataurl|io\/in|io\/share|io\/archive|terminal|io\/reset).*/,
    workbox.strategies.cacheFirst({
        cacheName: 'io-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);

workbox.routing.registerRoute(
    /\b(docs|assets|bin|blog|data\/(reset|download|upload)|lib|www).*/,
    workbox.strategies.cacheFirst({
        cacheName: 'content-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);
// @ts-ignore
workbox.routing.registerRoute(
    apiRegex,
    async ({ url }) => {
        const params = pathFromUrl(url.pathname, apiUrl);
        let message = null;
        let found = true;
        try {
            message = await db.getData({
                tableName: params[0],
                propertyName: params[1],
                value: params[2],
            });
        } catch (err) {
            console.error(err);
            message = err.message;
            found = false;
        }
        return new Response(
            JSON.stringify({ ok: found, query: message, method: 'GET' })
        );
    },
    'GET'
);

// @ts-ignore
workbox.routing.registerRoute(
    apiRegex,
    ({ url, event }) => {
        return event.request.json().then(async payload => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = '';
            let found = true;
            try {
                message = await db.addData({
                    tableName: params[0],
                    data: payload.data,
                    schema: payload.schema,
                });
            } catch (err) {
                console.error(err);
                message = err.message;
                found = false;
            }
            return new Response(
                JSON.stringify({
                    ok: found,
                    query: message,
                    method: 'POST',
                })
            );
        });
    },
    'POST'
);

// @ts-ignore
workbox.routing.registerRoute(
    apiRegex,
    ({ url, event }) => {
        return event.request.json().then(async payload => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = '';
            let found = true;
            try {
                message = await db.putData({
                    tableName: params[0],
                    primaryKey: params[1],
                    data: payload.data,
                    schema: payload.schema,
                });
            } catch (err) {
                console.error(err);
                message = err.message;
                found = false;
            }
            return new Response(
                JSON.stringify({
                    ok: found,
                    query: message,
                    method: 'PUT',
                })
            );
        });
    },
    'PUT'
);

// @ts-ignore
workbox.routing.registerRoute(
    apiRegex,
    async ({ url }) => {
        const params = pathFromUrl(url.pathname, apiUrl);
        let message = 0;
        let found = true;
        try {
            message = await db.deleteData({
                tableName: params[0],
                propertyName: params[1],
                value: params[2],
            });
        } catch (err) {
            console.error(err);
            message = err.message;
            found = false;
        }
        return new Response(
            JSON.stringify({ ok: found, query: message, method: 'DELETE' })
        );
    },
    'DELETE'
);

// returns an array where first position is the table name and the second is the property to be updated(if ok).
function pathFromUrl(url, match = '') {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
}
