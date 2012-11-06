/*
    Dependencies
    npm install fs
    npm install path
    npm install nodeunit
*/

var ff$     = require('./fCommandline.js').ffs;
var assert  = require('assert');

function normalizeTestObject(test) {

    var __DEBUG__ = !true;

    var print = function(s) {

      if(__DEBUG__)
          console.log(s);
    }

    if(typeof(normalizeTestObject.counter)==='undefined')
        normalizeTestObject.counter = 0;

    normalizeTestObject.counter++;

    test.getNewTestFolder = function() {

        var marker = "nodeunit_";
        var d = (new Date()).toJSON().replace(":","-").replace(":","-");
        var f = ff$.combine("c:", marker+d+normalizeTestObject.counter);

        print("New Folder:"+f);
        return f;
    }
    test.isTrue = function(v, message) {
        test.ok(v, message);
    }
    test.isFalse = function(v, message) {
        test.ok(!v, message);
    }
    test.fail = function(v, message) {
        test.ok(false, v, message);
    }
    test.areEqual = function(v1, v2, message) {
        test.equal(v1, v2, message);
    }
    return test;
}

exports.test_mkdir_rmdir = function(t) {

    t = normalizeTestObject(t);
    var testFolder = t.getNewTestFolder();

    t.isFalse(ff$.exists(testFolder));
    t.isFalse(ff$.Directory.exists(testFolder));
    ff$.mkdir(testFolder);
    t.isTrue(ff$.exists(testFolder));
    t.areEqual(0, ff$.dir(testFolder, "*.*").length);
    ff$.rmdir(testFolder);
    t.isFalse(ff$.exists(testFolder));
    t.done();
}

exports.test_mkdir_rmdir_SubFolder = function(t) {

    t = normalizeTestObject(t);

    var testFolder = t.getNewTestFolder();

    ff$.mkdir(testFolder);
    ff$.mkdir(testFolder+"/toto");
    t.isTrue(ff$.exists(testFolder+"/toto"));
    ff$.rmdir(testFolder+"/toto");
    t.isFalse(ff$.exists(testFolder+"/toto"));
    ff$.rmdir(testFolder);
    t.done();
}

exports.test_Directory_CreateDelete = function(t) {

    t = normalizeTestObject(t);
    var testFolder = t.getNewTestFolder();

    t.isFalse(ff$.exists(testFolder));
    t.isFalse(ff$.Directory.exists(testFolder));
    ff$.Directory.createDirectory(testFolder);
    t.isTrue(ff$.exists(testFolder));
    ff$.Directory.delete(testFolder);
    t.isFalse(ff$.exists(testFolder));
    t.done();
}

exports.test_File_CreateRead = function(t) {

    t = normalizeTestObject(t);
    var testFolder = t.getNewTestFolder();
    var file1      = ff$.combine(testFolder, "file1.txt");
    var refText    = "This is the text";

    ff$.mkdir(testFolder);

    ff$.File.writeAllText(file1 ,refText);
    var text = ff$.File.readAllText(file1);
    assert.equal(refText, ff$.File.readAllText(file1));

    t.isTrue(ff$.exists(file1));
    ff$.delete(file1);
    t.isFalse(ff$.exists(file1));

    ff$.rmdir(testFolder);
    t.done();
}

exports.test_File_CreateAppendRead = function(t) {

    t = normalizeTestObject(t);
    var testFolder = t.getNewTestFolder();
    var file1      = ff$.combine(testFolder, "file1.txt");
    var refText    = "This is the text";

    ff$.mkdir(testFolder);

    ff$.File.writeAllText(file1, refText);
    ff$.File.appendAllText(file1, "\n"+refText);
    var text = ff$.File.readAllText(file1);
    assert.equal(refText+"\n"+refText, ff$.File.readAllText(file1));

    t.isTrue(ff$.exists(file1));
    ff$.delete(file1);
    t.isFalse(ff$.exists(file1));

    ff$.rmdir(testFolder);
    t.done();
}