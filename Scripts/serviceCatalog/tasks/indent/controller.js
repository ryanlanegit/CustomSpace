/* global $, _, app,  define */

/**
 * 'Indent' Request Offering Task
 * @module indentController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';
  var roTask = {
      Task: 'indent',
      Type: 'RequestOffering',
      Label: 'Indent',
      Configs: {},
      Access: true,
    },

    /**
     * @exports indentController
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
          options.level = options.level || '1';

          processNext(options.next, function (targetElm, targetIndex) {
            var targetLevel = (typeof options.level === 'string') ? options.level : options.level[targetIndex];
            $(targetElm).children('div').addClass('indent-' + targetLevel);
          });
        }

        initROTask();
      },
    };

  return definition;
});
