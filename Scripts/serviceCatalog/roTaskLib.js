/* global $, _, angular, app, define, document, kendo */

/**
 * Request Offering Task Utility Function Library
 * @module roTaskUtils
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';

  var roTaskUtilsVm = {
        asyncQueue: {
          list: [],
          ready: false,
          init: _.once(function _init() {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('roTaskUtilsVm:asyncQueue.init');
            }
            angular.element(document).ready(function () {
              roTaskUtilsVm.asyncQueue.ready = true;
              roTaskUtilsVm.asyncQueue.process();
            });
          }),

          /**
           * Wait until Angular has finished rendering and insert callback functions
           * from waitQueue into Angular's evalAsync queue.
           */
          process: function process() {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('roTaskUtilsVm:asyncQueue.process', {
                ready: roTaskUtilsVm.asyncQueue.ready,
              });
            }
            if (roTaskUtilsVm.asyncQueue.ready) {
              roTaskUtilsVm.asyncQueue.ready = false;
              var angularElm = angular.element('#GeneralInformation'),
                  angularScope = angularElm.scope();
              angularScope.$evalAsync(function () {
                while (roTaskUtilsVm.asyncQueue.list.length) {
                  roTaskUtilsVm.asyncQueue.list.shift()();
                }
                roTaskUtilsVm.asyncQueue.ready = true;
              });
            }
          },
        },
      },
      /**
       * @exports roTaskUtils
       */
      definition = {
        /**
         * This callback type is called 'processNextCallback' and is run on a target container.
         *
         * @callback processNextCallback
         * @param {object} targetElm - Target question or display container.
         */

        /**
         * Processes the next N non-task containers.
         *
         * @param {object} roTaskElm - Source task container element.
         * @param {number} next - Number of next non-task containers to process.
         * @param {processNextCallback} func - Callback function to process next question or display container.
         */
        processNext: function processNext(roTaskElm, next, func) {
          var targetElms = $(roTaskElm).nextAll().not('.task-container').slice(0, next);
          _.each(targetElms, func);
        },

        /**
         * Add callback to waitQueue and run processWaitQueue to wait until
         * Angular has finished rendering and insert callback function into
         * Angular's evalAsync queue.
         * @param {function(string)} callback - Callback function.
         */
        waitForAngular: function waitForAngular(callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskUtils:waitForAngular', {
              callback: callback,
            });
          }
          roTaskUtilsVm.asyncQueue.list.push(callback);
          roTaskUtilsVm.asyncQueue.init();
          roTaskUtilsVm.asyncQueue.process();
        },
      };

  return definition;
});
