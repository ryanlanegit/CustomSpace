/*jslint nomen: true */
/*global $, _, app, console, define */
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
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("DEBUG_ENABLED")) {
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
                    options.level = options.level || 1;
                    options.next = options.next || 1;

                    processNext(promptElm, options.next, function (targetElm) {
                        var targetElmContainer = $(targetElm).children("div.col-xs-12");
                        targetElmContainer.addClass("indent-" + options.level);
                    });
                }

                initROTask();
            }
        };

    return definition;
});