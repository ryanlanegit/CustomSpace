/*jslint nomen: true */
/*global $, app, console, define */
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

                /* Initialization code */
                function initROTask() {
                    options.next = options.next || 1;

                    var i = 0,
                        target = promptElm;

                    function preventDefaultOnEnter(event) {
                        if (event.which === 13) {
                            event.preventDefault();
                        }
                    }

                    function logOnPaste(event) {
                        var data = event.originalEvent.clipboardData.getData("Text");
                        console.log("Paste Event", data);
                    }

                    for (i = 0; i < options.next; i += 1) {
                        target = target.next();
                        if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                            target = target.next();
                        }

                        $(target).keydown(preventDefaultOnEnter).keyup(preventDefaultOnEnter).bind("paste", logOnPaste);
                    }
                }

                initROTask();
            }
        };

    return definition;
});