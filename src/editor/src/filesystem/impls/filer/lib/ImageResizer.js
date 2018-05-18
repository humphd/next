/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */
define(function (require, exports, module) {
    "use strict";

    var Content = require("filesystem/impls/filer/lib/content");
    var Path = require("filesystem/impls/filer/FilerUtils").Path;
    var Buffer = require("filesystem/impls/filer/FilerUtils").Buffer;
    var decodePath = require("filesystem/impls/filer/FilerUtils").decodePath;
    var base64ToBuffer = require("filesystem/impls/filer/FilerUtils").base64ToBuffer;
    var Sizes = require("filesystem/impls/filer/lib/Sizes");

    var pica = require("Pica")();

    // Max number of resize passes we allow
    var MAX_RESIZE_PASSES = 5;


    function ImageResizer(path, data) {
        this.path = decodePath(path);
        this.type = Content.mimeFromExt(Path.extname(this.path));
        this.size = data.length;
        this.blob = new Blob([data], {type: this.type});
        this.url = URL.createObjectURL(this.blob);
        this.canvas = document.createElement('canvas');
    }
    ImageResizer.prototype.cleanup = function() {
        URL.revokeObjectURL(this.url);
    };
    ImageResizer.prototype.resizedToBuffer = function(callback) {
        var canvas = this.canvas;

        // If possible, use native methods to read out canvas data
        if (canvas.toBlob) {
            canvas.toBlob(function(blob) {
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    delete fileReader.onload;
                    var buffer = new Buffer(this.result);
                    callback(null, buffer);
                };
                fileReader.onerror = function() {
                    callback(new Error("unable to read data"));
                };
                fileReader.readAsArrayBuffer(blob);
            });
        }
        // Fallback for browsers without necessary native methods
        else {
            var base64Str = canvas.toDataURL(self.type).split(',')[1];
            var buffer = base64ToBuffer(base64Str);
            callback(null, buffer);
        }
    };
    ImageResizer.prototype.resize = function(callback) {
        var self = this;
        var buffer;
        var passes = 0;

        // do a "best guess" initial scale
        var TARGET_SIZE = Sizes.RESIZED_IMAGE_TARGET_SIZE_KB;
        var scale = Math.sqrt(TARGET_SIZE / self.size);
        var step = scale / 2;

        function unexpectedInitialGuess(bufferSize) {
            // As we're using a binary search, we know that our initial guess
            // "cannot" be below target/2 and 3*target/2. If it is, we guessed
            // wrong and should redo our initial guess.
            if (bufferSize < TARGET_SIZE * 0.5) {
                return true;
            }
            if (bufferSize > TARGET_SIZE * 1.5) {
                return true;
            }
            return false;
        }

        function redoInitialGuess(currentScale, bufferSize) {
            // Given the current scale and size, what would the original
            // image size be if it had run through our image resizer?
            var csSquared = currentScale * currentScale;
            var DERIVED_ORIGINAL_SIZE = bufferSize / csSquared;

            // Given that original size, what would be a better scale
            // at which to likely hit our target filesize?
            scale = Math.sqrt(TARGET_SIZE / DERIVED_ORIGINAL_SIZE);
            step = scale / 2;
        }

        function finish(err, buffer) {
            delete img.onload;
            delete img.onerror;
            self.cleanup();
            callback(err, buffer);
        }

        function resizePass() {
            if(passes++ > MAX_RESIZE_PASSES) {
                return finish(null, buffer);
            }

            self.canvas.width = img.width * scale;
            self.canvas.height = img.height * scale;

            pica.resize(img, self.canvas)
            .then(function() {
                self.resizedToBuffer(function(err, resizedBuffer) {
                    if(err) {
                        return finish(err);
                    }

                    // Retain this buffer, in case it's the best we can do.
                    buffer = resizedBuffer;
                    var bufferSize = buffer.length;

                    // Too big?
                    if(bufferSize > TARGET_SIZE + Sizes.IMAGE_RESIZE_TOLERANCE_KB) {
                        if (passes===1 && unexpectedInitialGuess(bufferSize)) {
                            redoInitialGuess(scale, bufferSize);
                        } else {
                            scale = scale - step;
                            step /= 2;
                        }

                        resizePass();
                    }

                    // Smaller than necessary?
                    else if(bufferSize < TARGET_SIZE - Sizes.IMAGE_RESIZE_TOLERANCE_KB) {
                        if (passes===1 && unexpectedInitialGuess(bufferSize)) {
                            redoInitialGuess(scale, bufferSize);
                        } else {
                            scale = scale + step;
                            step /= 2;
                        }

                        resizePass();
                    }

                    // We're done, use this one
                    else {
                        finish(null, buffer);
                    }
                });
            })
            .catch(finish);
        }

        var img = new Image();
        img.onload = resizePass;
        img.onerror = function() {
            finish(new Error("Unable to load image for resizing"));
        };
        img.src = self.url;
    };

    /**
     * Resize an image and write back to the filesystem
     */
    function resize(path, data, callback) {
        var resizer = new ImageResizer(path, data);
        resizer.resize(callback);
    }

    exports.resize = resize;
});
