/*
    Dependencies
    npm install fs
    npm install path
    npm install nodeunit
*/

var $ = require('./fCommandline.js').ffs;
var assert = require('assert');
// assert.equal('hello world', data);
// assert.notEqual(actual, expected, message_opt);
// assert.ok(guard, message_opt);

var refText     = "This is the text";
var testFolder  = "c:\\fCommandLine";
$.mkdir(testFolder);

assert.equal(0, $.dir(testFolder,"*.*").length);

var file1 = $.combine(testFolder, "file1.txt");
$.File.writeAllText(file1 ,refText);
assert.equal(1, $.dir(testFolder,"*.*").length);

var text = $.File.readAllText(file1);
assert.equal(refText, $.File.readAllText(file1));

$.delete(file1);
assert.equal(0, $.dir(testFolder,"*.*").length);
$.rmdir(testFolder);

