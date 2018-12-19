/*jslint nomen: true */
/*global _, $, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Add Information
**/

define([
    "text!CustomSpace/Scripts/serviceCatalog/tasks/addInformation/view.html"
], function (
    addInformationTemplate
) {
    "use strict";
    var roTask = {
            "Task": "addInformation",
            "Type": "RequestOffering",
            "Label": "Add Information",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: addInformationTemplate,
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
                    if (!options.info && !options.icon) {
                        return;
                    }
                    var target = promptElm.next(),
                        builtInfo = _.template(addInformationTemplate),
                        infoResult = builtInfo(options);
                    $(target).append(infoResult);
                }

                initROTask();
            }
        };

    return definition;
});