/*jslint nomen: true */
/*global $, app, console, performance, require */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Load Custom Request Offering Task Builder
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
    "CustomSpace/Scripts/serviceCatalog/roTaskBuilder"
], function (
    roTaskBuilder
) {
    "use strict";
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
        console.log("roTaskBuilder", performance.now());
    }

    function initTasks() {
        // Build out custom request offering tasks
        roTaskBuilder.build($("div.page-panel"), roTaskBuilder.node, function () {
            app.events.publish("roTasksReady");
        });
    }

    if (app.isSessionStored()) {
        initTasks();
    } else {
        app.events.subscribe("sessionStorageReady", function () {
            initTasks();
        });
    }
});