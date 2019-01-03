/*jslint nomen: true */
/*global $, _, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Add Information
**/

define([
    "text!CustomSpace/Scripts/page/tasks/groupPicker/view.html"
], function (
    groupPickerTemplate
) {
    "use strict";
    var roTask = {
            "Task": "addInformation",
            "Type": "RequestOffering",
            "Label": "Group Picker",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: groupPickerTemplate,
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

                    if (!options.info && !options.icon) {
                        return;
                    }
                    var target = promptElm.next(),
                        builtInfo = _.template(groupPickerTemplate);

                    processNext(promptElm, options.next, function (targetElm) {
                        $(targetElm).append(builtInfo(options));
                    });
                }

                initROTask();
            }
        };

    return definition;
});