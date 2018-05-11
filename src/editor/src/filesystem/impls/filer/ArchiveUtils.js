
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, Blob, Worker */

define(function (require, exports, module) {
    "use strict";

    var CommandManager  = require("command/CommandManager");
    var Commands        = require("command/Commands");
    var async           = require("filesystem/impls/filer/lib/async");
    var StartupState    = require("bramble/StartupState");
    var JSZip           = require("thirdparty/jszip/dist/jszip.min");
    var FileSystemCache = require("filesystem/impls/filer/FileSystemCache");
    var FileSystem      = require("filesystem/FileSystem");
    var Filer           = require("filesystem/impls/filer/BracketsFiler");
    var FilerUtils      = require("filesystem/impls/filer/FilerUtils");
    var saveAs          = require("thirdparty/FileSaver");
    var Dialogs         = require("widgets/Dialogs");
    var DefaultDialogs  = require("widgets/DefaultDialogs");
    var Strings         = require("strings");
    var StringUtils     = require("utils/StringUtils");
    var Buffer          = Filer.Buffer;
    var Path            = Filer.Path;
    var fs              = Filer.fs();

    // Mac and Windows clutter zip files with extra files/folders we don't need
    function skipFile(filename) {
        var basename = Path.basename(filename);

        // Skip OS X additions we don't care about in the browser fs
        if(/^__MACOSX\//.test(filename)) {
            // http://superuser.com/questions/104500/what-is-macosx-folder
            return true;
        }
        if(basename === ".DS_Store") {
            // https://en.wikipedia.org/wiki/.DS_Store
            return true;
        }
        if(/^\._/.test(basename)) {
            // http://apple.stackexchange.com/questions/14980/why-are-dot-underscore-files-created-and-how-can-i-avoid-them
            return true;
        }

        // Skip Windows additions we don't care about in the browser fs
        if(/(Tt)humbs\.db/.test(basename)) {
            // https://en.wikipedia.org/wiki/Windows_thumbnail_cache
            return true;
        }
        if(basename === "desktop.ini") {
            // http://www.computerhope.com/issues/ch001060.htm
            return true;
        }

        // Include this file, don't skip.
        return false;
    }

    function _refreshFilesystem(callback) {
        // Update the file tree to show the new files
        CommandManager.execute(Commands.FILE_REFRESH).always(callback);
    }

    // zipfile can be a path (string) to a zipfile, or raw binary data.
    function unzip(zipfile, options, callback) {
        var projectPrefix = StartupState.project("zipFilenamePrefix").replace(/\/?$/, "/");

        if(typeof options === 'function') {
            callback = options;
            options = {};
        }
        options = options || {};
        callback = callback || function(){};

        if(!zipfile) {
            callback(new Error("missing zipfile argument"));
            return;
        }

        var root = options.root || StartupState.project("root");
        var destination = Path.resolve(options.destination || root);

        function _unzip(data){
            // TODO: it would be great to move this bit to a worker.
            var archive = new JSZip(data);
            var filenames = [];

            archive.filter(function(relPath, file) {
                if(skipFile(file.name)) {
                    return;
                }

                var isDir = file.options.dir;
                var filename = removeThimbleProjectFolder(file.name);
                filenames.push({
                    absPath: Path.join(destination, filename),
                    isDirectory: isDir,
                    data: isDir ? null : new Buffer(file.asArrayBuffer())
                });
            });

            function removeThimbleProjectFolder(path) {
                // Nuke root folder `thimble-project/`, or whatever zip prefix was passed in
                // at startup, if exists so that project zip files can be re-imported without
                // adding an unnecessary folder.
                return path.replace(projectPrefix, "");
            }

            function decompress(path, callback) {
                var basedir = Path.dirname(path.absPath);

                if(path.isDirectory) {
                    fs.mkdirp(path.absPath, callback);
                } else {
                    // XXX: some zip files don't seem to be structured such that dirs
                    // get created before files. Create base dir if not there yet.
                    fs.stat(basedir, function(err, stats) {
                        if(err) {
                            if(err.code !== "ENOENT") {
                                return callback(err);
                            }

                            fs.mkdirp(basedir, function(err) {
                                if(err) {
                                    return callback(err);
                                }

                                FilerUtils.writeFileAsBinary(path.absPath, path.data, callback);
                            });
                        } else {
                            FilerUtils.writeFileAsBinary(path.absPath, path.data, callback);
                        }
                    });
                }
            }

            async.eachSeries(filenames, decompress, function(err) {
                if(err) {
                    return callback(err);
                }

                _refreshFilesystem(function(err) {
                    if(err) {
                        return callback(err);
                    }

                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        Strings.DND_SUCCESS_UNZIP_TITLE
                    ).getPromise().then(function() {
                        callback(null);
                    }, callback);
                });
            });
        }

        if(typeof zipfile === "string") {
            FilerUtils
                .readFileAsBinary(Path.resolve(root, zipfile))
                .fail(callback)
                .done(_unzip);
        } else {
            // zipfile is raw zip data, process it directly
            _unzip(zipfile);
        }
    }

    // Zip specific file or folder structure, allowing an optional root name
    // folder to be passed in and used as the zip filename as well.  Use "thimble-project/"
    // or whatever is configured if a rootName isn't specified.
    function archive(path, rootName, callback) {
        var root = StartupState.project("root");
        var pathPrefix = path.replace(/\/?$/, "");

        if(typeof rootName === "function") {
            callback = rootName;
            rootName = null;
        }
        rootName = (rootName || StartupState.project("zipFilenamePrefix")).replace(/\/?$/, "");
        callback = callback || function() {};

        var zipFilename = rootName + ".zip";
        var rootFolder = rootName + "/";

        // TODO: we should try to move this to a worker
        var jszip = new JSZip();

        function toRelProjectPath(path) {
            // Make path relative within the zip, rooted in a `thimble-project/` dir
            return path.replace(pathPrefix, rootFolder);
        }

        function addFile(path, callback) {
            FilerUtils
                .readFileAsBinary(path)
                .fail(callback)
                .done(function(data) {
                    jszip.file(toRelProjectPath(path), data.buffer, {binary: true});
                    callback();
                });
        }

        function addDir(path, callback) {
            fs.readdir(path, function(err, list) {
                // Add the directory itself
                jszip.folder(toRelProjectPath(path));

                // Add all children of this dir, too
                async.eachSeries(list, function(entry, callback) {
                    add(Path.join(path, entry), callback);
                }, callback);
            });
        }

        function add(path, callback) {
            path = Path.resolve(root, path);

            fs.stat(path, function(err, stats) {
                if(err) {
                    return callback(err);
                }

                if(stats.type === "DIRECTORY") {
                    addDir(path, callback);
                } else {
                    addFile(path, callback);
                }
            });
        }

        add(path, function(err) {
            if(err) {
                return callback(err);
            }
            // Prepare folder for download
            var compressed = jszip.generate({type: 'arraybuffer'});
            var blob = new Blob([compressed], {type: "application/zip"});
            saveAs(blob, zipFilename);
            callback();
        });
    }

    function untar(tarArchive, options, callback) {
        if(typeof options === 'function') {
            callback = options;
            options = {};
        }
        options = options || {};
        callback = callback || function(){};

        var untarWorker = new Worker("thirdparty/bitjs/bitjs-untar.min.js");
        var root = options.root || StartupState.project("root");
        var pending = null;

        function extract(path, data, callback) {
            path = Path.resolve(root, path);
            var basedir = Path.dirname(path);

            if(skipFile(path)) {
                return callback();
            }

            fs.mkdirp(basedir, function(err) {
                if(err && err.code !== "EEXIST") {
                    return callback(err);
                }

                FilerUtils.writeFileAsBinary(path, new Buffer(data), callback);
            });
        }

        function finish(err) {
            untarWorker.terminate();
            untarWorker = null;

            _refreshFilesystem(function(err) {
                if(err) {
                    return callback(err);
                }

                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_INFO,
                    Strings.DND_SUCCESS_UNTAR_TITLE
                ).getPromise().then(function() {
                    callback(null);
                }, callback);
            });
        }

        function writeCallback(err) {
            if(err) {
                console.error("[Bramble untar] couldn't extract file", err);
            }

            pending--;
            if(pending === 0) {
                finish(err);
            }
        }

        untarWorker.addEventListener("message", function(e) {
            var data = e.data;

            if(data.type === "progress" && pending === null) {
                // Set the total number of files we need to deal with so we know when we're done
                pending = data.totalFilesInArchive;
            } else if(data.type === "extract") {
                extract(data.unarchivedFile.filename, data.unarchivedFile.fileData, writeCallback);
            } else if(data.type === "error") {
                finish(new Error("[Bramble untar]: " + data.msg));
            }
        });

        untarWorker.postMessage({file: tarArchive.buffer});
    }

    exports.skipFile = skipFile;
    exports.archive = archive;
    exports.unzip = unzip;
    exports.untar = untar;
});
