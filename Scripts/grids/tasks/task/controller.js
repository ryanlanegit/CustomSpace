/*global _, $, app, console, define */

/**
Grid List Item Task
**/

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

    definition = {
      template: listItemTaskTemplate,
      task: gridTask,
      build: function build(field, task, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('gridTask:build', {
            gridTask: gridTask,
            field: field,
            task: task,
            options: options,
          });
        }

        /* Initialization code */
        function initGridTask() {
          var properties = {
              field: field,
              task: task,
              icon: 'fa-pencil',
              bClickPropagation: true,
            },
            builtTask = _.template(listItemTaskTemplate);

          $.extend(properties, options);
          return builtTask(properties);
        }

        return initGridTask();
      },
    };

  return definition;
});
