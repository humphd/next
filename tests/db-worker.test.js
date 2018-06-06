const port = require('../jest-puppeteer.config').server.port;
const timeout = 10000;
jest.setTimeout(timeout);

describe('Testing /data/api/ endpoint', () => {
    const domain = 'http://localhost:' + port;
    const endpoint = 'data/api';
    let page = null;

    const insertTable = [
        [{ data: { my: 'test' } }, 'test'],
        [{ data: { my: 'test' }, schema: '++a' }, 'test1'],
        [{ data: { my: 'test', a: 3 }, schema: '++a' }, 'test2'],
    ];

    async function populateTable(url, requests) {
        for (let req of requests) {
            await makeRequest(url, {
                method: 'PUT',
                body: JSON.stringify(req),
            });
        }
    }

    function makeRequest(url, config) {
        return page.evaluate(
            (url, req) =>
                fetch(url, req)
                    .then(res => res.json())
                    .catch(err => err),
            url,
            config
        );
    }

    beforeAll(async () => {
        page = (await browser.pages())[0];
        await page.goto(domain, { waitUntil: 'networkidle0' });
        // wait until service worker installs
        await page.waitFor(1000);
    });

    describe('Testing POST', () => {
        test.each(insertTable)(
            'Create table with body = %j for table %s',
            async (body, tableName) => {
                const response = await makeRequest(
                    encodeURI(`${domain}/${endpoint}/${tableName}`),
                    {
                        method: 'POST',
                        body: JSON.stringify(body),
                    }
                );
                expect(response.ok).toBeTruthy();
            }
        );

        test('Inserting duplicate primary key.', async () => {
            const req = {
                method: 'POST',
                body: JSON.stringify({
                    data: { _id: 1, my: 'test', a: 3 },
                }),
            };
            const url = encodeURI(`${domain}/${endpoint}/test3`);
            let response = await makeRequest(url, req);
            // first insertion should be fine.
            expect(response.ok).toBeTruthy();

            response = await makeRequest(url, req);
            // duplicate key inserted, should fail.
            expect(response.ok).toBeFalsy();
        });
    });

    describe('Testing PUT', () => {
        test.each(insertTable)(
            'Create table with body = %j for table %s',
            async (body, tableName) => {
                const response = await makeRequest(
                    encodeURI(`${domain}/${endpoint}/${tableName}`),
                    {
                        method: 'PUT',
                        body: JSON.stringify(body),
                    }
                );
                expect(response.ok).toBeTruthy();
            }
        );

        test('Updating existing property value.', async () => {
            const payload = { _id: 1, my: 'test', a: 3 };
            const schema = '++_id,my';

            const req = {
                method: 'PUT',
                body: JSON.stringify({
                    data: payload,
                    schema: schema,
                }),
            };
            const url = encodeURI(`${domain}/${endpoint}/test4`);
            let response = await makeRequest(url, req);
            // first insertion should be fine.
            expect(response.ok).toBeTruthy();

            payload.my = 'some other text';

            response = await makeRequest(url, req);
            // update should succeed, since using PUT.
            expect(response.ok).toBeTruthy();
        });
    });

    describe('Testing GET', async () => {
        const tableName = 'grandTour';

        beforeAll(async () => {
            const requests = [
                {
                    data: { first_name: 'Jeremy', last_name: 'Clarkson' },
                    schema: '++_id,first_name,last_name',
                },
                {
                    data: { first_name: 'Richard', last_name: 'Hammond' },
                    schema: '++_id,first_name,last_name',
                },
                {
                    data: { first_name: 'James', last_name: 'May' },
                    schema: '++_id,first_name,last_name',
                },
            ];

            await populateTable(`${domain}/${endpoint}/${tableName}`, requests);
        });

        test('Table that does not exist.', async () => {
            const response = await makeRequest(
                // we allow empty table names
                encodeURI(`${domain}/${endpoint}`),
                {
                    method: 'GET',
                    body: null,
                }
            );
            expect(response.ok).toBeFalsy();
        });

        test.each([
            tableName,
            `${tableName}/_id/1`,
            `${tableName}/first_name/Jeremy`,
        ])('Table extraction using url: %s', async path => {
            const response = await makeRequest(
                encodeURI(`${domain}/${endpoint}/${path}`),
                {
                    method: 'GET',
                    body: null,
                }
            );
            expect(response.ok).toBeTruthy();
        });
    });

    describe('Testing DELETE', () => {
        const tableName = 'death_star';
        beforeAll(async () => {
            const requests = [
                {
                    data: { first_name: 'Darth', last_name: 'Vader' },
                    schema: '++_id,first_name,last_name',
                },
                {
                    data: { first_name: 'Emperor', last_name: 'Palpatine' },
                    schema: '++_id,first_name,last_name',
                },
                {
                    data: { first_name: 'Storm', last_name: 'Trooper' },
                    schema: '++_id,first_name,last_name',
                },
            ];

            await populateTable(`${domain}/${endpoint}/${tableName}`, requests);
        });

        test.each([`${tableName}/last_name/Palpatine`, `${tableName}`])(
            'Delete from table using url: %s',
            async path => {
                const response = await makeRequest(
                    encodeURI(`${domain}/${endpoint}/${path}`),
                    {
                        method: 'DELETE',
                        body: null,
                    }
                );
                expect(response.ok).toBeTruthy();
            }
        );
    });
});
