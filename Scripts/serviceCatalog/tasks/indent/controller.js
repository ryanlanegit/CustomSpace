/* global $, _, app,  define */

/**
 * 'Indent' Request Offering Task
 * @module indentController
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
      Name: 'indent',
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
          app.custom.utils.log('indentController:build', {
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
            level: '1',
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetLevel = _.isArray(options.level) ? options.level[targetIndex] : options.level;
            $(targetElm).children('div').addClass('indent-' + targetLevel);
          });
        }

        initROTask();
      },
    };

  return definition;
});
