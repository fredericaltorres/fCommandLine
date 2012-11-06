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

/*
http://nodejs.org/api/path.html
*/
var ffs = (function(){
  
   "use strict";
  
    var _fs             = require('fs');
    var _path           = require('path');

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
    _ffs.Directory.GetCurrentDirectory = _ffs.pwd;
    
    // Delete file
    _ffs.delete = function(fname) {

        return _fs.unlinkSync(fname)
    }
    _ffs.File.delete   = _ffs.rmdir;

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
        var files = _fs.readdirSync( dir, true );
        for ( var i = 0 ; i < files.length ; ++i ) {
                var fname = dir+'/'+files[i];
                out.push( fname );
                if (recurse) {
                        var fstat = _fs.statSync( fname );
                        if (fstat.isDirectory())
                                this.__dirSync( fname, recurse, out );
                }
        }
        return out;
    }

    // Dir or GetFile
    _ffs.dir = function(path, wildCard, recurse) {

        wildCard = wildCard || "*";
        var base = wildCard;
        for (var k in repl)
        {
            var v = repl[k];
            base  = base.replace(k,v);
        }
        base = new RegExp( '^'+base+"$" );
        var files0 = this.__dirSync( path, recurse );
        var files  = [];
        for ( var i = 0 ; i < files0.length ; ++i ) {
                var fname = files0[i];
                if ( base.test( _path.basename(fname) ) )
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
            var ff = _path.join(path, f);
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

module.exports.ffs = ffs;
