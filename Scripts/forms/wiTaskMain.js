/*jslint nomen: true */
/*global _, app, console, pageForm, performance, require */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Load Custom Work Item Task Builder
**/

require.config({
    waitSeconds: 0,
    urlArgs: 'v=' + ((typeof session !== 'undefined' && typeof session.staticFileVersion !== 'undefined') ? session.staticFileVersion : 894),
    baseUrl: '/Scripts/',
    paths: {
        'text': 'require/text',
        'CustomSpace': '../CustomSpace'
    }
});

require([
    'CustomSpace/Scripts/forms/wiTaskBuilder'
], function (
    wiTaskBuilder
) {
    'use strict';
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
        console.log('wiTaskMain', performance.now());
    }

    function initTasks() {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            console.log('wiTaskMain:initTasks', performance.now());
        }
        
        var isClosed = false,
            ServiceRequestStatus_Closed = 'c7b65747-f99e-c108-1e17-3c1062138fc4',
            ChangeStatus_Closed = 'f228d50b-2b5a-010f-b1a4-5c7d95703a9b',
            IncidentStatus_Closed = 'bd0ae7c4-3315-2eb3-7933-82dfc482dbaf',
            ProblemStatus_Closed = '25eac210-e091-8ae8-a713-fea2472f32ff',
            ReleaseRecordStatus_Closed = '221155fc-ad9f-1e40-c50e-9028ee303137';

        // Check if form is disabled
        if (!pageForm.newWI) {
            // If status is closed then do not add tasks
            if (
                pageForm.viewModel.Status.Id === ServiceRequestStatus_Closed ||
                    pageForm.viewModel.Status.Id === ChangeStatus_Closed ||
                    pageForm.viewModel.Status.Id === IncidentStatus_Closed ||
                    pageForm.viewModel.Status.Id === ProblemStatus_Closed ||
                    pageForm.viewModel.Status.Id === ReleaseRecordStatus_Closed
            ) {
                isClosed = true;
            }
        }

        if (!isClosed) {
            // Build out custom Work Item tasks
            wiTaskBuilder.build(pageForm, function (view) {
                app.custom.utils.sortList(view);
                app.events.publish('wiTasksReady');
            });
        }
    }

    app.events.subscribe('boundReadyReady', function execInitTasks() {
        'use strict';
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            console.log('wiTaskMain:boundReady', performance.now());
        }
        pageForm.boundReady(function () {
            initTasks();
            // Unsubscibe from further boundReady events
            app.events.unsubscribe('boundReadyReady', execInitTasks);
        });
    });
});