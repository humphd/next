#!/usr/bin/env node

const commandRunner = require('./run-command');
const util = require('util');

var mkdirp = util.promisify(require('mkdirp'));
var copy = util.promisify(require('copy'));

mkdirp('dist')
    .then(() => commandRunner('npm run build-docs'))
    .then(() => copy('./src/docs/website/build/Next/**', './dist'))
    .then(() => commandRunner('npm run build-editor'))
    .then(() => mkdirp('dist/editor'))
    .then(() => copy('./src/editor/dist/**', './dist/editor'))
    .then(() => commandRunner('npm run build-terminal'))
    .catch(err => {
        throw err;
    });
