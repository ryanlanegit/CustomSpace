/*global $, _, app, console, define, kendo */

/**
External File Attachments Drag & Drop
**/

define([
    'forms/predefined/externalFileAttachmentsDragDrop/controller',
    'text!CustomSpace/Scripts/serviceCatalog/tasks/externalFileAttachmentsDragDrop/view.html',
], function (
    externalFileAttachmentsDragDropControl,
    externalFileAttachmentsDragDropTemplate
) {
    'use strict';
    var roTask = {
            Task: 'externalFileAttachmentsDragDrop',
            Type: 'RequestOffering',
            Label: 'External File Attachments Drag & Drop',
            Access: true,
            Configs: {},
        },

        definition = {
            template: externalFileAttachmentsDragDropTemplate,
            task: roTask,
            build: function build(promptElm, options) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('roTask:build', {
                        task: roTask,
                        promptElm: promptElm,
                        options: options,
                    });
                }

                function buildExternalFileUpload(container, props) {
                    var vmModel = kendo.observable({});
                    return externalFileAttachmentsDragDropControl.build(vmModel, props, function (externalFileAttachmentsDragDropControl) {
                        container.html(externalFileAttachmentsDragDropControl);
                        /*app.controls.apply(container, {
                            localize: true,
                            //vm: vmModel,
                            bind: true
                        });*/
                    });
                }

                function processNext(targetElm, next, func) {
                    var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
                    _.each(targetElms, func);
                }

                /* Initialization code */
                function initROTask() {
                    options.next = options.next || 1;

                    /*if (!options.info && !options.icon) {
                        return;
                    }*/
                    var target = promptElm.next(),
                        builtExternalFileUpload = _.template(externalFileAttachmentsDragDropTemplate);

                    processNext(promptElm, options.next, function (targetElm) {
                        var container = $(targetElm).html(builtExternalFileUpload(options)).find('div:first');
                        buildExternalFileUpload(container, options);
                    });
                }

                initROTask();
            },
        };

    return definition;
});
