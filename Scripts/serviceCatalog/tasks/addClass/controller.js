/*jslint nomen: true */
/*global app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Add Class
**/

define(function () {
    "use strict";
    var roTask = {
            "Task": "addClass",
            "Type": "RequestOffering",
            "Label": "Add Class",
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
                    if (!options.cssclass) {
                        return;
                    }
                    var target = promptElm.next();
                    target.addClass(options.cssclass);
                }

                initROTask();
            }
        };

    return definition;
});