/* global _, $, app, define */

/**
 * Grid List Item Task Controller
 * @module taskController
 * @see module:gridTaskmain
 * @see module:gridTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/grids/tasks/task/view.html',
], function (
  listItemTaskTemplate
) {
  'use strict';
  var gridTask = {
      Task: 'task',
      Type: 'Grid',
      Label: 'Grid Task List Item Task',
      Configs: {},
      Access: true,
    },

    /**
     * @exports taskController
     */
    definition = {
      template: listItemTaskTemplate,
      task: gridTask,
      /**
       * Build Grid List Item Task
       *
       * @param {string} field - Grid column name.
       * @param {object} task - Grid Task Name.
       * @param {object} options - Grid Task options.
       */
      build: function build(field, task, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('taskController:build', {
            gridTask: gridTask,
            field: field,
            task: task,
            options: options,
          });
        }

        /**
         * Initialize Grid List Item Task.
         * @returns {string} Kendo template string.
         */
        function initGridTask() {
          _.defaults(options, {
              field: field,
              task: task,
              icon: 'fa-pencil',
              bClickPropagation: true,
              title: '',
            });
          var builtTask = _.template(listItemTaskTemplate);

          return builtTask(options);
        }

        return initGridTask();
      },
    };

  return definition;
});
