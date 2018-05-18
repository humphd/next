define(function (require, exports, module) {
    "use strict";

    var Commands       = require("command/Commands");
    var CommandManager = require("command/CommandManager");
    var PopoverWidget  = require("editor/PopoverWidget");

    var popoverContent = "<span></span>";

    var disabled = false;

    function enable() {
        disabled = false;
    }

    function disable() {
        disabled = true;
        hideIndicator();
    }

    function triggerEditorProvider() {
        CommandManager.execute(Commands.TOGGLE_QUICK_EDIT);
        hideIndicator();
        return false;
    }

    function hideIndicator() {
        PopoverWidget.hide();
    }

    function showIndicator(editor) {
        var cm = editor._codeMirror;
        var pos = editor.getCursorPos();
        var coord = cm.charCoords(pos);

        if(disabled) {
            return;
        }

        var popover = {
            editor: editor,
            content: popoverContent,
            xpos: coord.left,
            ytop: coord.top,
            ybot: coord.bottom,
            onClick: triggerEditorProvider
        };

        PopoverWidget.show(popover);
    }

    exports.enable = enable;
    exports.disable = disable;
    exports.show = showIndicator;
    exports.hide = hideIndicator;
});
