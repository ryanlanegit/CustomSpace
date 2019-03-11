/* global $, _, angular, app, define, document */

/**
 * Request Offering Task Utility Function Library
 * @module roTaskUtils
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';

  var roTaskUtilsVm = {
        evalAsyncQueue: [],
        evalAsyncQueueReady: false,
        initEvalAsyncQueue: _.once(function _initEvalAsyncQueue() {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskUtilsVm:initEvalAsyncQueue');
          }
          angular.element(document).ready(function () {
            roTaskUtilsVm.evalAsyncQueueReady = true;
            roTaskUtilsVm.processEvalAsyncQueue();
          });
        }),

        /**
         * Wait until Angular has finished rendering and insert callback functions
         * from waitQueue into Angular's evalAsync queue.
         */
        processEvalAsyncQueue: function _processEvalAsyncQueue() {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskUtilsVm:processEvalAsyncQueue', {
              evalAsyncQueueReady: roTaskUtilsVm.evalAsyncQueueReady,
            });
          }
          if (roTaskUtilsVm.evalAsyncQueueReady) {
            roTaskUtilsVm.evalAsyncQueueReady = false;
            var angularElm = angular.element('#GeneralInformation'),
                angularScope = angularElm.scope();
            angularScope.$evalAsync(function () {
              while (roTaskUtilsVm.evalAsyncQueue.length) {
                roTaskUtilsVm.evalAsyncQueue.shift()();
              }
              roTaskUtilsVm.evalAsyncQueueReady = true;
            });
          }
        },
      },
      /**
       * @exports roTaskUtils
       */
      definition = {
        /**
         * Validate if a given string is a valid GUID.
         *
         * @example
         * // returns true
         * isValidGUID('12604183-1B96-908C-DADE-B46EB8CDF4F9');
         *
         * @param {object|string} content - GUID string to validate.
         * @returns {boolean} Provided string is a valid GUID.
         */
        isValidGUID: function isValidGUID(content) {
          if (app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskUtils:isValidGUID', content);
          }
          content = content.toString();
          var rx_one = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi,
              rx_braces = /(^{|}$)/gi;
          return rx_one.test(
            content
              .replace(rx_braces, '')
          );
        },

        /**
         * Validate if a given string is a valid GUID.
         * @see {@link https://github.com/douglascrockford/JSON-js/blob/master/json2.js|JSON-js}
         * @example
         * // returns true
         * isValidJSON('{"bindHash": {"param" : "request"}}');
         *
         * @param {object|string} content - JSON string to validate.
         * @returns {boolean} Provided string is a valid JSON string.
         */
        isValidJSON: function isValidJSON(content) {
          // Regex Check For Valid JSON based on https://github.com/douglascrockford/JSON-js/blob/master/json2.js
          var rx_one = /^[\],:{}\s]*$/,
            rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rx_four = /(?:^|:|,)(?:\s*\[)+/g;

          return rx_one.test(
            content
              .replace(rx_two, '@')
              .replace(rx_three, ']')
              .replace(rx_four, '')
          );
        },

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
          roTaskUtilsVm.evalAsyncQueue.push(callback);
          roTaskUtilsVm.initEvalAsyncQueue();
          roTaskUtilsVm.processEvalAsyncQueue();
        },
      };

  return definition;
});
