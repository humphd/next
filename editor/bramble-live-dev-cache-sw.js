self.addEventListener("fetch",function(event){"use strict";var url=event.request.url.split(/[?#]/)[0];event.respondWith(caches.match(url).then(function(response){return response||fetch(event.request)}).catch(function(err){console.warn("[Bramble Service Worker Error]: couldn't serve URL",url,err);return fetch(event.request)}))});