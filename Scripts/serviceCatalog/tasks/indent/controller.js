/* global $, _, app,  define */

/**
 * 'Indent' Request Offering Task
 * @module indentController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
],
function (
  roTaskUtils
) {
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

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;
          options.level = options.level || '1';

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetLevel = (typeof options.level === 'string') ? options.level : options.level[targetIndex];
            $(targetElm).children('div').addClass('indent-' + targetLevel);
          });
        }

        initROTask();
      },
    };

  return definition;
});
