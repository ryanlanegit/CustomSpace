/*global $, _, app, console, define */

/**
Add Information
**/

define([
    'text!CustomSpace/Scripts/serviceCatalog/tasks/addInformation/view.html',
], function (
    addInformationTemplate
) {
    'use strict';
    var roTask = {
            Task: 'addInformation',
            Type: 'RequestOffering',
            Label: 'Add Information',
            Access: true,
            Configs: {},
        },

        definition = {
            template: addInformationTemplate,
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

                    if (!options.info && !options.icon) {
                        return;
                    }
                    var target = promptElm.next(),
                        builtInfo = _.template(addInformationTemplate);

                    processNext(promptElm, options.next, function (targetElm) {
                        $(targetElm).append(builtInfo(options));
                    });
                }

                initROTask();
            },
        };

    return definition;
});
