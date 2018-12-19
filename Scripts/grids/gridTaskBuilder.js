/*jslint nomen: true */
/*global _, $, app, console, define, kendo */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Grid Task Builder
**/

define([
	"CustomSpace/Scripts/grids/tasks/anchor/controller",
	"CustomSpace/Scripts/grids/tasks/link/controller",
	"CustomSpace/Scripts/grids/tasks/task/controller"
], function () {
    "use strict";
    var gridTaskModules = arguments,
        definition = {
            build: function build(callback) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                    console.log("gridTaskBuilder:build");
                }
                /* BEGIN Functions */
                function getGridTaskViewModel() {
                    var gridTaskVm = new kendo.observable({
                        "add": function add(gridData, field, type, name, template, callback) {
                            var that = this,
                                // Look for provided column in grid by field name
                                taskColumn = _.filter(gridData.columns, function (colValue) {
                                    return colValue.field === field;
                                })[0];

                            if (!_.isUndefined(taskColumn)) {
                                if (_.isUndefined(taskColumn._style)) {
                                    // Add default blank style template function to column template
                                    Object.defineProperty(
                                        taskColumn,
                                        "_style",
                                        {
                                            enumerable: false,
                                            writable: true,
                                            value: function defaultStyle() { return ""; }
                                        }
                                    );
                                }

                                if (_.isUndefined(taskColumn._tasks)) {
                                    // Add empty tasks array to column template
                                    Object.defineProperty(
                                        taskColumn,
                                        "_tasks",
                                        {
                                            enumerable: false,
                                            writable: true,
                                            value: []
                                        }
                                    );
                                }

                                switch (type) {
                                case "style":
                                    // Set style template function to provided template
                                    taskColumn._style = template;
                                    break;
                                case "task":
                                    var existingTask = that.get(gridData, field, name);
                                    if (existingTask) {
                                        // Merge new task with existing one in the column template
                                        $.extend(existingTask, {
                                            name : name,
                                            template: template,
                                            callback: callback
                                        });
                                    } else {
                                        // Add new task to the column template
                                        taskColumn._tasks.push({
                                            name : name,
                                            template: template,
                                            callback: callback
                                        });
                                    }
                                    break;
                                }
                            } else {
                                console.log("gridTasks:add", "Warning! Unable to find field '" + field + "'.");
                            }
                        },
                        "get": function get(gridData, field, name) {
                            // Look for provided column in grid by field name
                            var taskColumn = _.filter(gridData.columns, function (colValue) {
                                return colValue.field === field;
                            })[0];

                            if (!_.isUndefined(taskColumn)) {
                                if (_.isUndefined(name)) {
                                    // Return all tasks for the provided field
                                    return taskColumn._tasks;
                                } else {
                                    // Look for the specific task named in the provided field
                                    var gridTask = _.filter(taskColumn._tasks, function (taskValue) {
                                        return taskValue.name === name;
                                    })[0];

                                    if (!_.isUndefined(gridTask)) {
                                        // Return the specific task in the provided field
                                        return gridTask;
                                    } else {
                                        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                                            console.log("gridTasks:get", "Warning! Unable to find task '" + name + "' in field '" + field + "'.");
                                        }
                                        return null;
                                    }
                                }
                            } else {
                                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                                    console.log("gridTasks:get", "Warning! Unable to find field '" + field + "'.");
                                }
                                return null;
                            }
                        },
                        // item is the task element clicked, bClickPropagation determines if click event should propagate
                        "callback": function callback(e, itemEle, bClickPropagation) {
                            var that = this,
                                item = $(itemEle),
                                gridData = item.closest("div[data-role='grid']").data("kendoGrid"),
                                itemData = item.data(),
                                itemRowEle = item.closest("tr").get(0),
                                dataItem = gridData.dataItem(itemRowEle),
                                data = {
                                    "event": e,
                                    "gridData": gridData,
                                    "itemRowEle": itemRowEle,
                                    "dataItem": dataItem,
                                    "itemData": itemData
                                },
                                existingTask = that.get(gridData, itemData.field, itemData.task);

                            console.log("gridTasks:callback", data);

                            if (existingTask) {
                                // Stop click propagation for jQuery click events if requested
                                if (!bClickPropagation) {
                                    e.stopPropagation();
                                }
                                
                                if (typeof existingTask.callback === "function") {
                                    existingTask.callback(data);
                                }
                            } else {
                                console.log("gridTasks:callback", "Unable to find task for callback.");
                            }
                        },
                        "updateGrid": function updateGrid(gridData) {
                            var that = this,
                                bUpdateGridTemplate = false;

                            $.each(gridData.columns, function (colIndex, column) {
                                if (!_.isUndefined(column._style)) {
                                    column.template = that.buildTemplate("anchor", column);
                                    bUpdateGridTemplate = true;
                                }
                            });

                            if (bUpdateGridTemplate) {
                                // Update grid row templates if custom tasks/styles are added
                                gridData.rowTemplate = gridData._tmpl(gridData.options.rowTemplate, gridData.columns);
                                gridData.altRowTemplate = gridData._tmpl(gridData.options.rowTemplate, gridData.columns);

                                // Refresh grid to show column template changes
                                gridData.refresh();
                            }
                        },
                        "buildTemplate": function buildTemplate(taskName, field, task, options) {
                            var gridTask = _.filter(gridTaskModules, function (gridTask) {
                                if (_.isUndefined(gridTask.task)) {
                                    return false;
                                }
                                else {
                                    return (gridTask.task.Task.toLowerCase() === taskName.toLowerCase());
                                }
                            })[0];

                            if (!_.isUndefined(gridTask)) {
                                return gridTask.build(field, task, options);
                            } else {
                                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                                    console.log("Property Not Found For Rendering:", taskName);
                                }
                                return null;
                            }
                        }
                    });

                    return gridTaskVm;
                }

                /* Initialization Code */
                function initGridTask() {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                        console.log("gridTaskBuilder:initGridTask", performance.now());
                    }
                    var gridTaskViewModel = getGridTaskViewModel();
                    app.custom.gridTasks = gridTaskViewModel;

                    if (typeof callback === "function") {
                        callback(gridTaskViewModel);
                    }
                }

                initGridTask();
            }
        };

	return definition;
});
