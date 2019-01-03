/*jslint nomen: true */
/*global $, app, console, performance, require */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Load Custom Grid Task Builder
**/

require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        "text": "require/text",
        "CustomSpace": "../CustomSpace"
    }
});

require([
    "CustomSpace/Scripts/grids/gridTaskBuilder"
], function (
    gridTaskBuilder
) {
    "use strict";
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
        console.log("gridTaskMain:define", performance.now());
    }

    function initGridTasks() {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
            console.log("gridTaskMain:initGridTasks", performance.now());
        }
        
        gridTaskBuilder.build(function (gridTaskViewModel) {
            app.events.subscribe("dynamicPageReady", function publishGridTasksReady() {
                app.events.publish("gridTasksReady");
                // Unsubscibe from further dynamicPage events
                app.events.unsubscribe("dynamicPageReady", publishGridTasksReady);
            });
        });
    }

    initGridTasks();
});