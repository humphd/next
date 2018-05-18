/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define({

    "GENERIC_ERROR": "(bal {0})",
    "NOT_FOUND_ERR": "Pe onongo ki twero nongo pwail /directory.",
    "NOT_READABLE_ERR": "Pe onongo ki twero kwano pwail /directory.",
    "EXCEEDS_MAX_FILE_SIZE": "Pe ki twero yabo pwail madit loyo {0} MB i {APP_NAME}.",
    "FILE_EXISTS_ERR": "Pwail onyo boc dong tye.",
    "FILE": "pwail",
    "FILE_TITLE": "Pwail",
    "DIRECTORY": "boc",
    "DIRECTORY_TITLE": "Boc",
    "DIRECTORY_NAMES_LEDE": "Nying boc",
    "FILENAMES_LEDE": "Nying pwail",
    "FILENAME": "Nying pwail",
    "DIRECTORY_NAME": "Nying boc",
    "FILE_EXISTS_HEADER": "Pwail ne dong tye.",
    "OPEN_DIALOG_ERROR": "Bal otime ikare me nyuto lapeny me yabo pwail. (bal {0})",
    "READ_DIRECTORY_ENTRIES_ERROR": "Bal otime ikare me kwano jami ma iyie boc <span class='dialog-filename'>{0}</span>. (error {1})",
    "ERROR_OPENING_FILE_TITLE": "Bal i yabo pwail",
    "ERROR_OPENING_FILE": "Bal otime ikare me temo yabo pwail <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_OPENING_FILES": "Bal otime ikare me temo yabo pwail magi:",
    "ERROR_SAVING_FILE_TITLE": "Bal i gwoko pwail",
    "ERROR_SAVING_FILE": "Bal otime ikare me temo gwoko pwail <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_RENAMING_FILE_TITLE": "Bal i loko nying pwail",
    "ERROR_RENAMING_DIRECTORY_TITLE": "Bal i loko nying boc",
    "ERROR_RENAMING_FILE": "Bal otime ikare me temo loko nying pwail <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_RENAMING_DIRECTORY": "Bal otime ikare me temo loko nying boc <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_DELETING_FILE_TITLE": "Bal i kwanyo pwail",
    "ERROR_DELETING_DIRECTORY_TITLE": "Bal i kwanyo boc",
    "ERROR_DELETING_FILE": "Bal otime ikare me temo kwanyo pwail <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_DELETING_DIRECTORY": "Bal otime ikare me temo kwanyo boc <span class='dialog-filename'>{0}</span>. {1}",
    "INVALID_FILENAME_TITLE": "Nying pwail mape atir",
    "INVALID_DIRNAME_TITLE": "Nying boc mape atir",
    "INVALID_FILENAME_MESSAGE": "Nying pwail pe twero tic ki lok ma ki gwoko pi nyonyo, gik ki ton (.) onyo tiyo ki kit acel magi: <code class='emphasized'>{1}</code>",
    "INVALID_DIRNAME_MESSAGE": "Nying boc pe twero tic ki lok ma ki gwoko pi nyonyo, gik ki ton (.) onyo tiyo ki kit acel magi: <code class='emphasized'>{1}</code>",
    "ENTRY_WITH_SAME_NAME_EXISTS": "Pwail onyo boc ki nying <span class='dialog-filename'>{0}</span> dong tye.",
    "ERROR_CREATING_FILE_TITLE": "Bal i cweeno pwail",
    "ERROR_CREATING_DIRECTORY_TITLE": "Bal i cweeno boc",
    "ERROR_CREATING_FILE": "Bal otime ikare me temo cweeno pwail <span class='dialog-filename'>{1}</span>. {2}",
    "ERROR_CREATING_DIRECTORY": "Bal otime ikare me temo cweeno boc <span class='dialog-filename'>{1}</span>. {2}",
    "ERROR_MAX_FILES_TITLE": "Bal i cano pwail",
    "EXT_MODIFIED_TITLE": "Alokaloka ki woko",
    "CONFIRM_FOLDER_DELETE_TITLE": "Mok kwanyo",
    "CONFIRM_FOLDER_DELETE": "Imoko ada ni imito kwanyo boc <span class='dialog-filename'>{0}</span>?",
    "CONFIRM_FILE_DELETE": "Imoko ada ni imito kwanyo <span class='dialog-filename'>{0}</span>?",
    "FILE_DELETED_TITLE": "Kikwanyo pwail",
    "DONE": "Otum",
    "OK": "AYA",
    "CANCEL": "Juki",
    "DELETE": "Kwany",
    "BUTTON_YES": "Eyo",
    "BUTTON_NO": "Pe",
    "USE_IMPORTED": "Tii ki pwail manyen",
    "KEEP_EXISTING": "Gwok pwail ma tye",
    "BUTTON_NEW_RULE": "Cik manyen",
    "CMD_FILE_NEW": "Pwail manyen",
    "CMD_FILE_NEW_FOLDER": "Boc manyen",
    "CMD_FILE_RENAME": "Lok nyinge",
    "CMD_FILE_DELETE": "Kwany",
    "CMD_FILE_DOWNLOAD": "Gam",
    "CMD_CUT": "Ngol",
    "CMD_COPY": "Loki",
    "CMD_PASTE": "Mwon",
    "CMD_SELECT_ALL": "Yer weng",
    "DND_UNSUPPORTED_FILE_TYPE": "kit pwail mape kicwako",
    "DND_FILE_REPLACE": "Pwail ma nyinge <span class='dialog-filename'>{0}</span> dong tye. Imito tic ki pwail manyen ni onyo gwoko ma tye ni?",
    "IMAGE_FILE_TITLE": "Pwail me Cal",
    "IMAGE_SAVE_WITH_FILTERS": "Keti",
    "IMAGE_RESET_FILTERS": "Juki",
    "FONT_FILE": "",
    "VIDEO_FILE": "Pwail me Vidio",
    "VIDEO_OPTIONS": "Jami ayera me vidio",
    "VIDEO_CODE_SAMPLE": "Kobi &amp; mwon kod man  me medo vidio man ii potbuk me HTML",
    "VIDEO_OPTION_AUTOPLAY": "Cak tuko vidio pire kene",
    "VIDEO_OPTION_LOOPING": "Nwo cako vidio ka otum",
    "VIDEO_OPTION_DISABLE_AUDIO": "Juk dwone",
    "AUDIO_FILE": "Pwail me dwon",
    "AUDIO_OPTIONS": "Jami ayera me dwon",
    "AUDIO_OPTION_AUTOPLAY": "Cak tuko vidio pire kene",
    "AUDIO_OPTION_LOOPING": "Nwo cako vidio ka otum",
    "BINARY_FILE_OPTIONS_TITLE": "Ento itwero...",
    "BINARY_FILE_DOWNLOAD": "Gam",
    "BINARY_FILE_OPEN": "Yab i dirica matidi manyen",
    "BINARY_FILE_TRY_EDIT": "Tem yubo",
    "PDF_FILE_TITLE": "Pwail me PDF",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "Rangi eni",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "Rangi me wiati",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} (Kitiyo kwede tyen {1})",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} (Kitiyo kwede tyen {1})",
    "DOCS_MORE_LINK": "Kwan mapol",
    "UPLOAD_FILES_DIALOG_HEADER": "Ket pwail",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "...onyo ywar pwail kany.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "AYA, wek pwail!",
    "UPLOADING_INDICATOR": "Tye ka keto...",
    "BUTTON_FROM_YOUR_COMPUTER": "Ki ii kompiuta ni...",
    "CMD_MOVE_FILE": "Kobi ii...",
    "PICK_A_FOLDER_TO_MOVE_TO": "Yer boc",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "Bal i kobo",
    "UNEXPECTED_ERROR_MOVING_FILE": "Bal ma pe ngene otime i kare me temo kobo {0} ii {1}",
    "ERROR_MOVING_FILE_SAME_NAME": "Pwail onyo boc ma tye ki nying {0} dong tye i {1}. Tam me loko nying acel me mede.",
    "CONSOLE_TITLE": "Kacoc",
    "CONSOLE_TOOLTIP": "Yab kacoc me JavaScript",
    "CONSOLE_CLEAR": "Jwa",
    "CONSOLE_CLEAR_TOOLTIP": "Jwa kacoc",
    "CONSOLE_CLOSE_TOOLTIP": "Lor kacoc",
    "CONSOLE_HELPTEXT": "Me tic ki kacoc, med <code>console.log(&quot;Hello World!&quot;);</code> ii pwail me JavaScript mamegi."
});
