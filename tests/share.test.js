const { readySeed, readyDownload } = require('./lib/shared.js');
const timeout = 10000;
jest.setTimeout(timeout);

describe('Create files', () => {
    test('Files created', () => {
        expect(readySeed).toBeTruthy();
    });

    test('Check torrented files', () => {
        expect(readyDownload).toBeTruthy();
    });
});
