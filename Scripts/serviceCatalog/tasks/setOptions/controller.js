/*jslint nomen: true */
/*global $, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Set Options
**/

define(function () {
    "use strict";
    var roTask = {
            "Task": "setOptions",
            "Type": "RequestOffering",
            "Label": "Set Options",
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
                    var target = promptElm.next();
                    $(target).find("[data-role]").data().handler.setOptions(options);
                }

                initROTask();
            }
        };

    return definition;
});