/* global $, _, angular, app, define, document */

/**
 * Work Item Task Utility Function Library
 * @module wiTaskUtils
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define(function () {
  'use strict';

  /**
   * @exports wiTaskUtils
   */
  var definition = {
    /**
     * Format a string expression with
     *
     * @example
     * // returns '1: String'
     * stringFormat('{0}: {1}', '1', 'String');
     * @example
     * // returns '2: Array'
     * stringFormat('{0}: {1}', ['2', 'Array']);
     * @example
     * // returns '3: Object'
     * stringFormat('{key1}: {key2}', {key1: '3', key2: 'Object'});
     *
     * @param {string} format - String expression with placeholders.
     * @param {...string|string[]|object} content - Placeholder values.
     * @returns {string} Formatted string.
     */
    stringFormat: function stringFormat(format, content) {
      format = format.toString();
      if (arguments.length > 1) {
        var args = (typeof content === 'string' || typeof content === 'number') ? Array.prototype.slice.call(arguments, 1) : content,
          key;
        for (key in args) {
          if (args.hasOwnProperty(key)) {
            format = format.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
          }
        }
      }
      return format;
    },
  };

  return definition;
});
