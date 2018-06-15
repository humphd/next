//import fs from '../lib/fs';
var fs = require('browserify-fs');

var txt = 'Text to be written into example.txt';
var myFile = 'example.txt';

fs.writeFile(myFile, txt, function(err) {
    if (err) throw err;
    else {
        fs.readFile(myFile, function(err, data) {
            var currentLog = data;
            console.log('the contents of the file are: ' + currentLog);
        });
    }
});
