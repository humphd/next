import DatabaseServer from './db';
import IOServer from './io';
import WebServer from './web-server';
import docs from './docs';
import editor from './editor/src/routes.js';
import terminal from './terminal';

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

// Setup routes for /edit/* routes
editor.init(workbox);

// Create WebServer and associated /www/* routes
const webServer = new WebServer();
webServer.init(workbox);

// Create DatabaseServer and associated /data/* routes
const dbServer = new DatabaseServer();
dbServer.init(workbox);

// Setup caching for terminal and vm binary resources
terminal.init(workbox);

// Setup io routes
const ioServer = new IOServer();
ioServer.init(workbox);
