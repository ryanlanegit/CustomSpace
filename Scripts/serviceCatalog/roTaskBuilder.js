/*global _, $, app, console, define, document, performance */

/**
Custom Request Offering Task Builder
**/

define([
  'CustomSpace/Scripts/serviceCatalog/tasks/addClass/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/addInformation/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/addShowCriteria/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/autoSize/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/bindHash/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/bindSessionUser/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/charCount/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/indent/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/layoutTemplate/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/rowContainer/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/setAttribute/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/setOptions/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/singleLineEntry/controller',
// 'CustomSpace/Scripts/serviceCatalog/tasks/externalFileAttachmentsDragDrop/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/summary/controller',
], function (
  addClassController,
  addInformationController,
  addShowCriteriaController,
  autoSizeController,
  bindHashController,
  bindSessionUserController,
  charCountController,
  indentController,
  layoutTemplateController,
  rowContainerController,
  setAttributeController,
  setOptionsController,
  singleLineEntryController,
//  externalFileAttachmentsDragDropController,
  summaryController
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('roTaskBuilder:define', performance.now());
  }
  var roTaskModules = arguments,
    nodeConfig = {
      Name: 'roTaskBuilder',
      Type: 'RequestOffering',
      Label: 'Request Offering Task Builder',
      Access: true,
      Configs: {},
    },
    definition = {
      node: nodeConfig,
      build: function build(vm, node, callback) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('roTaskBuilder:build', performance.now(), {
            vm: vm,
            node: node,
            callback: callback,
          });
        }
        /* BEGIN Functions */
        function buildAndRender(taskName, promptElm, options) {
          var roTask = _.filter(roTaskModules, function (roTask) {
            if (_.isUndefined(roTask.task)) {
              return false;
            } else {
              return (roTask.task.Task.toLowerCase() === taskName.toLowerCase());
            }
          })[0];

          if (!_.isUndefined(roTask)) {
            roTask.build(vm, promptElm, options);
          } else {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              console.log('Property Not Found For Rendering:', taskName);
            }
          }
        }
        /* END functions */

        /* Initialization code */
        function initTask() {
          $('div.page-panel').each(function () {
            var roPage = $(this),
              roTaskElms = roPage.find('div.row').filter(function (index) {
                return app.custom.utils.isValidJSON($(this).text());
              }),
              roQuestionElms = roPage.find('div.question-container');
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              console.log('roTaskBuilder:initTask', performance.now(), {
                roPage: roPage,
                roTaskElms: roTaskElms,
                roQuestionElms: roQuestionElms,
              });
            }

            roQuestionElms.each(function () {
              var questionElm = $(this),
                questionId = questionElm.find('input.question-answer-id').val(),
                questionType = questionElm.find('input.question-answer-type').val(),
                questionFormGroup = questionElm.find('div.form-group'),
                msgSpan;

              switch (questionType) {
              case 'Integer':
                vm.waitForAngular(function () {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('roTaskBuilder:initTask:SetDefaultOptions', performance.now(), {
                      questionType: questionType,
                      options: {format: '#', decimals: 0 },
                    });
                  }
                  questionFormGroup.find('input[data-role]').data().handler.setOptions({format: '#', decimals: 0 });
                  if (questionElm.find('span.k-invalid-msg').length === 0) {
                    msgSpan = $('<span></span');
                    msgSpan.addClass('k-invalid-msg').attr('data-for', questionId);
                    questionFormGroup.prepend(msgSpan);
                  }
                });
                break;
              }
            });

            roTaskElms.each(function () {
              var roTaskElm = $(this),
                  parsedProperties = JSON.parse(roTaskElm.text()),
                  propName;
              for (propName in parsedProperties) {
                if (parsedProperties.hasOwnProperty(propName)) {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('roTaskElm.property', {
                      name: propName,
                      value: parsedProperties[propName],
                    });
                  }
                  // Ignore tasks with a namespace as they represent additional options/criteria for a previous task
                  if (propName.indexOf('.') === -1) {
                    buildAndRender(propName, roTaskElm, parsedProperties[propName]);
                  }
                }
              }
            });
          });

          if (typeof callback === 'function') {
            callback();
          }
        }

        initTask();
      },
    };

  return definition;
});
