/* global $, _, app, define */

/**
 * 'AutoSize' Request Offering Task
 * @module autoSizeController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
  'jquery/autosize.js',
], function (
  roTaskLib,
  autosize
) {
  'use strict';
  var roTask = {
      Name: 'autoSize',
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
          app.custom.utils.log('autoSizeController:build', {
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
            rows: '1',
            maxrows: '4',
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var rows = _.isArray(options.rows) ? options.rows[targetIndex] : options.rows,
                maxRows = _.isArray(options.maxrows) ? options.maxrows[targetIndex] : options.maxrows;
            roTaskLib.waitForAngular(function () {
              var targetInputELm = $(targetElm).find('textarea');
              targetInputELm
                .addClass('auto-size max-rows-' + maxRows)
                .attr('rows', rows);
              autosize(targetInputELm);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
