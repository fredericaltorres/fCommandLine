/*
    fCommandLine.js
    An attempt to write a JavaScript file manipulation api for Windows and MacOS. Based on NodeJs and the extension (fs and path).
*/


/*
    Dependencies
    npm install fs
    npm install path
    npm install nodeunit -g
*/
print = function(s){ console.log(s); }

// Mimic MS-DOS switch, that can be passed as arguments
var $b = "/b";
var $s = "/s";
var $y = "/y";

/*
http://nodejs.org/api/path.html
*/
var ffs = (function(){

   "use strict";

    var _fs             = require('fs-extra');
    var _path           = require('path-extra');

    var repl = {
      '.': '\\.',
      '*': '.*',
      '?': '.'
    };

    var _ffs            = { };
    _ffs.Directory      = { };
    _ffs.File           = { };
    _ffs.Path           = { };
    _ffs.sep            = _path.sep;

    // Get Current Directory
    _ffs.pwd = function() {

        return process.cwd();
    }
    _ffs.Directory.getCurrentDirectory = _ffs.pwd;

    // Delete file
    _ffs.delete = function(fileNameOrArrayOfFileName) {

        if(Array.isArray(fileNameOrArrayOfFileName)) {

            for(var i=0; i<fileNameOrArrayOfFileName.length; i++)
                this.delete(fileNameOrArrayOfFileName[i]);
        }
        else {
            print("delete "+fileNameOrArrayOfFileName);
            _fs.unlinkSync(fileNameOrArrayOfFileName);
        }
    }
    _ffs.File.delete = _ffs.rmdir;

    _ffs.exists = function(path, mode) {

        return _fs.existsSync(path);
    }
    _ffs.File.exists        = _ffs.exists;
    _ffs.Directory.exists   = _ffs.exists;

    // Make Directory
    _ffs.mkdir = function(path, mode) {

        return _fs.mkdirSync(path, mode);
    }
    _ffs.Directory.createDirectory = _ffs.mkdir;
    _ffs.md                        = _ffs.mkdir;

    // Remove Directory
    _ffs.rmdir = function(path) {

        return _fs.rmdirSync(path);
    }
    _ffs.Directory.delete   = _ffs.rmdir;
    _ffs.rd                 = _ffs.rmdir;

    // http://code.google.com/p/jserver/source/browse/fileutil.js?spec=svn15340b33ca01183e34574e80e7c6946f4e5ac197&r=15340b33ca01183e34574e80e7c6946f4e5ac197
    _ffs.__dirSync = function( dir, recurse, out ) {

        if (typeof out === 'undefined') out = [];
        var files = _fs.readdirSync(dir);
        for ( var i = 0 ; i < files.length ; ++i ) {
                var fname = dir + '/' + files[i];
                out.push(fname);
                if (recurse) {
                    var fstat = _fs.statSync(fname);
                    if (fstat.isDirectory())
                        this.__dirSync(fname, recurse, out);
                }
        }
        return out;
    }
    _ffs.__copyOneFile = function(source, destination) {

        var BUF_LENGTH  = 64*1024;
        var buff        = new Buffer(BUF_LENGTH);
        var fdr         = _fs.openSync(source, 'r');
        var fdw         = _fs.openSync(destination, 'w');
        var bytesRead   = 1;
        var pos         = 0;
        while(bytesRead > 0) {
            bytesRead = _fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
            _fs.writeSync(fdw,buff,0,bytesRead);
            pos += bytesRead;
        }
        _fs.closeSync(fdr)
        _fs.closeSync(fdw)
    }
    _ffs.copy = function(source, destination) {

        var wildCard    = this.Path.getFileName(source);
        var sourcePath  = this.Path.getDirectoryName(source);
        var destFile    = null;
        var files       = this.Directory.getFiles(sourcePath, wildCard);
        var l           = [];

        for(var i=0; i<files.length; i++) {

            destFile = this.combine(destination, _ffs.Path.getFileName(files[i]));
            this.__copyOneFile(files[i], destFile);
            l.push(destFile);
        }
        return l;
    }
    _ffs.File.copy = _ffs.copy;

    // Dir or GetFile
    _ffs.dir = function(path, wildCard, recurse) {

        wildCard = wildCard || "*";
        var base = wildCard;
        for (var k in repl)
        {
            base = base.replace(k, repl[k]); // TODO may be an issue with the replace only replacing once
        }
        base = new RegExp('^'+base+"$");
        var files0 = this.__dirSync(path, recurse);
        var files  = [];
        for(var i=0; i<files0.length; ++i) {
                var fname = files0[i];
                if(base.test(_path.basename(fname)))
                    files.push( fname );
        }
        return files;
    };

    _ffs.isDirectory = function(fname) {

        return _fs.statSync(fname).isDirectory();
    }

     //  --- Path Sub Object --

     _ffs.Path.getExtension = function(fname) {

        return _path.extname(fname);
     }
     _ffs.Path.getDirectoryName = function(fname) {

        return _path.dirname(fname);
     }
     _ffs.Path.getFileNameWithoutExtension = function(fname) {

        var fn      = this.getFileName(fname);
        var ex      = this.getExtension(fname);
        var fnne    = fn.substring(0, fn.length-ex.length);
        return fnne;
     }
     _ffs.Path.getFileName = function(fname) {

        return _path.basename(fname);
     }
     _ffs.combine = function() {

        return _path.join.apply(_path, arguments);
     }
     _ffs.Path.combine = _ffs.combine;

    //  --- File Sub Object --
    _ffs.File.writeAllText = function(fname, text, encoding) {

        _fs.writeFileSync(fname, text, encoding);
    }
    _ffs.File.readAllText = function(fname, encoding) {

        return _fs.readFileSync(fname, encoding)
    }
    _ffs.File.appendAllText = function(fname, text, encoding) {

        _fs.appendFileSync(fname, text, encoding);
    }

    //  --- Directory Sub Object --

    _ffs.Directory.__get = function(path, wildCard, directory, recurse) {

        recurse = recurse || false;
        var all = _ffs.dir(path, wildCard, recurse);
        var l   = [];
        all.forEach(function(f) {
            var ff = f;//_path.join(path, f);
            if((directory) && (_ffs.isDirectory(ff))) {
                l.push(ff);
            }
            else if((!directory) && (!_ffs.isDirectory(ff))) {
                l.push(ff);
            }
        });
        return l;
    }
    _ffs.Directory.getFiles = function(path, wildCard) {

        return _ffs.Directory.__get(path, wildCard, false);
    }
    _ffs.Directory.getDirectories = function(path, wildCard) {

        return _ffs.Directory.__get(path, wildCard, true);
    }
    return _ffs;

})();

module.exports.ffs  = ffs;
module.exports.$b   = $b;
module.exports.$s   = $s;

