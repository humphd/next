import { stateUrl, vmStateCache } from './config';

export default {
    init: workbox => {
        // Cache the generated v86 state binary differently (nothing on server)
        workbox.routing.registerRoute(
            new RegExp('/terminal/' + stateUrl),
            workbox.strategies.cacheOnly({
                cacheName: vmStateCache,
            })
        );

        // Cache the rest of the terminal assets
        workbox.routing.registerRoute(
            /\/terminal\/.*/,
            workbox.strategies.staleWhileRevalidate()
        );
    },
};
