/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

define(function (require, exports, module) {
    "use strict";

    var DocumentManager     = require("document/DocumentManager"),
        MainViewManager     = require("view/MainViewManager"),
        CommandManager      = require("command/CommandManager"),
        Commands            = require("command/Commands"),
        BinaryViewTemplate   = require("text!htmlContent/binary-view.html"),
        ProjectManager      = require("project/ProjectManager"),
        Strings             = require("strings"),
        StringUtils         = require("utils/StringUtils"),
        FileSystem          = require("filesystem/FileSystem"),
        UrlCache            = require("filesystem/impls/filer/UrlCache"),
        FileUtils           = require("file/FileUtils"),
        _                   = require("thirdparty/lodash"),
        Mustache            = require("thirdparty/mustache/mustache");

    var _viewers = {};

    function _getUrl(file) {
        return UrlCache.getUrl(file.fullPath);
    }

    function BinaryView(file, pane, deferred) {
        this.file = file;
        this.$container = pane.$content;
        this.paneId = pane.id;
        this.deferred = deferred;

        // Update the page if the file is renamed
        this.fileChangeHandler = _.bind(this._onFilenameChange, this);
        DocumentManager.on("fileNameChange", this.fileChangeHandler);

        this._buildPage(file, this.$container, false);
    }

    BinaryView.prototype._buildPage = function (file, $container, fileRename) {
        var self = this;

        // Since we are rebuilding the page by appending new markup
        // we have to remove the old viewer markup.
        if(fileRename && $container.find(".viewer-wrapper").length > 0) {
            $container.find(".viewer-wrapper").remove();
        }

        this.$el = $(Mustache.render(BinaryViewTemplate, {
            url: _getUrl(this.file),
            Strings: Strings
        }));
        $container.append(this.$el);

        _viewers[file.fullPath] = this;

        this.$fileSize = this.$el.find(".file-details");

        this.$binaryDownload = this.$el.find(".binary-download");
        this.$binaryDownload.on("click", function(e) {
            e.preventDefault();
            CommandManager.execute(Commands.FILE_DOWNLOAD, file.fullPath);
            return false;
        });

        this.$binaryNewTab = this.$el.find(".binary-new-tab");
        this.$binaryNewTab.on("click", function(e) {
            e.preventDefault();
            window.open(_getUrl(file), "_blank");
            return false;
        });

        this.$binaryForceEdit = this.$el.find(".binary-force-edit");
        this.$binaryForceEdit.on("click", function(e) {
            e.preventDefault();

            // Close this view and re-open in an editor
            self.destroy();

            // XXX: calling a private API here
            MainViewManager._open(self.paneId, file, {forceEditorOpen: true});

            return false;
        });

        file.stat(function (err, stat) {
            var deferred = self.deferred;
            self.deferred = null;

            if (err) {
                if(deferred) {
                    deferred.reject(err);
                }
                return;
            }

            var sizeString = stat.size ? StringUtils.prettyPrintBytes(stat.size, 2) : "";
            self.$fileSize.html(sizeString);

            if(deferred) {
                deferred.resolve(file);
            }
        });
    };

    BinaryView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        /*
         * File objects are already updated when the event is triggered
         * so we just need to see if the file has the same path as our image
         */
        if (this.file.fullPath === newPath) {
            delete _viewers[oldPath];
            this._buildPage(this.file, this.$container, true);
        }
    };

    BinaryView.prototype.getFile = function () {
        return this.file;
    };

    BinaryView.prototype.updateLayout = function () {
        var $container = this.$el.parent();

        var pos = $container.position(),
            iWidth = $container.innerWidth(),
            iHeight = $container.innerHeight(),
            oWidth = $container.outerWidth(),
            oHeight = $container.outerHeight();

        // $view is "position:absolute" so
        //  we have to update the height, width and position
        this.$el.css({top: pos.top + ((oHeight - iHeight) / 2),
                        left: pos.left + ((oWidth - iWidth) / 2),
                        width: iWidth,
                        height: iHeight});
    };

    BinaryView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off("fileNameChange", this.fileChangeHandler);

        this.$binaryDownload.off("click");
        this.$binaryNewTab.off("click");
        this.$binaryForceEdit.off("click");

        this.$el.remove();
    };

    BinaryView.prototype.refresh = function () {
        // TODO
        return;
    };

    function _handleFileSystemChange(event, entry, added, removed) {

        // this may have been called because files were added
        //  or removed to the file system.  We don't care about those
        if (!entry || entry.isDirectory) {
            return;
        }

        // Look for a viewer for the changed file
        var viewer = _viewers[entry.fullPath];

        // viewer found, call its refresh method
        if (viewer) {
            viewer.refresh();
        }
    }

    /*
     * Install an event listener to receive all file system change events
     * so we can refresh the view when changes are made to the image in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    // We don't register this with the MainViewFactory in the normal way, it's a catch-all binary view.
    exports.openFile = function openFile(file, pane) {
        var view = pane.getViewForPath(file.fullPath);
        var deferred = new $.Deferred();

        if (view) {
            pane.showView(view);
        } else {
            view = new BinaryView(file, pane, deferred);
            pane.addView(view, true);
        }

        return deferred.promise();
    };
});
