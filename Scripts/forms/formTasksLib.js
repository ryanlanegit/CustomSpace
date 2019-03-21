/* global $, _, angular, app, define, document */

/**
 * Custom Work Item Form Tasks Utility Function Library
 * @module formTasksLib
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define(function () {
  'use strict';

  /**
   * @exports formTasksLib
   */
  var definition = {
    /**
     * Bind calback to Page Form ready event for provided Work Item types.
     *
     * @param {object} types - Work Item types array or Options object.
     * @param {string} [label] - Task Label.
     * @param {function} [func] - Task callback function.
     */
    add: function add(types, label, func) {
      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
        app.custom.utils.log('formTasksLib:add', {
          types: types,
          label: label,
          func: func,
        });
      }
      var options = {
        label: null,
      };
      if (arguments.length > 1) {
        $.extend(options, {
          types: types,
          label: label,
          func: func,
        });
      } else {
        if (typeof types === 'object') {
          $.extend(options, types);
        } else {
          if (!_.isUndefined(app.storage.utils)) {
            app.custom.utils.log(2, 'formTasksLib:add', 'Warning! Invalid arguments supplied.');
          }
          return app.custom.formTasks.tasks;
        }
      }

      /**
       * Bind calback to Page Form ready event.
       *
       * @param {object} formObj - Page Form Object.
       */
      function bindCallback(formObj) {
        formObj.boundReady(function () {
          options.func(formObj);
        });
      }

      _.each(options.types, function (type) {
        app.custom.formTasks.add(type, options.label, bindCallback);
      });

      return app.custom.formTasks.tasks;
    },
  };

  return definition;
});
