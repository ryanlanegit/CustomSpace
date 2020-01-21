/* global $, _, app, define, kendo, localizationHelper, pageForm, session */

/**
 * Custom User Input for Work Items
 * @module userInputGridController
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define([
  'CustomSpace/Scripts/customLib',
  'CustomSpace/Scripts/forms/wiTaskLib',
], function (
  customLib,
  wiTaskLib
) {
  'use strict';
  var wiTask = {
        Task: 'userInputGrid',
        Type: 'Incident|ServiceRequest',
        Configs: {},
        /**
         * @type (string)
         */
        get Label() {
          return null;//localizationHelper.localize('userInputGrid', 'User Input Grid');
        },
        /**
         * @type {boolean}
         */
        get Access() {
          return (session.user.Analyst === 1);
        },
      },
      /**
       * @exports userInputGridController
       */
      definition = {
        template: null,
        task: wiTask,
        /**
         * Build Work Item Task.
         *
         * @param {Object} vm - View Model of the base roTask plugin.
         * @param {Object} roTaskElm - Source task container element.
         * @param {Object} options - Parsed options from roTaskElm's JSON contents
         */
        build: function build(vm, node, callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('userInputGridController:build', {
              task: wiTask,
            });
          }

          // #region Utility functions

          /**
           * Update User Inputs Grid
           */
          function updateUserInputGrid(targetElm, dataSource) {
            var userInputsGrid = $(targetElm).data('kendoGrid');
            if (!_.isUndefined(userInputsGrid)) {
              userInputsGrid.setOptions({
                columns: [{
                  field: 'Question',
                  encoded: false,
                }, {
                  field: 'Answer',
                  attributes: {
                    style: 'white-space:pre-wrap',
                  },
                  encoded: false,
                }],
              });
              $(targetElm).find('.k-grid-header').hide();
              userInputsGrid.setDataSource(dataSource);
            }
          }

          // #endregion Utility functions

          /**
           * Work Item Form Task initialization script.
           */
          function initFormTask() {
            var userInputsGridElm = $('div[data-control-grid="userInputsGrid"]'),
                userInputsGrid = userInputsGridElm.data('kendoGrid'),
                userInputGridConfig = {
                  transport: {
                    read: {
                      url: '/Search/GetObjectProperties',
                      dataType: 'json',
                      contentType: 'application/json; charset=utf-8',
                      data: {
                        Id: pageForm.viewModel.BaseId,
                      },
                    },
                  },
                  schema: {
                    /**
                     * Return Non-Array Result an Array of Length 1.
                     */
                    data: function (response) {
                      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                        app.custom.utils.log('userInputGrid:GetObjectProperties:schema', {
                          userInputData: userInputData,
                          response: response,
                        });
                      }
                      var userSchema = this,
                          userInputRawXml = _.isNull(response['User Input']) ? '' : response['User Input'].replace(/(\r\n|\n|\r)/gm,'&#13;&#10;'),
                          userInputXml = $.parseXML(userInputRawXml),
                          userInputData = $(userInputXml).find('UserInput').map(function(index){
                            var answerObj = {},
                                originalItem = {};
                            $.each(this.attributes, function () {
                              var attrName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
                              answerObj[attrName] = this.value;
                            });

                            return answerObj;
                          });
                      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                        app.custom.utils.log('userInputGrid:GetObjectProperties:schema', {
                          userInputData: userInputData,
                          response: response,
                        });
                      }
                      return userInputData;//(Object.prototype.toString.call(response) === '[object Array]') ? response : [response];
                    },
                  },
                  originalData: _.map(userInputsGrid.dataSource.data(), customLib.property(['Question', 'Answer'])),
                  /**
                   * Replace enumeration or query result display text
                   */
                  requestEnd: function (e) {
                    var originalData = e.sender.options.originalData;
                    _.defer(function() {
                        //console.log('RequestEnd', e, originalData, e.sender.data(), e.sender._data);
                        _.each(e.sender._data, function (dataItem, i) {
                          var originalItem = (originalData[i].Question == dataItem.Question) ? originalData[i] : _.findWhere(originalData, { Question: dataItem.Question });
                          switch (dataItem.Type) {
                            case 'enum':
                              if (_.isUndefined(originalItem)) {
                                app.lib.getEnumDisplayName(dataItem.Answer, function(data) {
                                  dataItem.set('Answer', data);
                                });
                              } else {
                                dataItem.set('Answer', originalItem.Answer);
                              }
                              break;
                            case 'System.SupportingItem.PortalControl.InstancePicker':
                              dataItem.set('Answer', (_.isUndefined(originalItem)) ? app.lib.getQueryResultDisplayText(dataItem.Answer) : originalItem.Answer);
                              break;
                          }
                        });
                    });
                  },
                },
                userInputGridConfigId = 'GetObjectProperties.' + customLib.createHash(userInputGridConfig),
                userInputGridDataSource = customLib.api.getDataSource(userInputGridConfigId, userInputGridConfig);

            updateUserInputGrid(userInputsGridElm, userInputGridDataSource);
          }

          if (!_.isNull(pageForm.viewModel.UserInput)) {
            initFormTask();
          }
        },
      };

  return definition;
});
