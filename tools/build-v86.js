#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(path.join(__dirname, '..'));
const v86defconfigDir = path.join(root, 'buildroot-v86');
let v86outDir = path.join(root, 'v86-out');
const reg = /^(.):\\/;
// since on windows we are running docker on guest Ubuntu vm,
// we need to pass it path that it recognises.
// details here: https://stackoverflow.com/a/33314404
if (process.platform === 'win32') {
    // extract drive letter and convert it into the form of '/letter/'
    const matched = v86outDir.match(reg)[1].toLowerCase();
    // replace all windows path separators e.g. '\' with unix path separators e.g. '/'
    v86outDir = v86outDir.replace(reg, '/' + matched + '/').replace(/\\/g, '/');
}

// If you want to mount `/buildroot-v86` to reconfigure, set this
const overrideConfigDir = process.env.OVERRIDE_CONFIG_DIR == 1;

// docker run --rm --name build-v86 -v $PWD/v86-out:/build -v $PWD:/buildroot-v86 buildroot
let args = ['run', '--rm', '--name', 'build-v86', '-v', `${v86outDir}:/build`];

// Optionally override (via run-time mount) the /buildroot-v86 dir
if (overrideConfigDir) {
    args = args.concat([
        '--mount',
        `type=bind,source=${v86defconfigDir},target=/buildroot-v86`,
    ]);
}

// Pass any extra args onto docker (e.g., --entrypoint ...)
if (process.argv.length >= 3) {
    args = args.concat(process.argv.slice(2));
}

args = args.concat('buildroot');

console.log('docker', args.join(' '));

const options = {
    cwd: root,
    stdio: 'inherit',
};

spawn('docker', args, options);
