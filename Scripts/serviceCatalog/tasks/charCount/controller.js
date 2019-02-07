/*global _, $, app, console, define, setTimeout */

/**
Character Count
**/

define([
  'text!CustomSpace/Scripts/serviceCatalog/tasks/charCount/view.html',
], function (
  charCountTemplate
) {
  'use strict';
  var roTask = {
      Task: 'charCount',
      Type: 'RequestOffering',
      Label: 'Character Count',
      Configs: {},
      Access: true,
    },

    definition = {
      template: charCountTemplate,
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

        // Add the Minimum / Maximum required text to the page
        function createCharacterCount(targetTextArea, options) {
          $(targetTextArea).parent().find('span.charCount').remove();
          var currentLength = $(targetTextArea).val().length,
            builtCharCount = _.template(charCountTemplate);

          options.minRemainingCharacters = options.charMin - currentLength;
          options.remainingCharacters = options.charMax - currentLength;

          $(targetTextArea).parent().append(builtCharCount(options));
        }

        /* Initialization code */
        function initROTask() {
          var defaultOptions = {
            next: 1,
            minText: 'Minimum Extra Characters Required',
            maxText: 'Maximum Characters Remaining',
            showMin: 'true',
            showMax: 'true',
            showMinMax: 'false',
          }
          options = $.extend(defaultOptions, options);

          processNext(promptElm, options.next, function (targetElm) {
            var targetTextAreaElm = $(targetElm).find('textarea'),
                targetOptions = $.extend({}, options, {
                  charMin: $(targetTextAreaElm).siblings('input').attr('minlength') || 0,
                  charMax: $(targetTextAreaElm).siblings('input').attr('maxlength') || 0,
                });

            function funcOnPaste () {
              setTimeout(function () {
                createCharacterCount($(this), targetOptions);
              }, 100);
            }

            function funcOnKeyUp () {
              createCharacterCount($(this), targetOptions);
            }

            $(targetTextAreaElm)
              .on('paste', funcOnPaste)
              .on('keyup', funcOnKeyUp);
          });
        }

        initROTask();
      },
    };

  return definition;
});
