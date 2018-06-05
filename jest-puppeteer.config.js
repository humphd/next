module.exports = {
    server: {
        command: 'node tests/server.js',
        port: 3000,
    },
    launch: {
        dumpio: true,
        headless: false, //process.env.HEADLESS !== 'false',
        sloMo: 10000,
        devtools: true,
    },
};
