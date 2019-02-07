/*global $, _, app, console, define, matchValues */

/**
Single Line Entry
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'singleLineEntry',
      Type: 'RequestOffering',
      Label: 'Single Line Entry',
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

        function processNext(targetElm, next, func) {
          var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        function singleLinePasteValue(textInputId) {
          _.defer(function () {
            singleLneMatchValues(textInputId);
          });
        }

        function singleLneMatchValues(textInputId) {
          var targetTextAreaElm = $('#textArea' + textInputId),
              areaVal = targetTextAreaElm.val()
                .replace(/[\n\r]/g, '');

          targetTextAreaElm.val(areaVal);
          matchValues(textInputId);
        };

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;

          processNext(promptElm, options.next, function (targetElm) {
            targetElm = $(targetElm);
            var textInputId = targetElm.find('input.question-answer-id').val(),
                targetTextAreaElm = targetElm.find('textArea');

            targetTextAreaElm
              .removeAttr('onkeyup')
              .removeAttr('onpaste')
              .on('keypress', function (event) {
                if (event.which === 13) {
                  return false;
                }
              })
              .on('keyup', function () {
                singleLneMatchValues(textInputId);
              })
              .on('paste', function () {
                singleLinePasteValue(textInputId);
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
