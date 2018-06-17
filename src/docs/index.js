export default {
    init: workbox => {
        // Cache main docs content
        workbox.routing.registerRoute(
            /\b(blog|css|docs|en|img).*/,
            workbox.strategies.staleWhileRevalidate()
        );
    },
};
