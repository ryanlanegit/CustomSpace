/* global $, _, app, define */

/**
 * 'Set Options' Request Offering Task
 * @module setOptionsController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';
  var roTask = {
      Task: 'setOptions',
      Type: 'RequestOffering',
      Label: 'Set Options',
      Configs: {},
      Access: true,
    },

    /**
     * @exports setOptionsController
     */
    definition = {
      template: null,
      task: roTask,
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('roTask:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
         * This callback type is called `processCallback` and is run on a target container.
         *
         * @callback processNextCallback
         * @param {Object} targetElm - Target question or display container.
         * @param {Number} targetIndex - Target Index.
         */

        /**
         * Processes the next N non-task containers.
         *
         * @param {Integer} next - Number of next non-task containers to process.
         * @param {processNextCallback} func - Callback function to process next question or display container.
         */
        function processNext(next, func) {
          var targetElms = $(roTaskElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;
          options.selector = options.selector || '[data-role]';

          processNext(options.next, function (targetElm, targetIndex) {
            var targetOptions = $.extend({}, options),
                targetSelector = (typeof targetOptions.selector === 'string') ? targetOptions.selector : targetOptions.selector[targetIndex];
            delete targetOptions.next;
            delete targetOptions.selector;
            vm.waitForAngular(function () {
              $(targetElm).find(targetSelector).data().handler.setOptions(targetOptions);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
