/*jslint nomen: true */
/*global $, _, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Single Line Entry
**/

define(function () {
    "use strict";
    var roTask = {
            "Task": "singleLineEntry",
            "Type": "RequestOffering",
            "Label": "Single Line Entry",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: null,
            task: roTask,
            build: function build(promptElm, options) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                    console.log("roTask:build", {
                        "task": roTask,
                        "promptElm": promptElm,
                        "options": options
                    });
                }
                
                function processNext(targetElm, next, func) {
                    var targetElms = $(targetElm).nextAll(":not(.task-container)").slice(0, next);
                    _.each(targetElms, func);
                }

                /* Initialization code */
                function initROTask() {
                    options.next = options.next || 1;

                    function preventDefaultOnEnter(event) {
                        if (event.which === 13) {
                            event.preventDefault();
                        }
                    }

                    function logOnPaste(event) {
                        var data = event.originalEvent.clipboardData.getData("Text");
                        console.log("Paste Event", data);
                    }

                    processNext(promptElm, options.next, function (targetElm) {
                        $(targetElm).keydown(preventDefaultOnEnter).keyup(preventDefaultOnEnter).bind("paste", logOnPaste);
                    });
                }

                initROTask();
            }
        };

    return definition;
});