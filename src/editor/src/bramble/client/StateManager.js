/*global define*/
/*jslint bitwise: true */
define(function() {
    "use strict";

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
        clear: function() {
            memoryStorage._items = {};
        }
    };

    var localStorage = (function(window) {
        if(typeof window.localStorage === 'undefined') {
            return memoryStorage;
        }
        return window.localStorage;
    }(window));

    function prefix(name) {
        return "bramble-property::" + name;
    }

    function getString(storage, property) {
        var val = storage.getItem(prefix(property));
        return val || null;
    }

    function getBool(storage, property) {
        var str = getString(storage, property);
        if(str === "true") {
            return true;
        } else if(str === "false") {
            return false;
        } else {
            // not set
            return null;
        }
    }

    function getInt(storage, property) {
        var str = getString(storage, property);
        return str|0;
    }

    function getObject(storage, property) {
        var objStr = getString(storage, property);
        var obj = {};

        try {
            obj = JSON.parse(objStr);
        } catch(e) {
            console.error("Failed to parse object from localStorage item " + prefix(property) + " with: ", e);
        }

        return obj;
    }

    function setObject(storage, property, obj) {
        if(!obj) {
          return;
        }

        var objStr;
        property = prefix(property);

        try {
            objStr = JSON.stringify(obj);
            storage.setItem(property, objStr);
        } catch(e) {
            console.error("Failed to stringify object to write to localStorage for item " + property + " with: ", e);
        }
    }

    function StateManager(disableStorage) {
        var storage;
        if(disableStorage) {
            // Wipe any data we have in storage now and use memory
            localStorage.clear();
            storage = memoryStorage;
        } else {
            storage = localStorage;
        }

        Object.defineProperties(this, {
            fontSize: {
                get: function()  { return getString(storage, "fontSize"); },
                set: function(v) { storage.setItem(prefix("fontSize"), v); }
            },
            theme: {
                get: function()  { return getString(storage, "theme"); } ,
                set: function(v) { storage.setItem(prefix("theme"), v); }
            },
            sidebarVisible: {
                get: function()  { return getBool(storage, "sidebarVisible");  },
                set: function(v) { storage.setItem(prefix("sidebarVisible"), v); }
            },
            sidebarWidth: {
                get: function()  { return getInt(storage, "sidebarWidth"); },
                set: function(v) { storage.setItem(prefix("sidebarWidth"), v); }
            },
            firstPaneWidth: {
                get: function()  { return getInt(storage, "firstPaneWidth");  },
                set: function(v) { storage.setItem(prefix("firstPaneWidth"), v); }
            },
            secondPaneWidth: {
                get: function()  { return getInt(storage, "secondPaneWidth"); },
                set: function(v) { storage.setItem(prefix("secondPaneWidth"), v); }
            },
            previewMode: {
                get: function()  { return getString(storage, "previewMode"); },
                set: function(v) { storage.setItem(prefix("previewMode"), v); }
            },
            filename: {
                get: function()  { return getString(storage, "filename"); },
                set: function(v) { storage.setItem(prefix("filename"), v); }
            },
            fullPath: {
                get: function()  { return getString(storage, "fullPath"); },
                set: function(v) { storage.setItem(prefix("fullPath"), v); }
            },
            wordWrap: {
                get: function()  { return getBool(storage, "wordWrap"); },
                set: function(v) { storage.setItem(prefix("wordWrap"), v); }
            },
            autoCloseTags: {
                get: function()  { return getObject(storage, "closeTags"); },
                set: function(v) { setObject(storage, "closeTags", v); }
            },
            allowJavaScript: {
                get: function()  { return getBool(storage, "allowJavaScript"); },
                set: function(v) { storage.setItem(prefix("allowJavaScript"), v); }
            },
            allowWhiteSpace: {
                get: function()  { return getBool(storage, "allowWhiteSpace"); },
                set: function(v) { storage.setItem(prefix("allowWhiteSpace"), v); }
            },
            allowAutocomplete: {
                get: function()  { return getBool(storage, "allowAutocomplete"); },
                set: function(v) { storage.setItem(prefix("allowAutocomplete"), v); }
            },
            autoUpdate: {
                get: function()  { return getBool(storage, "autoUpdate"); },
                set: function(v) { storage.setItem(prefix("autoUpdate"), v); }
            },
            openSVGasXML: {
                get: function()  { return getBool(storage, "openSVGasXML"); },
                set: function(v) { storage.setItem(prefix("openSVGasXML"), v); }
            }
        });
    }

    return StateManager;
});
