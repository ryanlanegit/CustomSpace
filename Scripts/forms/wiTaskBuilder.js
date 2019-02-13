/*global $, _, app, console, define, performance */

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
    definition = {
      build: function build(vm, callback) {
        var ulElement = $('.taskmenu'),
          taskCallback = function (view) {
            ulElement.append(view);
          };

        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('wiTaskBuilder:build', {
            performance: performance.now(),
            vm: vm,
            taskModules: taskModules,
          });
        }

        _.each(taskModules, function (taskModule) {
          if (taskModule.task.Access && taskModule.task.Type.indexOf(vm.type) !== -1) {
            taskModule.build(vm, taskModule.task, function (view) {
              taskCallback(view);
            });
          }
        });

        // Send back <ul> with <li> of each task
        if (typeof callback === 'function') {
          callback(ulElement);
        }
      },
    };

  return definition;
});
