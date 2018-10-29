const port = require('../../jest-puppeteer.config').server.port;

module.exports.domain = 'http://localhost:' + port;

function makeRequest(url, config, page) {
    return page.evaluate(
        (url, req) =>
            fetch(url, req)
                .then(res => res.json())
                .catch(err => err),
        encodeURI(url),
        config
    );
}
function makeRequestAllInternalError(url, config, page) {
    return page.evaluate(
        (url, req) =>
            fetch(url, req)
                .then(res => { 
                    if(res.status == 500) 
                        return { ok: false };
                    else
                        return res.json();
                    })
                .catch(err => err),
        encodeURI(url),
        config
    );
}
module.exports.makeRequest = makeRequest;
module.exports.makeRequestAllInternalError = makeRequestAllInternalError;

module.exports.populateTable = async function(url, requests, page) {
    for (let req of requests) {
        await makeRequest(
            url,
            {
                method: 'PUT',
                body: JSON.stringify(req),
            },
            page
        );
    }
};

module.exports.waitForServiceWorkers = function(page) {
    return page.evaluate(() =>
        navigator.serviceWorker.getRegistrations().then(registrations => {
            return Promise.all(
                registrations.map(
                    reg =>
                        new Promise(resolve => {
                            if (reg.active) {
                                resolve();
                            } else {
                                reg.onupdatefound = () => {
                                    // simulate passage of time inside browser,
                                    // so that service worker can install on the next tick.
                                    setTimeout(resolve, 10);
                                };
                            }
                        })
                )
            );
        })
    );
};
