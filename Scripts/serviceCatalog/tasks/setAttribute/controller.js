/* global $, _, app, define */

/**
 * 'Set Attribute' Request Offering Task
 * @module setAttributeController
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
      Task: 'setAttribute',
      Type: 'RequestOffering',
      Label: 'Set Attribute',
      Configs: {},
      Access: true,
    },

    /**
     * @exports setAttributeController
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
          options.selector = options.selector || '[data-role]';

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetOptions = $.extend({}, options),
                targetSelector = (typeof targetOptions.selector === 'string') ? targetOptions.selector : targetOptions.selectors[targetIndex];
            delete targetOptions.next;
            delete targetOptions.selector;
            $(targetElm).find(targetSelector).attr(targetOptions);
          });
        }

        initROTask();
      },
    };

  return definition;
});
