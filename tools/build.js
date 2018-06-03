#!/usr/bin/env node

const commandRunner = require('./run-command');

const build = 'npm run build';
const build_db = 'npm run build -- --public-url=/"$GH-PAGES/"';

commandRunner('mkdir -p deploy && rm -R deploy/', '.')
    .then(() => commandRunner(build, 'src/docs/website'))
    .then(() =>
        commandRunner('mv -vf ./src/docs/website/build/Next/ deploy', '.')
    )
    .then(() => commandRunner('mkdir -p deploy/editor', '.'))
    .then(() => commandRunner(build, 'src/editor'))
    .then(() => commandRunner('mv -vf ./src/editor/dist deploy/editor', '.'))
    .then(() => commandRunner('mkdir -p deploy/dist', '.'))
    .then(() => commandRunner(build_db, 'src/db'))
    .then(() => commandRunner('mv -vf ./src/db/dist deploy', '.'))
    .catch(err => {
        throw `Unable to build ${err.message}`;
    });
