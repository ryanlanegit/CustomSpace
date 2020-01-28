/* global $, _, app, define */

/**
 * 'Add Class' Request Offering Task
 * @module addClassController
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
      Name: 'addClass',
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
          app.custom.utils.log('addClassController:build', {
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
          });

          if (!_.has(options, 'cssclass')) {
            if (!_.isUndefined(app.custom.utils)) {
              app.custom.utils.log(2, 'addClassController:initROTask', 'Warning! Invalid arguments provided');
            }
            return;
          }

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetCSSClass = _.isArray(options.cssclass) ? options.cssclass[targetIndex] : options.cssclass,
                targetSelector;
            if (_.isUndefined(options.selector)) {
              $(targetElm).addClass(targetCSSClass);
            } else {
              targetSelector = _.isArray(options.selector) ? options.selector[targetIndex] : options.selector;
              $(targetElm).find(targetSelector).addClass(targetCSSClass);
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
