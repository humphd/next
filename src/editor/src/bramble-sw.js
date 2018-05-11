/**
 * This is a service worker stub, meant only to allow development builds
 * to load properly. The actual bramble-sw.js file is generated at build
 * time, see Gruntfile and swPrecache task.
 */

// Get this new SW running as soon as possible.
self.addEventListener('install', function(event) {
    "use strict";
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
    "use strict";
    event.waitUntil(self.clients.claim());
});

// We only need the Cache Storage server in src/ builds
self.importScripts("bramble-live-dev-cache-sw.js");
