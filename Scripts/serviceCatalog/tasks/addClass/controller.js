/* global $, _, app, define */

/**
 * 'Add Class' Request Offering Task
 * @module addClassController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';
  var roTask = {
      Task: 'addClass',
      Type: 'RequestOffering',
      Label: 'Add Class',
      Configs: {},
      Access: true,
    },

    /**
     * @exports addClassController
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

          if (typeof options.cssclass === 'undefined') {
            return;
          }

          processNext(options.next, function (targetElm, targetIndex) {
            var targetCSSClass = (typeof options.cssclass === 'string') ? options.cssclass : options.cssclass[targetIndex],
                targetSelector;
            if (typeof options.selector === 'undefined') {
              $(targetElm).addClass(targetCSSClass);
            } else {
              targetSelector = (typeof options.selector === 'string') ? options.selector : options.selector[targetIndex];
              $(targetElm).find(targetSelector).addClass(targetCSSClass);
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
