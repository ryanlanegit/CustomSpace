/*jslint nomen: true */
/*global app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Autosize Textarea
**/

define([
    "jquery/jquery.autosize.min.js"
], function () {
    "use strict";
    var roTask = {
            "Task": "autoSize",
            "Type": "RequestOffering",
            "Label": "Autosize Textarea",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: null,
            task: roTask,
            build: function build(promptElm, options) {
                if (app.storage.custom.get("debug")) {
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
                        target = promptElm,
                        targetContainer;

                    for (i = 0; i < options.next; i += 1) {
                        target = target.next();
                        if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                            target = target.next();
                        }

                        targetContainer = target.find("textarea");

                        targetContainer.autosize();
                    }
                }

                initROTask();
            }
        };

    return definition;
});