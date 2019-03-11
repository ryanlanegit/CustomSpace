/* global $, _, app, define */

/**
 * 'AutoSize' Request Offering Task
 * @module autoSizeController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
  'jquery/autosize.js',
], function (
  roTaskUtils,
  autosize
) {
  'use strict';
  var roTask = {
      Task: 'autoSize',
      Type: 'RequestOffering',
      Label: 'Autosize Textarea',
      Configs: {},
      Access: true,
    },

    /**
     * @exports autoSizeController
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
          options.rows = options.rows || '1';

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetRows = (typeof options.rows === 'string') ? options.rows : options.rows[targetIndex];
            roTaskUtils.waitForAngular(function () {
              var targetInputELm = $(targetElm).find('textarea');
              targetInputELm.addClass('auto-size').attr('rows', targetRows);
              autosize(targetInputELm);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
