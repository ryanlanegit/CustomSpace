/* global $, _, angular, app, define, kendo */

/**
 * 'enumList' Request Offering Task
 * @module enumListController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/customLib',
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
], function (
  customLib,
  roTaskLib
) {
  'use strict';
  var roTask = {
      Name: 'enumList',
      Type: 'RequestOffering',
      Label: 'Enum List',
      Configs: {},
      Access: true,
    },

    /**
     * @exports enumListController
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
          app.custom.utils.log('enumListController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        var initFetchDataSource = _.once(function (dataSource) {
          dataSource.fetch();
        });

        /**
         * Determine if Source Data Contains chosen default value
         */
        function isDefault(data) {
          return data[options.default] == 1;
        }

        /**
         * Update Dropdown List DataSource.
         *
         * @param {Object} targetElm - Target dropdown container.
         * @param {String} dataSource - New dropdown DataSource value.
         * @param {Object} data - DataSource fetch response value.
         */
        function updateDropdownDataSource(targetElm, dataSource, data) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumListController:updateDropdownDataSource', {
              targetElm: targetElm,
              dataSource: dataSource,
            });
          }
          var targetInputELm = $(targetElm).find('input[data-control="inlineComboBox"]'),
              dropdownListControl = targetInputELm.data('kendoDropDownList'),
              keys = Object.keys(_.first(data)),
              itemField = (options.item) ? options.item: (options.value) ? options.value : keys[2],
              valueField = (options.value) ? options.value : itemField;
          //var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          roTaskLib.waitForAngular(function () {
            dropdownListControl.setOptions({
              dataTextField: itemField,
              dataValueField: valueField,
            });
            dropdownListControl.setDataSource(dataSource);

            if (options.default) {
              var defaultItem = _.findWhere(data, {Text: options.default});
              if (_.isUndefined(defaultItem)) {
                defaultItem = _.findWhere(data, {Id: options.default});
              }


              if (!_.isUndefined(defaultItem)) {
                var valueTargetId = targetInputELm.attr('data-control-valuetargetid'),
                    hiddenInputElm = $('#' + valueTargetId),
                    ngModel = hiddenInputElm.attr('ng-model');
/*
                var angularInputElm = angular.element('#' + valueTargetId),
                    angularScope = angularInputElm.scope();
                angularScope.$apply(function() {*/
                  hiddenInputElm.attr('data-default-value', defaultItem.Text);
                  dropdownListControl.value(defaultItem.Text);
                  dropdownListControl.trigger('change');
                  //dropdownListControl.change();
                  //hiddenInputElm.val(defaultItem.Text)
                //})
              }
            }
            //var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            /*if (_.isEmpty(currentValue)) {
              $(textareaElm)
                .val(value)
                .trigger('onkeyup')
                .trigger('keyup')
            }*/
          });
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
            default: false,
            //parentId: '7030beac-cbda-9acf-9c51-6832d91650f2', // Locations
            parentId: '6dc39c57-60fd-4c69-e439-01f41037bee2', // Departments
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetParentId = (typeof options.parentId === 'string') ? options.parentId : options.parentId[targetIndex],
                enumListConfig = {
                  transport: {
                    read: {
                      url: '/api/v3/Enum/GetListForRequestOffering?parentId='+targetParentId+'&itemFilter=',
                      dataType: 'json',
                      contentType: 'application/json; charset=utf-8',
                    },
                    sort: (options.sort) ? {
                      field: options.sort,
                      dir: 'asc',
                    } : {},
                  },
                  schema: {
                    /**
                     * Adapt Enum List
                     */
                    data: function (response) {
                      console.log('enumList', {
                        response: response,
                      });
                      var blankDataItem = {
                        Id: app.lib.newGUID(),
                        Text: '',
                        Name: '',
                      }
                      response.unshift(blankDataItem);
                      return response;
                    },
                    //total: "Total",
                    //errors: "Errors"
                  },
                },
                enumListConfigId = 'GetListForRequestOffering.' + customLib.createHash(enumListConfig),
                enumListDataSource = customLib.api.getDataSource(enumListConfigId, enumListConfig);

              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumListController:processNext', {
                  targetElm: targetElm,
                  enumListConfigId: enumListConfigId,
                  enumListDataSource: enumListDataSource,
                });
              }
              var targetInputELm = $(targetElm).find('input[data-control="inlineComboBox"]'),
                  dropdownListControl = targetInputELm.data('kendoDropDownList');
              //targetInputELm.addClass('auto-size').attr('rows', targetRows);

              enumListDataSource.bind('requestEnd', function responseHandler(event) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('GetListForRequestOffering:requestEnd', {
                    id: enumListConfigId,
                    response: event.response,
                  });
                }

                if (!_.isEmpty(event.response)) {
                  updateDropdownDataSource(targetElm, enumListDataSource, event.response);
                } else {
                  if (!_.isUndefined(app.custom.utils)) {
                    app.custom.utils.log(2, 'GetListForRequestOffering:requestEnd', 'Warning! Invalid results returned.');
                  }
                }
                enumListDataSource.unbind('requestEnd', responseHandler);
              });
              initFetchDataSource(enumListDataSource);
          });
        }

        initROTask();
      },
    };

  return definition;
});
