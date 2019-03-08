/* global $, _, app, define */

/**
 * 'AutoSize' Request Offering Task
 * @module autoSizeController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'jquery/autosize.js',
], function (
  autosize
) {
  'use strict';
  var roTask = {
      Task: 'autoSize',
      Type: 'RequestOffering',
      Label: 'Autosize Textarea',
      Configs: {},
      Access: true,
    },

    /**
     * @exports autoSizeController
     */
    definition = {
      template: null,
      task: roTask,
      /**
       * Build Request Offering Task.
       *
       * @param {Object} vm - View Model of the base roTask plugin.
       * @param {Object} roTaskElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
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
         */

        /**
         * Processes the next N non-task containers.
         *
         * @param {Integer} next - Number of next non-task containers to process.
         * @param {processNextCallback} func - Callback function to process next question or display container.
         */
        function processNext(next, func) {
          var targetElms = $(roTaskElm).nextAll().not('.task-container').slice(0, next);
          _.each(targetElms, func);
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;
          options.rows = options.rows || '1';

          processNext(options.next, function (targetElm, targetIndex) {
            var targetRows = (typeof options.rows === 'string') ? options.rows : options.rows[targetIndex];
            vm.waitForAngular(function () {
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
