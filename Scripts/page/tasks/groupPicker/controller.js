/*global $, _, app, define */

/**
 * 'Group Picker' Page Task
 * @module groupPickerController
 * @see module:pageTaskMain
 * @see module:pageTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/page/tasks/groupPicker/view.html',
], function (
  groupPickerTemplate
) {
  'use strict';
  var pageTask = {
      Task: 'groupPicker',
      Type: 'Page',
      Label: 'Group Picker',
      Configs: {},
      Access: true,
    },

    definition = {
      template: groupPickerTemplate,
      task: pageTask,
      /**
       * Build Page Task.
       *
       * @param {Object} promptElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
      build: function build(promptElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('groupPickerController:build', {
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

          if (!options.info && !options.icon) {
            return;
          }
          var builtInfo = _.template(groupPickerTemplate);

          processNext(promptElm, options.next, function (targetElm) {
            $(targetElm).append(builtInfo(options));
          });
        }

        initROTask();
      },
    };

  return definition;
});
