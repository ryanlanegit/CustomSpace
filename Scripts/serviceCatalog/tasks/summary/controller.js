/*global $, _, app, console, define, kendo */

/**
Summary
**/

define([
  'text!CustomSpace/Scripts/serviceCatalog/tasks/summary/view.html',
], function (
  summaryTemplate
) {
  'use strict';
  var roTask = {
      Task: 'summary',
      Type: 'RequestOffering',
      Label: 'Summary',
      Access: true,
      Configs: {},
    },

    definition = {
      template: summaryTemplate,
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

        function createSummary(targetEle) {
          if (!targetEle) {
            app.controls.exception('targetEle missing - roTaskBuilder.createSumary');
          }

          var gridEle = targetEle.find('div[data-control-grid]'),
            gridDataSource = new kendo.data.DataSource({
              transport: {
                getUserInput: function getUserInput() {
                  var roQuestionElms = $('div.question-container').filter(':not(.ng-hide)'),
                    userInput = [];
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('roTaskBuilder:createSummary.getUserInput', {
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
                        if (app.custom.utils.isValidGUID(questionValue)) {
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
                parseUserInput: function parseUserInput(userInput) {
                  var parsedUserInput = [];

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
                create: function (options) {
                  options.success(this.parseUserInput(this.getUserInput()));
                },
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
            $('section[ng-show="(currentIndex==1)"]').find('div.page-panel').find('div[data-control-grid]').data().handler.dataSource.read();
          });

          return kendoGrid;
        }

        /* Initialization code */
        function initROTask() {
          var target = promptElm.next().find('div.col-xs-12'),
            builtSummary = _.template(summaryTemplate);

          processNext(promptElm, options.next, function (targetElm) {
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
