/*jslint nomen: true */
/*global $, app, console, performance, require */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Load Custom Page Task Builder
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
    "CustomSpace/Scripts/page/pageTaskBuilder"
], function (
    pageTaskBuilder
) {
    "use strict";
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
        console.log("pageTaskBuilder", performance.now());
    }

    function initTasks() {
        // Build out custom request offering tasks
        pageTaskBuilder.build($("div#main_wrapper"), pageTaskBuilder.node, function () {
            app.events.publish("pageTasksReady");
        });
    }

    if (app.isSessionStored()) {
        initTasks();
    } else {
        app.events.subscribe("sessionStorageReady", function execInitTasks() {
            initTasks();
            // Unsubscibe from further sessionStorage events
            app.events.unsubscribe("sessionStorageReady", execInitTasks);
        });
    }
});