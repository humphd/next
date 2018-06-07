#!/usr/bin/env node

const commandRunner = require('./run-command');

const build = 'npm run build';
const build_db = 'npm run build -- --public-url=/"$GH-PAGES/"';

var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var copy = require('copy');

rimraf('./dist', {}, function() {});

mkdirp('dist', function(err) {
    if (err) console.error(err);
    else console.log('Created dist directory');
});

commandRunner(build, 'src/docs/website')
    .then(() =>
        copy('./src/docs/website/build/Next/**', './dist', function(err, file) {
            if (err) console.error(err);
        })
    )
    .then(() =>
        mkdirp('dist/editor', function(err) {
            if (err) console.error(err);
            else console.log('Created dist/editor directory');
        })
    )
    .then(() => commandRunner(build, 'src/editor'))
    .then(() =>
        copy('./src/editor/dist/**', './dist/edtor', function(err, file) {
            if (err) console.error(err);
        })
    )
    .then(() =>
        mkdirp('dist/dist', function(err) {
            if (err) console.error(err);
            else console.log('Created src/editor directory');
        })
    )
    .then(() => commandRunner(build_db, 'src/db'))
    .then(() =>
        copy('./src/db/dist/**', './dist/dist', function(err, file) {
            if (err) console.error(err);
        })
    )
    .catch(err => {
        throw `Unable to build ${err.message}`;
    });
