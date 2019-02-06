/*global $, _, app, console, define */

/**
Autosize Textarea
**/

define([
  'jquery/autosize.min.js',
], function (
  autosize
) {
  'use strict';
  var roTask = {
      Task: 'autoSize',
      Type: 'RequestOffering',
      Label: 'Autosize Textarea',
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

        function processNext(targetElm, next, func) {
          var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;
          options.rows = options.rows || '1';

          processNext(promptElm, options.next, function (targetElm, targetIndex) {
            var targetRows = (typeof options.rows === 'string') ? options.rows : options.rows[targetIndex];
            vm.waitForAngular(targetElm, function () {
              var targetInputELm = $(targetElm).find('textarea');
              targetInputELm.addClass('auto-size').attr('rows', targetRows);
              autosize(targetInputELm);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
