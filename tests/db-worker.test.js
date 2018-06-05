const port = require('../jest-puppeteer.config').server.port;
const domain = 'http://localhost:' + port;
const timeout = 20000;

describe('Testing /data/api/ endpoint', () => {
    const endpoint = 'data/api';
    describe('Testing GET', () => {
        test(
            'Positive testcase',
            async () => {
                const page = await browser.newPage();

                await page.goto(domain, { waitUntil: 'load' });

                await page.setRequestInterception(true);

                page.on('request', interceptedRequest => {
                    // console.log(interceptedRequest.headers());
                    const headers = interceptedRequest.headers();
                    delete headers.accept;
                    interceptedRequest.continue({ headers: headers });
                });

                const response = await page.goto(`${domain}/${endpoint}/test`, {
                    waitUntil: 'load',
                });

                console.log(await response.request().headers());
                expect(response.ok()).toBeTruthy();
            },
            timeout
        );
    });
});
