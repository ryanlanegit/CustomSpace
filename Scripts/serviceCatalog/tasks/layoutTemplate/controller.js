/* global _, app, define */

/**
 * 'Layout Templaten' Request Offering Task
 * @module layoutTemplateController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';
  var roTask = {
      Task: 'layoutTemplate',
      Type: 'RequestOffering',
      Label: 'Layout Template',
      Configs: {},
      Access: true,
    },

    /**
     * @exports layoutTemplateController
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
          if (!options.template) {
            return;
          }
        }

        initROTask();
      },
    };

  return definition;
});
