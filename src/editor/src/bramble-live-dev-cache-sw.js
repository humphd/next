/**
 * See src/filesystem/impls/filer/UrlCache.js. If the browser supports
 * CacheStorage and Service Worker, we cache request/response pairs
 * for all files in the filesystem.  Each project root gets its own cache,
 * which is named vfs/project/root.
 */

self.addEventListener("fetch", function(event) {
    "use strict";

    // Strip params off URL so it will properly match what's in cache
    var url = event.request.url.split(/[?#]/)[0];

    event.respondWith(
        caches.match(url)
        .then(function(response) {
            // Either we have this file's response cached, or we should go to the network
            return response || fetch(event.request);
        })
        .catch(function(err) {
            console.warn("[Bramble Service Worker Error]: couldn't serve URL", url, err);
            return fetch(event.request);
        })
    );
});
