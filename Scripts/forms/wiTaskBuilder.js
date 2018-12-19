/*jslint nomen: true */
/*global $, _, app, console, define, performance */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Work Item Task Builder
**/

define([
    "CustomSpace/Scripts/forms/tasks/resolveIncident/controller"
], function () {
    "use strict";
    var taskModules = arguments,
        definition = {
            "build": function (vm, callback) {
                var ulElement = $(".taskmenu"),
                    taskCallback = function (view) {
                        ulElement.append(view);
                    };

                if (app.storage.custom.get("debug")) {
                    console.log("wiTaskBuilder:build", {
                        "performance": performance.now(),
                        "vm": vm,
                        "taskModules": taskModules
                    });
                }

                _.each(taskModules, function (taskModule) {
                    // vm.taskTemplate.tasks.push(taskModule.task);

                    if (taskModule.task.Access && taskModule.task.Type.indexOf(vm.type) !== -1) {
                        taskModule.build(vm, taskModule.task, function (view) {
                            taskCallback(view);
                        });
                    }
                });

                //send back <ul> with <li> of each task
                callback(ulElement);
            }
        };

    return definition;
});