const {
    domain,
    makeRequest,
    populateTable,
    waitForServiceWorkers,
} = require('./lib/shared.js');
const timeout = 10000;
jest.setTimeout(timeout);

let page = null;

beforeAll(async () => {
    page = (await browser.pages())[0];
    await page.goto(domain, { waitUntil: 'networkidle0' });
    // wait until service worker installs
    await waitForServiceWorkers(page);
});

// it is essential that the order of the top level describes is mainained,
// because of the async nature of indexed db and speed of puppeteer.
// indexed db does not keep up with puppeteer's instructions, which might create race conditions because of db blocks.
describe('Testing /data/api/ endpoint', () => {
    const endpoint = 'data/api';

    const insertTable = [
        [{ data: { my: 'test' } }, 'test'],
        [{ data: { my: 'test' }, schema: '++a' }, 'test1'],
        [{ data: { my: 'test', a: 3 }, schema: '++a' }, 'test2'],
    ];

    afterAll(async () => {
        // clear indexed db before finishing
        const response = await makeRequest(
            `${domain}/data/reset`,
            { method: 'DELETE' },
            page
        );
        expect(response.ok).toBeTruthy();
    });

    describe('Testing POST', () => {
        test.each(insertTable)(
            'Create table with body = %j for table %s',
            async (body, tableName) => {
                const response = await makeRequest(
                    `${domain}/${endpoint}/${tableName}`,
                    {
                        method: 'POST',
                        body: JSON.stringify(body),
                    },
                    page
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
            const url = `${domain}/${endpoint}/test3`;
            let response = await makeRequest(url, req, page);
            // first insertion should be fine.
            expect(response.ok).toBeTruthy();

            response = await makeRequest(url, req, page);
            // duplicate key inserted, should fail.
            expect(response.ok).toBeFalsy();
        });
    });

    describe('Testing PUT', () => {
        test.each(insertTable)(
            'Create table with body = %j for table %s',
            async (body, tableName) => {
                const response = await makeRequest(
                    `${domain}/${endpoint}/${tableName}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(body),
                    },
                    page
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
            const url = `${domain}/${endpoint}/test4`;
            let response = await makeRequest(url, req, page);
            // first insertion should be fine.
            expect(response.ok).toBeTruthy();

            payload.my = 'some other text';

            response = await makeRequest(url, req, page);
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

            await populateTable(
                `${domain}/${endpoint}/${tableName}`,
                requests,
                page
            );
        });

        test('Table that does not exist.', async () => {
            const response = await makeRequest(
                // we allow empty table names
                `${domain}/${endpoint}`,
                {
                    method: 'GET',
                    body: null,
                },
                page
            );
            expect(response.ok).toBeFalsy();
        });

        test.each([
            tableName,
            `${tableName}/_id/1`,
            `${tableName}/first_name/Jeremy`,
        ])('Table extraction using url: %s', async path => {
            const response = await makeRequest(
                `${domain}/${endpoint}/${path}`,
                {
                    method: 'GET',
                    body: null,
                },
                page
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

            await populateTable(
                `${domain}/${endpoint}/${tableName}`,
                requests,
                page
            );
        });

        test.each([`${tableName}/last_name/Palpatine`, `${tableName}`])(
            'Delete from table using url: %s',
            async path => {
                const response = await makeRequest(
                    `${domain}/${endpoint}/${path}`,
                    {
                        method: 'DELETE',
                        body: null,
                    },
                    page
                );

                expect(response.ok).toBeTruthy();
            }
        );
    });
});

describe('Testing /data/download', () => {
    const endpoint = 'data/download';

    beforeAll(async () => {
        //populate table with some data
        await populateTable(
            `${domain}/data/api/jedis1`,
            [
                {
                    data: {
                        name: 'Yoda',
                        lightsaber: 'green',
                    },
                    schema: '_id,name,lightsaber',
                },
                {
                    data: {
                        name: 'Obi-Wan',
                        lightsaber: 'blue',
                    },
                    schema: '_id,name,lightsaber',
                },
                {
                    data: {
                        name: 'Master Windu',
                        lightsaber: 'purple',
                    },
                    schema: '_id,name,lightsaber',
                },
            ],
            page
        );
    });

    afterAll(async () => {
        // clear indexed db before finishing
        const response = await makeRequest(
            `${domain}/data/reset`,
            { method: 'DELETE' },
            page
        );

        expect(response.ok).toBeTruthy();
    });

    test('Trying to download a db.', async () => {
        let response = await makeRequest(
            `${domain}/${endpoint}`,
            {
                method: 'GET',
            },
            page
        );
        expect(response.ok).toBeTruthy();
    });
});

describe('Testing /data/reset', () => {
    const endpoint = 'data/reset';

    beforeAll(async () => {
        //populate table with some data
        await populateTable(
            `${domain}/data/api/jedis`,
            [
                {
                    data: {
                        name: 'Yoda',
                        lightsaber: 'green',
                    },
                    schema: '_id,name,lightsaber',
                },
                {
                    data: {
                        name: 'Obi-Wan',
                        lightsaber: 'blue',
                    },
                    schema: '_id,name,lightsaber',
                },
                {
                    data: {
                        name: 'Master Windu',
                        lightsaber: 'purple',
                    },
                    schema: '_id,name,lightsaber',
                },
            ],
            page
        );
    });

    test('Trying to delete an entire database.', async () => {
        let response = await makeRequest(
            `${domain}/${endpoint}`,
            {
                method: 'DELETE',
            },
            page
        );

        expect(response.ok).toBeTruthy();
    });
});

describe('Testing /data/upload', () => {
    const endpoint = 'data/upload';

    afterAll(async () => {
        // clear indexed db before finishing
        const response = await makeRequest(
            `${domain}/data/reset`,
            { method: 'DELETE' },
            page
        );

        expect(response.ok).toBeTruthy();
    });

    test('Trying to upload a db.', async () => {
        let response = await makeRequest(
            `${domain}/${endpoint}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    grandTour1: {
                        schema: '++_id,first_name,last_name',
                        data: [
                            { first_name: 'James', last_name: 'May', _id: 1 },
                            {
                                first_name: 'Richard',
                                last_name: 'Hammond',
                                _id: 2,
                            },
                            {
                                first_name: 'Jeremy',
                                last_name: 'Clarkson',
                                _id: 3,
                            },
                        ],
                    },
                }),
            },
            page
        );

        expect(response.ok).toBeTruthy();
    });
});
