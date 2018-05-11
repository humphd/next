/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, parent, brackets: true */

define(function (require, exports, module) {
    "use strict";

    var CommandManager     = brackets.getModule("command/CommandManager");
    var EditorManager      = brackets.getModule("editor/EditorManager");
    var Commands           = brackets.getModule("command/Commands");
    var FileSystem         = brackets.getModule("filesystem/FileSystem");
    var HTMLRewriter       = brackets.getModule("filesystem/impls/filer/lib/HTMLRewriter");
    var SidebarView        = brackets.getModule("project/SidebarView");
    var StatusBar          = brackets.getModule("widgets/StatusBar");
    var WorkspaceManager   = brackets.getModule("view/WorkspaceManager");
    var BrambleEvents      = brackets.getModule("bramble/BrambleEvents");
    var StartupState       = brackets.getModule("bramble/StartupState");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var _                  = brackets.getModule("thirdparty/lodash");
    var ArchiveUtils       = brackets.getModule("filesystem/impls/filer/ArchiveUtils");
    var Sizes              = brackets.getModule("filesystem/impls/filer/lib/Sizes");

    var SVGUtils = require("lib/SVGUtils");
    var MouseManager = require("lib/MouseManager");
    var PostMessageTransport = require("lib/PostMessageTransport");
    var Tutorial = require("lib/Tutorial");
    var Theme = require("lib/Theme");
    var UI = require("lib/UI");
    var IframeBrowser = require("lib/iframe-browser");

    function _remoteCallbackFn(callback) {
        return function() {
            var message = {
                type: "bramble:remoteCommand:callback",
                callback: callback
            };
            parent.postMessage(JSON.stringify(message), "*");
        };
    }

    // Built-in Brackets Commands
    function _bracketsCommand(command, args, callback) {
        function executeCommand() {
            args.unshift(Commands[command]);
            CommandManager.execute.apply(null, args).always(callback);
        }

        // Fix outdated calls for new folder command (used to be FILE_FOLDER)
        if(command === "FILE_FOLDER") {
            command = "FILE_NEW_FOLDER";
        }

        // Some commands require focus in the editor
        switch(command) {
        case "EDIT_UNDO":
        case "EDIT_REDO":
        case "VIEW_INCREASE_FONT_SIZE":
        case "VIEW_DECREASE_FONT_SIZE":
        case "VIEW_RESTORE_FONT_SIZE":
            // Make sure the last-focused editor gets focus before executing
            var editor = EditorManager.getActiveEditor();
            if (editor && !editor.hasFocus()) {
                editor.one("focus", executeCommand);
                editor.focus();
            } else {
                executeCommand();
            }
            break;
        default:
            executeCommand();
            break;
        }
    }

    // Custom Bramble commands
    function _brambleCommand(command, args, callback) {
        var skipCallback = false;

        switch(command) {
        case "BRAMBLE_RELOAD":
            // If JS is disabled, re-enable it just for this next reload.
            HTMLRewriter.forceScriptsOnce();
            PostMessageTransport.reload(true);
            break;
        case "BRAMBLE_MOBILE_PREVIEW":
            UI.showMobileView();
            break;
        case "BRAMBLE_DESKTOP_PREVIEW":
            UI.showDesktopView();
            break;
        case "BRAMBLE_ENABLE_FULLSCREEN_PREVIEW":
            UI.enableFullscreenPreview();
            break;
        case "BRAMBLE_DISABLE_FULLSCREEN_PREVIEW":
            UI.disableFullscreenPreview();
            break;
        case "BRAMBLE_ENABLE_AUTO_UPDATE":
            PreferencesManager.set("autoUpdate", true);
            PostMessageTransport.setAutoUpdate(true);
            break;
        case "BRAMBLE_DISABLE_AUTO_UPDATE":
            PreferencesManager.set("autoUpdate", false);
            PostMessageTransport.setAutoUpdate(false);
            break;
        case "BRAMBLE_ENABLE_SCRIPTS":
            PreferencesManager.set("allowJavaScript", true);
            PostMessageTransport.reload();
            break;
        case "BRAMBLE_DISABLE_SCRIPTS":
            PreferencesManager.set("allowJavaScript", false);
            PostMessageTransport.reload();
            break;
        case "BRAMBLE_ENABLE_WHITESPACE":
            PreferencesManager.getExtensionPrefs("denniskehrig.ShowWhitespace").set("enabled", true);
            break;
        case "BRAMBLE_DISABLE_WHITESPACE":
            PreferencesManager.getExtensionPrefs("denniskehrig.ShowWhitespace").set("enabled", false);
            break;
        case "BRAMBLE_ENABLE_INSPECTOR":
            MouseManager.enableInspector();
            break;
        case "BRAMBLE_ENABLE_AUTOCOMPLETE":
            PreferencesManager.set("codehint.TagHints", true);
            PreferencesManager.set("codehint.AttrHints", true);
            PreferencesManager.set("codehint.JSHints", true);
            PreferencesManager.set("codehint.CssPropHints", true);
            break;
        case "BRAMBLE_DISABLE_AUTOCOMPLETE":
            PreferencesManager.set("codehint.TagHints", false);
            PreferencesManager.set("codehint.AttrHints", false);
            PreferencesManager.set("codehint.JSHints", false);
            PreferencesManager.set("codehint.CssPropHints", false);
            break;

        case "BRAMBLE_DISABLE_INSPECTOR":
            // Disable the inspector, and clear any marks in the preview/editor
            MouseManager.disableInspector(true);
            break;
        case "BRAMBLE_LIGHT_THEME":
            Theme.setTheme("light-theme");
            break;
        case "BRAMBLE_DARK_THEME":
            Theme.setTheme("dark-theme");
            break;
        case "BRAMBLE_SHOW_SIDEBAR":
            SidebarView.show();
            break;
        case "BRAMBLE_HIDE_SIDEBAR":
            SidebarView.hide();
            break;
        case "BRAMBLE_SHOW_PREVIEW":
            IframeBrowser.show();
            break;
        case "BRAMBLE_HIDE_PREVIEW":
            IframeBrowser.hide();
            break;
        case "BRAMBLE_HIDE_STATUSBAR":
            StatusBar.disable();
            break;
        case "BRAMBLE_SHOW_STATUSBAR":
            StatusBar.enable();
            break;
        case "BRAMBLE_ENABLE_WORD_WRAP":
            PreferencesManager.set("wordWrap", true);
            break;
        case "BRAMBLE_DISABLE_WORD_WRAP":
            PreferencesManager.set("wordWrap", false);
            break;
        case "BRAMBLE_CONFIGURE_AUTO_CLOSE_TAGS":
            PreferencesManager.set("closeTags", args[0]);
            break;
        case "BRAMBLE_OPEN_SVG_AS_XML":
            skipCallback = true;
            SVGUtils.showXML(callback);
            break;
        case "BRAMBLE_OPEN_SVG_AS_IMAGE":
            skipCallback = true;
            SVGUtils.showImage(callback);
            break;
        case "BRAMBLE_SHOW_TUTORIAL":
            Tutorial.setOverride(true);
            break;
        case "BRAMBLE_HIDE_TUTORIAL":
            Tutorial.setOverride(false);
            break;
        case "BRAMBLE_SHOW_UPLOAD_FILES_DIALOG":
            // Show dialog, see extensions/default/UploadFiles
            skipCallback = true;
            CommandManager.execute("bramble.showUploadFiles").always(callback);
            break;
        case "BRAMBLE_ADD_NEW_FILE":
            skipCallback = true;
            // Make sure we have enough room to add new files.
            if(Sizes.getEnforceLimits()) {
                CommandManager
                    .execute("bramble.projectSizeError")
                    .always(callback);
            } else {
                CommandManager
                    .execute("bramble.addFile", args[0])
                    .always(callback);
            }
            break;
        case "BRAMBLE_EXPORT":
            skipCallback = true;
            ArchiveUtils.archive(StartupState.project("root"), callback);
            break;
        case "RESIZE":
            // The host window was resized, update all panes
            WorkspaceManager.recomputeLayout(true);
            BrambleEvents.triggerUpdateLayoutEnd();
            break;
        case "BRAMBLE_ADD_CODE_SNIPPET":
            skipCallback = true;
            CommandManager.execute("bramble.addCodeSnippet", args[0]).always(callback);
            break;
        case "BRAMBLE_ENABLE_PROJECT_CAPACITY_LIMITS":
            skipCallback = true;
            Sizes.setEnforceLimits(true);
            CommandManager.execute("bramble.projectSizeError").always(callback);
            break;
        case "BRAMBLE_DISABLE_PROJECT_CAPACITY_LIMITS":
            Sizes.setEnforceLimits(false);
            break;
        case "BRAMBLE_PROJECT_SIZE_CHANGE":
            UI.setProjectSizeInfo(args[0]);
            break;
        default:
            console.log('[Bramble] unknown command:', command);
            skipCallback = true;
            break;
        }

        if(!skipCallback) {
            callback();
        }
    }

    function handleRequest(e) {
        var remoteRequest;
        try {
            remoteRequest = JSON.parse(e.data);
        } catch(err) {
            // Ignore any data that isn't JSON (e.g., coming from browser extension)
            return;
        }

        if (remoteRequest.type !== "bramble:remoteCommand") {
            return;
        }

        // If arguments are sent, we make sure they are in the form of an array
        var args = remoteRequest.args;
        if(!_.isArray(args)) {
            args = [args];
        }

        switch(remoteRequest.commandCategory) {
        case "brackets":
            _bracketsCommand(remoteRequest.command, args, _remoteCallbackFn(remoteRequest.callback));
            break;
        case "bramble":
            _brambleCommand(remoteRequest.command, args, _remoteCallbackFn(remoteRequest.callback));
            break;
        default:
            console.error('[Bramble] unknown remote command request:', remoteRequest);
            break;
        }
    }

    exports.handleRequest = handleRequest;
});
