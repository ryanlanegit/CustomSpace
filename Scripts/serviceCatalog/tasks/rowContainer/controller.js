/*global $, _, app, console, define */

/**
Row Container
**/

define([
  'text!CustomSpace/Scripts/serviceCatalog/tasks/rowContainer/view.html',
], function (
  rowContainerTemplate
) {
  'use strict';
  var roTask = {
      Task: 'rowContainer',
      Type: 'RequestOffering',
      Label: 'Row Container',
      Access: true,
      Configs: {},
    },

    definition = {
      template: null,
      task: roTask,
      build: function build(vm, promptElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('roTask:build', {
            task: roTask,
            promptElm: promptElm,
            options: options,
          });
        }

        function processNext(promptElm, next, func) {
          var lastTargetElm = $(promptElm).nextAll(':not(.task-container):not(.row-container)').slice(0, next).slice(-1),
              targetElms = $(promptElm).nextUntil(lastTargetElm, ':not(.row-container)').add(lastTargetElm),
              builtRowContainer = _.template(rowContainerTemplate);

          targetElms.wrapAll(builtRowContainer());
          _.each(targetElms, func);
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;
          options.next = (options.next <= 2 ) ? options.next : 2;

          if (typeof options.colspan === 'undefined') {
            var columnSpanMap = {
              1: '6',
              2: '3',
            }
            options.colspan = columnSpanMap[options.next];
          }

          processNext(promptElm, options.next, function (targetElm, targetIndex) {
            var targetColSpan = (typeof options.colspan === 'string') ? options.colspan : options.colspan[targetIndex];
            targetElm = $(targetElm);
            // Remove row class and column classes
            if (targetElm.hasClass('task-container')) {
              targetElm
                .removeClass('row')
                .addClass('col-xs-12 col-md-12');
            } else {
              targetElm
                .removeClass('row')
                .addClass('col-xs-12 col-md-' + targetColSpan);
            }

            // Turn inner column div into a form group div
             $(targetElm).children('.col-xs-12')
                .removeClass('col-xs-12 col-md-6 col-md-8 col-md-12')
                .addClass('form-group');
          });
        }

        initROTask();
      },
    };

  return definition;
});
