#!/usr/bin/env node
const { exec } = require('child_process');

function runCommand(command, dir, callback) {
    process.chdir(dir);
    const p = exec(command).on('exit', callback);
    p.stdout.on('data', output => {
        process.stdout.write(output.toString());
    });
    p.stderr.on('data', output => {
        process.stderr.write(output.toString());
    });
}
module.exports = runCommand;
