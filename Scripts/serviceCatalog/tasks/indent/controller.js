/*global $, _, app, console, define */

/**
Indent
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'indent',
      Type: 'RequestOffering',
      Label: 'Indent',
      Configs: {},
      Access: true,
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
          options.level = options.level || '1';

          processNext(promptElm, options.next, function (targetElm, targetIndex) {
            var targetLevel = (typeof options.level === 'string') ? options.level : options.level[targetIndex];
            $(targetElm).children('div').addClass('indent-' + targetLevel);
          });
        }

        initROTask();
      },
    };

  return definition;
});
