#!/usr/bin/env node

const commandRunner = require('./run-command');

const install = 'npm install';

commandRunner(install, 'src/db', code => {
    if (!!code) {
        throw 'Unable to install db dependencies.';
    }
    commandRunner(install, 'src/editor', code => {
        if (!!code) {
            throw 'Unable to install editor dependencies.';
        }
        commandRunner(install, 'src/docs/website', code => {
            if (!!code) {
                throw 'Unable to install docs dependencies.';
            }
        });
    });
});
