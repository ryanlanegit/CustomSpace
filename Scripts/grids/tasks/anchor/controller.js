/*jslint nomen: true */
/*global _, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Grid Anchor
**/

define([
    "text!CustomSpace/Scripts/grids/tasks/anchor/view.html"
], function (
    anchorTemplate
) {
    "use strict";
    var gridTask = {
            "Task": "anchor",
            "Type": "Grid",
            "Label": "Grid Task Anchor",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: anchorTemplate,
            task: gridTask,
            build: function build(column) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("DEBUG_ENABLED")) {
                    console.log("gridTask:build", {
                        "gridTask": gridTask,
                        "column": column
                    });
                }

                /* Initialization code */
                function initGridTask() {
                    var builtAnchor = _.template(anchorTemplate);
					return builtAnchor(column);
                }

                return initGridTask();
            }
        };

    return definition;
});