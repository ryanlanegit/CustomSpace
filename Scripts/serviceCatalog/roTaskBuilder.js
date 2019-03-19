/* global $, _, app, define, kendo */

/**
 * Custom Request Offering Task Builder
 * @module roTaskBuilder
 * @see module:roTaskMain
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
  'CustomSpace/Scripts/serviceCatalog/tasks/addClass/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/addInformation/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/addShowCriteria/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/autoSize/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/bindHash/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/bindSessionUser/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/charCount/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/indent/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/rowContainer/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/setAttribute/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/setOptions/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/singleLineEntry/controller',
  'CustomSpace/Scripts/serviceCatalog/tasks/summary/controller',
], function (
  roTaskUtils,
  addClassController,
  addInformationController,
  addShowCriteriaController,
  autoSizeController,
  bindHashController,
  bindSessionUserController,
  charCountController,
  indentController,
  rowContainerController,
  setAttributeController,
  setOptionsController,
  singleLineEntryController,
  summaryController
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('roTaskBuilder:define');
  }
  var roTaskModules = _.chain(arguments)
        .toArray()
        .filter(function (argument) {
          return (typeof argument === 'object' && !_.isUndefined(argument.task));
        })
        .value(),
      nodeConfig = {
        Name: 'roTaskBuilder',
        Type: 'RequestOffering',
        Label: 'Request Offering Task Builder',
        Configs: {},
        Access: true,
      },

      /**
       * @exports roTaskBuilder
       */
      definition = {
        node: nodeConfig,
        /**
         * Build Request Offering Tasks.
         *
         * @param {function} [callback] - callback function once build is complete.
         */
        build: function build(callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskBuilder:build', {
              callback: callback,
            });
          }

          // #region Utility functions

          /**
           * Build and render a Request Offering Task.
           *
           * @param {object} roTaskElm - Task Container
           * @param {string} taskName - Task Name
           * @param {object} options - Number
           */
          function buildAndRender(roTasksVm, roTaskElm, taskName, options) {
            var roTask = _.find(roTaskModules, function (roTask) {
                return roTask.task.Name.toLowerCase() === taskName.toLowerCase();
            });

            if (!_.isUndefined(roTask)) {
              roTask.build(roTasksVm, roTaskElm, options);
            } else {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log(2, 'Property Not Found For Rendering:', taskName);
              }
            }
          }

          /**
           * Get Request Offering Tasks View Model.
           */
          function getROTasksViewModel() {
            var roTasksVm = new kendo.observable({
              isReady: false,
              _readyDeferred: $.Deferred(),

              /**
               * Check if Grid Tasks is ready.
               *
               * @returns {object} Deferred promise.
               * @param {function} [fn] Optional deferred callback function.
               */
              ready: function ready(fn) {
                if (typeof fn === 'function') {
                  this._readyDeferred.then(fn);
                }
                return this._readyDeferred.promise();
              },
            });

            return roTasksVm;
          }

          // #endregion Utility functions

          /**
           * Request Offering Task initialization script
           */
          function initTask() {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('roTaskBuilder:initTask');
            }
            var roTasksVm = getROTasksViewModel();

            $('div.page-panel').each(function () {
              var roPage = $(this),
                  roQuestionElms = roPage.children('.question-container'),
                  roTaskElms = roPage.children('.task-container');
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('roTaskBuilder:initTask', {
                  roPage: roPage,
                  roTaskElms: roTaskElms,
                  roQuestionElms: roQuestionElms,
                });
              }

              roQuestionElms.each(function () {
                var questionElm = $(this),
                    questionId = questionElm.children('input.question-answer-id').val(),
                    questionType = questionElm.children('input.question-answer-type').val(),
                    questionFormGroup = questionElm.find('div.form-group');

                switch (questionType) {
                case 'Integer':
                  roTaskUtils.waitForAngular(function () {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                      app.custom.utils.log('roTaskBuilder:initTask:SetDefaultOptions', {
                        questionType: questionType,
                        options: { format: '#', decimals: 0 },
                      });
                    }
                    questionFormGroup.find('input[data-role]').data().handler.setOptions({format: '#', decimals: 0 });
                    if (questionElm.find('span.k-invalid-msg').length === 0) {
                      questionFormGroup.prepend($('<span></span>', {
                        'class': 'k-invalid-msg',
                        'data-for': questionId,
                      }));
                    }
                  });
                  break;
                }
              });

              roTaskElms.each(function () {
                var roTaskElm = $(this),
                    parsedProperties = JSON.parse(roTaskElm.text());
                _.each(parsedProperties, function (val, key) {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('roTaskElm.property', {
                      key: key,
                      value: val,
                    });
                  }
                  // Ignore tasks with a namespace as they represent additional options/criteria for a previous task
                  if (key.indexOf('.') === -1) {
                    buildAndRender(roTasksVm, roTaskElm, key, val);
                  }
                });
              });
            });

            if (typeof callback === 'function') {
              callback(roTasksVm);
            }

            roTasksVm.isReady = true;
            roTasksVm._readyDeferred.resolve();

            return roTasksVm;
          }

          return initTask();
        },
      };

  return definition;
});
