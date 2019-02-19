/* global _, $, app, define, setTimeout */

/**
 * 'Character Count' Request Offering Task
 * @module charCountController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
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

    /**
     * @exports charCountController
    **/
    definition = {
      template: charCountTemplate,
      task: roTask,
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('roTask:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
         * This callback type is called `processCallback` and is run on a target container.
         *
         * @callback processNextCallback
         * @param {Object} targetElm - Target question or display container.
        **/

        /**
         * Processes the next N non-task containers.
         *
         * @param {Integer} next - Number of next non-task containers to process.
         * @param {processNextCallback} func - Callback function to process next question or display container.
        **/
        function processNext(next, func) {
          var targetElms = $(roTaskElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        /**
         * Add the Minimum / Maximum required text to the page.
         *
         * @param {Object} targetTextArea - Target TextArea element
         * @param {Object} options - TextArea options
        **/
        function createCharacterCount(targetTextArea, options) {
          $(targetTextArea).parent().find('span.charCount').remove();
          var currentLength = $(targetTextArea).val().length,
            builtCharCount = _.template(charCountTemplate);

          options.minRemainingCharacters = options.charMin - currentLength;
          options.remainingCharacters = options.charMax - currentLength;

          $(targetTextArea).parent().append(builtCharCount(options));
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
        **/
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

          processNext(options.next, function (targetElm) {
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
