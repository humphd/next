import workbox from 'workbox-sw';
import DatabaseServer from './db';
import WebServer from './web-server';
import docs from './docs';

workbox.skipWaiting();
workbox.clientsClaim();

// Setup routes for main docs content
docs.init(workbox);

// Create WebServer and associated /www/* routes
const webServer = new WebServer();
webServer.init(workbox);

// Create DatabaseServer and associated /data/* routes
const dbServer = new DatabaseServer();
dbServer.init(workbox);

// @ts-ignore
workbox.setConfig();
