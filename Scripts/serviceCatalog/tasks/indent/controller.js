/*jslint nomen: true */
/*global $, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Indent
**/

define(function () {
    "use strict";
    var roTask = {
            "Task": "indent",
            "Type": "RequestOffering",
            "Label": "Indent",
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
                    options.level = options.level || 1;
                    options.next = options.next || 1;

                    var i = 0,
                        target = promptElm,
                        targetContainer;

                    for (i = 0; i < options.next; i += 1) {
                        target = target.next();
                        if (target.find("p:contains('{\"'), p:contains('{ \"')").length) {
                            target = target.next();
                        }

                        targetContainer = $(target).children("div.col-xs-12");
                        targetContainer.addClass("indent-" + options.level);
                    }
                }

                initROTask();
            }
        };

    return definition;
});