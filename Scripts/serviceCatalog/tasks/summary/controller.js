/* global $, _, app, define, kendo */

/**
 * 'Summary' Request Offering Task
 * @module summaryController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/customLib',
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
  'text!CustomSpace/Scripts/serviceCatalog/tasks/summary/view.html',
], function (
  customLib,
  roTaskLib,
  summaryTemplate
) {
  'use strict';
  var roTask = {
      Name: 'summary',
      Type: 'RequestOffering',
      Label: 'Summary',
      Configs: {},
      Access: true,
    },

    /**
     * @exports summaryController
     */
    definition = {
      template: summaryTemplate,
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
          app.custom.utils.log('summaryController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        // #endregion Utility functions

        /**
         * Create Request offering Summary grid in target element.
         *
         * @param {Object} targetEle - Target container.
         */
        function createSummary(targetEle) {
          if (!targetEle) {
            app.controls.exception('targetEle missing - roTaskBuilder.createSumary');
            return;
          }

          var gridEle = targetEle.find('div[data-control-grid]'),
            gridDataSource = new kendo.data.DataSource({
              transport: {
                /**
                 *
                 */
                getUserInput: function getUserInput() {
                  var roQuestionElms = $('div.question-container').not('.ng-hide'),
                    userInput = [];
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('summaryController:createSummary.getUserInput', {
                      'roQuestionElms': roQuestionElms,
                    });
                  }
                  roQuestionElms.each(function () {
                    var questionElm = $(this),
                      questionType = questionElm.find('input.question-answer-type').val().toLowerCase(),
                      questionLabel = questionElm.find('label.control-label'),
                      questionInput = questionElm.find('input[id]'),
                      questionValue = questionInput.val(),
                      userInputItem;

                    switch (questionType) {
                      case 'integer':
                        questionType = 'int';
                        break;
                      case 'list':
                        if (customLib.isValidGUID(questionValue)) {
                          questionType = 'enum';
                        }
                        break;
                      case 'boolean':
                        questionType = 'bool';
                        questionLabel = questionElm.find('label.checkbox-label');
                        switch (questionValue) {
                          case 'on':
                            questionValue = 'True';
                            break;
                          case 'off':
                            questionValue = 'False';
                            break;
                        }
                        break;
                    }

                    userInputItem = {
                      Question: questionLabel.text().replace('(Required)', '').replace(/\n/g, ''),
                      Answer: questionValue,
                      Type: questionType,
                    };
                    userInput.push(userInputItem);
                    //console.log(questionLabel.text().replace('(Required)',''), questionValue);
                  });

                  return userInput;
                },

                /**
                 *
                 */
                parseUserInput: function parseUserInput(userInput) {
                  var parsedUserInput = [];

                  /**
                   *
                   */
                  function attachmentFilter(attachment) {
                    return (attachment !== 'null');
                  }

                  userInput.forEach(function (item) {
                    var parsedInputItem = {
                      Answer: item.Answer,
                      Question: item.Question,
                    };

                    switch (item.Type) {
                      case 'enum':
                        app.lib.getEnumDisplayName(parsedInputItem.Answer, function (data) {
                          parsedInputItem.Answer = data;
                        });
                        break;
                      case 'datetime':
                        parsedInputItem.Answer = app.lib.getFormattedLocalDateTime(parsedInputItem.Answer);
                        break;
                      case 'fileattachment':
                        parsedInputItem.Answer = parsedInputItem.Answer.split('(((;)))').join(',').split('(((:)))').join(',').split(',').filter(attachmentFilter).join('<br/>');
                        break;
                      default:
                        if (typeof (parsedInputItem.Answer) === 'object') {
                          parsedInputItem.Answer = app.lib.getQueryResultDisplayText(item);
                        }
                    }

                    parsedUserInput.push(parsedInputItem);
                  });
                  return parsedUserInput;
                },
                /**
                 *
                 */
                create: function (options) {
                  options.success(this.parseUserInput(this.getUserInput()));
                },
                /**
                 *
                 */
                read: function (options) {
                  options.success(this.parseUserInput(this.getUserInput()));
                },
              },
            }),
            kendoGrid = gridEle.kendoGrid({
              dataSource: gridDataSource,
              columns: [{
                field: 'Question',
                encoded: false,
              }, {
                field: 'Answer',
                encoded: false,
              }],
            });
          gridEle.find('.k-grid-header').hide();
          gridEle.find('.k-grid-toolbar').hide();

          $('#drawer-taskbar').find('button:contains("Next")').on('click', function () {
            $('section').filter('[ng-show="(currentIndex==1)"]').find('div.page-panel').find('div[data-control-grid]').data().handler.dataSource.read();
          });

          return kendoGrid;
        }

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
          });

          //var target = promptElm.next().find('div.col-xs-12'),
          var builtSummary = _.template(summaryTemplate);

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm) {
            $(targetElm).removeClass('col-md-8').addClass('col-md-12');
            $(targetElm).html(builtSummary());
            createSummary($(targetElm).find('div[data-control-bind]'));
          });
        }

        initROTask();
      },
    };

  return definition;
});
