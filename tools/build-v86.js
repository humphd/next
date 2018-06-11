#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(path.join(__dirname, '..'));
const v86defconfigDir = path.join(root, 'buildroot-v86');
const v86outDir = path.join(root, 'v86-out');

// docker run --rm --name build-v86 -v $PWD/v86-out:/build -v $PWD:/buildroot-ext-tree buildroot
const args = [
    'run',
    '--rm',    
    '--name',
    'build-v86',
    '-v',
    `${v86outDir}:/build`,
    '-v',
    `${v86defconfigDir}:/buildroot-ext-tree`,
    'buildroot'
];

const options = {
    cwd: root,
    stdio: 'inherit'
};

spawn('docker', args, options);
