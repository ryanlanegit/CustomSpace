/*global $, _, app, define */

/**
 * 'Add Class' Page Task
 * @module addClassController
 * @see module:pageTaskMain
 * @see module:pageTaskBuilder
 */
define(function () {
  'use strict';
  var pageTask = {
      Task: 'addClass',
      Type: 'Page',
      Label: 'Add Class',
      Configs: {},
      Access: true,
    },

    definition = {
      template: null,
      task: pageTask,
      /**
       * Build Page Task.
       *
       * @param {Object} promptElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
      build: function build(promptElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('pageTask:build', {
            task: pageTask,
            promptElm: promptElm,
            options: options,
          });
        }

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
        function processNext(targetElm, next, func) {
          var targetElms = $(targetElm).nextAll().not('.task-container').slice(0, next);
          _.each(targetElms, func);
        }

        /**
         * Initialization code
         */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.cssclass) {
            return;
          }

          processNext(promptElm, options.next, function (targetElm) {
            $(targetElm).addClass(options.cssclass);
          });
        }

        initROTask();
      },
    };

  return definition;
});
