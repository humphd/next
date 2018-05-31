import DatabaseServer from './db';
import WebServer from './web-server';

/* global workbox */
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);

workbox.skipWaiting();
workbox.clientsClaim();

// Create WebServer and associated /www/* routes
const webServer = new WebServer();
webServer.init(workbox);

// Create DatabaseServer and associated /data/* routes
const db = new DatabaseServer();
(async () => {
    await db.init(workbox);
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
