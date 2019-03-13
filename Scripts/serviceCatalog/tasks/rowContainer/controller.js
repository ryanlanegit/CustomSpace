/* global $, _, app, define */

/**
 * 'Row Container' Request Offering Task
 * @module rowContainerController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
  'text!CustomSpace/Scripts/serviceCatalog/tasks/rowContainer/view.html',
], function (
  roTaskUtils,
  rowContainerTemplate
) {
  'use strict';
  var roTask = {
      Name: 'rowContainer',
      Type: 'RequestOffering',
      Label: 'Row Container',
      Configs: {},
      Access: true,
    },

    /**
     * @exports rowContainerController
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
          app.custom.utils.log('rowContainerController:build', {
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
        function processNext(roTaskElm, next, func) {
          var lastTargetElm = $(roTaskElm).nextAll().not('.task-container, .row-container').slice(0, next).slice(-1),
              targetElms = $(roTaskElm).nextUntil(lastTargetElm, ':not(.row-container)').add(lastTargetElm),
              builtRowContainer = _.template(rowContainerTemplate);

          targetElms.wrapAll(builtRowContainer());
          _.each(targetElms, func);
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;
          options.next = (options.next <= 2 ) ? options.next : 2;

          if (typeof options.colspan === 'undefined') {
            var columnSpanMap = {
              1: '6',
              2: '3',
            }
            options.colspan = columnSpanMap[options.next];
          }

          processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetColSpan = (typeof options.colspan === 'string') ? options.colspan : options.colspan[targetIndex];
            targetElm = $(targetElm);
            // Remove row class and column classes
            if (targetElm.hasClass('task-container')) {
              targetElm
                .removeClass('row')
                .addClass('col-xs-12 col-md-12');
            } else {
              targetElm
                .removeClass('row')
                .addClass('col-xs-12 col-md-' + targetColSpan);
            }

            // Turn inner column div into a form group div
             $(targetElm).children('.col-xs-12')
                .removeClass('col-xs-12 col-md-6 col-md-8 col-md-12')
                .addClass('form-group');
          });
        }

        initROTask();
      },
    };

  return definition;
});
