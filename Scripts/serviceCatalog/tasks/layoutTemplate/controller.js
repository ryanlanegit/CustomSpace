/*global _, app, console, define */

/**
Layout Template
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'layoutTemplate',
      Type: 'RequestOffering',
      Label: 'Layout Template',
      Configs: {},
      Access: true,
    },

    definition = {
      template: null,
      task: roTask,
      build: function build(vm, promptElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('roTask:build', {
            task: roTask,
            promptElm: promptElm,
            options: options,
          });
        }

        /* Initialization code */
        function initROTask() {
          if (!options.template) {
            return;
          }
        }

        initROTask();
      },
    };

  return definition;
});
