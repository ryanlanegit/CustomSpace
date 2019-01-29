/*global $, _, app, console, define */

/**
Single Line Entry
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'singleLineEntry',
      Type: 'RequestOffering',
      Label: 'Single Line Entry',
      Access: true,
      Configs: {},
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

        function processNext(targetElm, next, func) {
          var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;

          function preventDefaultOnEnter(event) {
            if (event.which === 13) {
              event.preventDefault();
            } else {
              var textAreaData = $(this).find('textarea').val(),
                newLineMatch = /\r|\n/.exec(textAreaData);
              if (newLineMatch) {
                $(this).find('textarea').val(textAreaData.replace(/[\n\r]/g, '')).keyup();
              }
            }
          }

          processNext(promptElm, options.next, function (targetElm) {
            $(targetElm).keydown(preventDefaultOnEnter).keyup(preventDefaultOnEnter);
          });
        }

        initROTask();
      },
    };

  return definition;
});
