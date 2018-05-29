#!/usr/bin/env node

const commandRunner = require('./run-command');

const install = 'npm install';
commandRunner(install, 'src/editor', code => {
    if (!!code) {
        throw 'Unable to install editor dependencies.';
    }
});
