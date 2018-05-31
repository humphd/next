#!/usr/bin/env node
const { exec } = require('child_process');

function runCommand(command, dir, callback) {
    // save current pwd
    const pwd = process.cwd();
    process.chdir(dir);
    const p = exec(command).on('exit', function() {
        process.chdir(pwd);
        callback.apply(null, arguments);
    });
    p.stdout.on('data', output => {
        process.stdout.write(output.toString());
    });
    p.stderr.on('data', output => {
        process.stderr.write(output.toString());
    });
}
module.exports = runCommand;