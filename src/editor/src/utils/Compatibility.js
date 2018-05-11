/*
 * Copyright (c) 2014 - present Adobe Systems Incorporated. All rights reserved.
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

/**
 * Compatibility shims for running Brackets in various environments, browsers.
 */
define(function (require, exports, module) {
    "use strict";

    // [IE10] String.prototype missing trimRight() and trimLeft()
    if (!String.prototype.trimRight) {
        String.prototype.trimRight = function () { return this.replace(/\s+$/, ""); };
    }
    if (!String.prototype.trimLeft) {
        String.prototype.trimLeft = function () { return this.replace(/^\s+/, ""); };
    }
    
    // Support for Math.log10 [IE11]
    Math.log10 = Math.log10 || function(x) {
        return Math.log(x) * Math.LOG10E;
    };

    // [IE] Number.isFinite() is missing
    Number.isFinite = Number.isFinite || function(value) {
        return typeof value === 'number' && isFinite(value);
    };

    // Feature detection for Error.stack. Not all browsers expose it
    // and Brackets assumes it will be a non-null string.
    if (typeof (new Error()).stack === "undefined") {
        Error.prototype.stack = "";
    }

    var memoryStorage = {
        _items: {},
        getItem: function(key) {
            return memoryStorage._items[key];
        },
        setItem: function(key, value) {
            // Mimic localStorage string storage
            value = "" + value;
            memoryStorage._items[key] = value;
        },
        removeItem: function(key) {
            delete memoryStorage._item[key];
        },
        clear: function() {
            memoryStorage._items = {};
        }
    };

    exports.localStorage = (function(window) {
        var localStorage;

        try {
            localStorage = window.localStorage;
            if(typeof window.localStorage === 'undefined') {
                console.warn("localStorage is unavailable, using temporary memory storage instead");
                localStorage = memoryStorage;
            }
        } catch(e) {
            console.warn("Unable to use localStorage in Brackets with: ", e);
            localStorage = memoryStorage;
        } finally {
            return localStorage;
        }
    }(window));

});
