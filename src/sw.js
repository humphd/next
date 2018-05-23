/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox has loaded`);
  workbox.precaching.precacheAndRoute([]);
    workbox.routing.registerRoute(/\b(io\/from\/dataurl|io\/in|io\/share|io\/archive|terminal|io\/reset).*/,
      workbox.strategies.cacheFirst({
        cacheName: 'io-cache',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          })
        ]
      })
    );
    
    workbox.routing.registerRoute(/\b(docs|assets|bin|blog|data\/(reset|download|upload)|lib|www).*.html/,
      workbox.strategies.cacheFirst({
        cacheName: 'htmls-cache',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          })
        ]
      })
    );

} else {
  console.log(`Workbox didn't load`);
}