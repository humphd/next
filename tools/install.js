#!/usr/bin/env node

const { exec } = require('child_process');

const install = 'npm install';
// decend into editor
process.chdir('src/editor');
const p = exec(install).on('exit', code => {
    if (!!code) {
        throw 'Unable to install editor dependencies.';
    }
});
logOutput(p);

function logOutput(p) {
    p.stdout.on('data', output => {
        process.stdout.write(output.toString());
    });
    p.stderr.on('data', output => {
        process.stderr.write(output.toString());
    });
}
