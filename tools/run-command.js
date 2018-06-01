#!/usr/bin/env node
const { exec } = require('child_process');

const util = require('util');

function runCommand(command, dir, callback) {
    // save current pwd
    const pwd = process.cwd();
    process.chdir(dir);

    const p = exec(command).on('exit', function() {
        process.chdir(pwd);
        callback.apply(null, arguments);
    });
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
}

module.exports = util.promisify(runCommand);
