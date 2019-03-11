/* global $, _, app, define, matchValues */

/**
 * 'Single Line Entry' Request Offering Task
 * @module singleLineEntryController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
],
function (
  roTaskUtils
) {
  'use strict';
  var roTask = {
      Task: 'singleLineEntry',
      Type: 'RequestOffering',
      Label: 'Single Line Entry',
      Configs: {},
      Access: true,
    },

    /**
     * @exports singleLineEntryController
     */
    definition = {
      template: null,
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
          app.custom.utils.log('roTask:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
         * Handle TextArea input field pasting entry, removing new lines if entered.
         *
         * @param {String} textInputId - Id of TextArea element.
         */
        function singleLinePasteValue(textInputId) {
          _.defer(function () {
            singleLneMatchValues(textInputId);
          });
        }

        /**
         * Handle TextArea input field manual entry, removing new lines if entered.
         *
         * @param {String} textInputId - Id of TextArea element.
         */
        function singleLneMatchValues(textInputId) {
          var targetTextAreaElm = $('#textArea' + textInputId),
              areaVal = targetTextAreaElm.val()
                .replace(/[\n\r]/g, '');

          targetTextAreaElm.val(areaVal);
          matchValues(textInputId);
        };

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm) {
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
