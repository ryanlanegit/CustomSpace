/*jslint nomen: true */
/*global app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Layout Template
**/

define(function () {
    "use strict";
    var roTask = {
            "Task": "layoutTemplate",
            "Type": "RequestOffering",
            "Label": "Layout Template",
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
                    if (!options.template) {
                        return;
                    }
                }

                initROTask();
            }
        };

    return definition;
});