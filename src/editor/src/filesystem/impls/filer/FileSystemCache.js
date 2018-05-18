/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var Content = require("filesystem/impls/filer/lib/content");
    var async = require("filesystem/impls/filer/lib/async");
    var BracketsFiler = require("filesystem/impls/filer/BracketsFiler");
    var UrlCache = require("filesystem/impls/filer/UrlCache");
    var Path = BracketsFiler.Path;
    var Transforms = require("filesystem/impls/filer/lib/transforms");
    var StartupState = require("bramble/StartupState");
    var decodePath = require("filesystem/impls/filer/FilerUtils").decodePath;

    // Walk the project root dir and make sure we have URLs generated for
    // all file paths.  Skip CSS and HTML files, since we need to rewrite them
    // before they are useful (e.g., for linked files within them).
    exports.refresh = function(callback) {
        var fs = BracketsFiler.fs();

        function _getUrlAsync(filename, callback) {
            var decodedFilename = decodePath(filename);
            var cachedUrl = UrlCache.getUrl(filename);

            // For Blob URLs, skip HTML and CSS files, since we need to run a rewriter over them
            // before we can serve.
            if(Content.needsRewriting(Path.extname(decodedFilename)) && UrlCache.getShouldRewriteUrls()) {
                return callback(null);
            }

            fs.readFile(decodedFilename, null, function(err, data) {
                if(err) {
                    callback(err);
                    return;
                }

                var mime = Content.mimeFromExt(Path.extname(decodedFilename));
                UrlCache.createURL(filename, data, mime, callback);
            });
        }

        function _load(dirPath, callback) {
            fs.readdir(dirPath, function(err, entries) {
                if(err) {
                    return callback(err);
                }

                function _getUrl(name, callback) {
                    name = Path.join(dirPath, name);

                    fs.stat(name, function(err, stats) {
                        if(err) {
                            return callback(err);
                        }

                        if(stats.type === 'DIRECTORY') {
                            _load(name, callback);
                        } else {
                            // If there's a transform needed for this file, do that first.
                            Transforms.applyTransform(name, function(err) {
                                if(err) {
                                    return callback(err);
                                }

                                _getUrlAsync(name, callback);
                            });
                        }
                    });
                }

                async.eachSeries(entries, _getUrl, callback);
            });
        }

        UrlCache.clear(function(err) {
            if(err) {
                return callback(err);
            }
            _load(StartupState.project("root"), callback);
        });
    };
});
