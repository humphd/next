#!/usr/bin/env node

const commandRunner = require('./run-command');

const install = 'npm install';

commandRunner(install, 'src/db')
    .then(() => commandRunner(install, 'src/editor'))
    .then(() => commandRunner(install, 'src/docs/website'))
    .catch(err => {
        throw `Unable to install dependencies ${err.message}`;
    });
