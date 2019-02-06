/*global $, _, angular, app, console, define */

/**
Set Options
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'setOptions',
      Type: 'RequestOffering',
      Label: 'Set Options',
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
          options.selector = options.selector || '[data-role]';

          processNext(promptElm, options.next, function (targetElm, targetIndex) {
            var targetOptions = $.extend({}, options),
                targetSelector = (typeof targetOptions.selector === 'string') ? targetOptions.selector : targetOptions.selector[targetIndex];
            delete targetOptions.next;
            delete targetOptions.selector;
            vm.waitForAngular(targetElm, function () {
              $(targetElm).find(targetSelector).data().handler.setOptions(targetOptions);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
