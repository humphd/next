if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./service-worker.js')
            .catch(function(error) {
                // TODO: do something better here when we fail, since
                // it might mean we have a domain/permissions/settings issue
                // in browser, see https://blog.humphd.org/promise-to-catch/
                // Maybe we should redirect to a page that explains the issue?
                console.log('Service worker registration failed:', error);
            });
    });
} else {
    console.log('Service workers are not supported.');
}
