/* global $, _, app, define */

/**
 * 'Set Attribute' Request Offering Task
 * @module setAttributeController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
],
function (
  roTaskLib
) {
  'use strict';
  var roTask = {
      Name: 'setAttribute',
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
          app.custom.utils.log('setAttributeController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
            selector: '[data-role]',
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetOptions = _.omit(options, ['next', 'selector', 'selectors']),
                targetSelector = options.selector;
            if (_.has(options, 'selectors') && typeof options.selectors[targetIndex] !== 'undefined') {
              targetSelector = targetOptions.selectors[targetIndex];
            }
            $(targetElm).find(targetSelector).attr(targetOptions);
          });
        }

        initROTask();
      },
    };

  return definition;
});
