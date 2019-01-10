/*global $, _, app, console, define */

/**
Add Class
**/

define(function () {
    'use strict';
    var roTask = {
            Task: 'addClass',
            Type: 'RequestOffering',
            Label: 'Add Class',
            Access: true,
            Configs: {},
        },

        definition = {
            template: null,
            task: roTask,
            build: function build(promptElm, options) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('roTask:build', {
                        task: roTask,
                        promptElm: promptElm,
                        options: options,
                    });
                }

                function processNext(targetElm, next, func) {
                    var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
                    _.each(targetElms, func);
                }

                /* Initialization code */
                function initROTask() {
                    options.next = options.next || 1;

                    if (!options.cssclass) {
                        return;
                    }

                    processNext(promptElm, options.next, function (targetElm) {
                        $(targetElm).addClass(options.cssclass);
                    });
                }

                initROTask();
            },
        };

    return definition;
});
