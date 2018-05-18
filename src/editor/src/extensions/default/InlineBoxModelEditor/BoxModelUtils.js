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

/**
 *  Utilities regular expressions related to padding rule matching
 *
 */
define(function (require, exports, module) {
    "use strict";
    /**
     * Regular expression that matches the css rule for paddiing values after the
     * colon is optional
     * @const @type {RegExp}
     */
    var BOXMODEL_REGEX = new RegExp('(.*padding:.*|.*margin:.*)');

    /**
     * Regular expression that matches the reasonable format of css value for padding or margin,
     * starting with a number or decimal followed by any scalable units listed in the
     * expression. Such pattern may occur up to 4 times since maximum of 4 sides can be used.
     * We use a regex as detailed below:
     * (\d+\.?\d*) matches a decimal or integer number
     * (px|em|%)? matches the unit which is optional (mainly for 0)
     * {1,4} makes sure that the above two groups together are only present
     * between 1 to 4 times (both inclusive).
     * @const @type {RegExp}
     */
    var BOXMODEL_VALUE_REGEX = new RegExp(/((\d+\.?\d*)(px|em|%)?){1,4}.*/);
    // Matches a single value and captures the number and unit. Use it with exec()
    // to find successive values in a valid BOXMODEL value string.
    var BOXMODEL_SINGLE_VALUE_REGEX = new RegExp(/(\d+\.?\d*)(px|em|%)?/, "g");

    // declaring constants for padding and margin
    var MARGIN = "margin";
    var PADDING = "padding";
    // Define public API
    exports.BOXMODEL_REGEX = BOXMODEL_REGEX;
    exports.BOXMODEL_VALUE_REGEX = BOXMODEL_VALUE_REGEX;
    exports.BOXMODEL_SINGLE_VALUE_REGEX = BOXMODEL_SINGLE_VALUE_REGEX;
    exports.MARGIN = MARGIN;
    exports.PADDING = PADDING;

});

