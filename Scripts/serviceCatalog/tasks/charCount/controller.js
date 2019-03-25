/* global _, $, app, define, setTimeout */

/**
 * 'Character Count' Request Offering Task
 * @module charCountController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
  'text!CustomSpace/Scripts/serviceCatalog/tasks/charCount/view.html',
], function (
  roTaskLib,
  charCountTemplate
) {
  'use strict';
  var roTask = {
      Name: 'charCount',
      Type: 'RequestOffering',
      Label: 'Character Count',
      Configs: {},
      Access: true,
    },

    /**
     * @exports charCountController
     */
    definition = {
      template: charCountTemplate,
      task: roTask,
      /**
       * Build Request Offering Task.
       *
       * @param {Object} vm - View Model of the base roTask plugin.
       * @param {Object} roTaskElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('charCountController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
         * Add the Minimum / Maximum required text to the page.
         *
         * @param {Object} targetTextArea - Target TextArea element
         * @param {Object} options - TextArea options
         */
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
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
            minText: 'Minimum Extra Characters Required',
            maxText: 'Maximum Characters Remaining',
            showMin: 'true',
            showMax: 'true',
            showMinMax: 'false',
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm) {
            var targetTextAreaElm = $(targetElm).find('textarea'),
                targetOptions = $.extend({}, options, {
                  charMin: $(targetTextAreaElm).siblings('input').attr('minlength') || 0,
                  charMax: $(targetTextAreaElm).siblings('input').attr('maxlength') || 0,
                });

            /**
             * Paste input event handler.
             */
            function funcOnPaste () {
              setTimeout(function () {
                createCharacterCount($(this), targetOptions);
              }, 100);
            }

            /**
             * Key Up input event handler.
             */
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
