/* global $, _, app, define */

/**
 * 'Add Information' Request Offering Task
 * @module addInformationController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/serviceCatalog/tasks/addInformation/view.html',
], function (
  addInformationTemplate
) {
  'use strict';
  var roTask = {
      Task: 'addInformation',
      Type: 'RequestOffering',
      Label: 'Add Information',
      Configs: {},
      Access: true,
    },

    /**
     * @exports addInformationController
     */
    definition = {
      template: addInformationTemplate,
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

          if (!options.info && !options.icon) {
            return;
          }
          var builtInfo = _.template(addInformationTemplate);

          processNext(options.next, function (targetElm) {
            $(targetElm).append(builtInfo(options));
          });
        }

        initROTask();
      },
    };

  return definition;
});
