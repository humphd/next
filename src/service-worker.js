import DatabaseServer from './db';
import WebServer from './web-server';
import docs from './docs';
import Share from './share';

/* global workbox */
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js'
);

// @ts-ignore
workbox.setConfig();

workbox.skipWaiting();
workbox.clientsClaim();

// Setup routes for main docs content
docs.init(workbox);

// Setup routes for main share content
const share = new Share();
share.init(workbox);

// Create WebServer and associated /www/* routes
const webServer = new WebServer();
webServer.init(workbox);

// Create DatabaseServer and associated /data/* routes
const dbServer = new DatabaseServer();
dbServer.init(workbox);
