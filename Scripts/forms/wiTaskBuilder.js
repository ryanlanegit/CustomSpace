/* global $, _, app, define */

/**
 * Custom Work Item Task Builder
 * @module wiTaskBuilder
 */
define([
  'CustomSpace/Scripts/forms/tasks/resolveIncident/controller',
], function (
  resolveIncidentController
) {
  'use strict';
  var taskModules = arguments,
      /**
       * @exports wiTaskBuilder
       */
      definition = {
        /**
         * Optional build callback type.
         *
         * @callback buildCallback
         * @param {Object} taskMenuElm - Task Menu UL container element.
         */

        /**
         * Build Work Item Tasks.
         *
         * @param {object} vm - Page Form View Model.
         * @param {buildCallback} [callback] - Callback function once build is complete.
         */
        build: function build(vm, callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('wiTaskBuilder:build', {
              vm: vm,
              taskModules: taskModules,
            });
          }
          var taskMenuElm = $('.taskmenu');

          /**
           * Work Item Task Callback.
           *
           * @param {object} view - Work Item Task render view.
           */
          function taskCallback(view) {
            taskMenuElm.append(view);
          };

          /**
           * Initialize Custom Work Item Task Builder.
           */
          function initwiTasks() {
            _.each(taskModules, function (taskModule) {
              if (taskModule.task.Access && taskModule.task.Type.indexOf(vm.type) !== -1) {
                taskModule.build(vm, taskModule.task, taskCallback);
              }
            });

            // Send back <ul> with <li> of each task
            if (typeof callback === 'function') {
              callback(taskMenuElm);
            }
          }

          initwiTasks();
        },
      };

  return definition;
});
