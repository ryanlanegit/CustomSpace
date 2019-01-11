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

          processNext(promptElm, options.next, function (targetElm) {
            autosize($(targetElm).find('textarea'));
          });
        }

        initROTask();
      },
    };

  return definition;
});
