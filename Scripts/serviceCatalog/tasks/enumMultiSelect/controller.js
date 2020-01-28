/* global $, _, angular, app, define, kendo */

/**
 * 'enumMultiSelect' Request Offering Task
 * @module enumMultiSelectController
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
      Name: 'enumMultiSelect',
      Type: 'RequestOffering',
      Label: 'Enum List',
      Configs: {},
      Access: true,
    },

    /**
     * @exports enumMultiSelectController
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
          app.custom.utils.log('enumMultiSelectController:build', {
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
        function updatePickerDataSource(targetElm, dataSource, data) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumMultiSelectController:updatePickerDataSource', {
              targetElm: targetElm,
              dataSource: dataSource,
            });
          }
          var targetInputELm = $(targetElm).find('select[data-kendo-control="multiselect"]'),
              multiSelectControl = targetInputELm.data('kendoMultiSelect'),
              keys = Object.keys(_.first(data)),
              itemField = (options.item) ? options.item: (options.value) ? options.value : keys[2],
              valueField = (options.value) ? options.value : itemField;
          //var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          roTaskLib.waitForAngular(function () {
            //$(targetElm).children('div').removeClass('col-md-6').addClass('col-md-12');

            var targetAppendElm = $('<div class="form-group row">');
            $(targetElm).find('.multi-query-textfield').append(targetAppendElm);
            $(targetElm).find('.multi-query-textfield__multiselect-field').parent()
              .css({
                'margin-top': '8px',
              })
              .removeClass('col-sm-6')
              .addClass('col-sm-12')
              .appendTo(targetAppendElm);
            /*$(targetElm).find('.k-multiselect.k-header')
              .css({
                'padding': '0px',
              });*/
            $('select[data-kendo-control="multiselect"]').data('kendoMultiSelect').setOptions({'footerTemplate': '#: instance.dataSource._view.length #/ #: instance.dataSource.total() #'});

            multiSelectControl.setOptions({
              dataTextField: itemField,
              dataValueField: valueField,
            });
            multiSelectControl.setDataSource(dataSource);

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
                  multiSelectControl.value(defaultItem.Text);
                  multiSelectControl.trigger('change');
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
            var targetParentId = _.isArray(options.parentId) ? options.parentId[targetIndex] : options.parentId,
                enumMultiSelectConfig = {
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
                     * Adapte Enum List to Use With MultiSelect
                     */
                    data: function (response) {
                      var data = response;
                      data = _.map(data, function (el) {
                        var flag = false;
                        var array = [] // (el.Details) ? el.Details.split(",") : [];
                        /*for (var i in array) {
                          var val = array[i];
                          if (moment(val).isValid()) {
                            flag = true;
                            array[i] = kendo.toString(moment.utc(val).toDate(), 'g');
                          }
                        }*/
                        el.Details = (flag) ? array.join(", ") : "";
                        return el;
                      });
                      return response;
                    },
                    //total: "Total",
                    //errors: "Errors"
                  },
                },
                enumMultiSelectConfigId = 'GetListForRequestOffering.' + customLib.createHash(enumMultiSelectConfig),
                enumMultiSelectDataSource = customLib.api.getDataSource(enumMultiSelectConfigId, enumMultiSelectConfig);

              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumMultiSelectController:processNext', {
                  targetElm: targetElm,
                  enumMultiSelectConfigId: enumMultiSelectConfigId,
                  enumMultiSelectDataSource: enumMultiSelectDataSource,
                });
              }
              var targetInputELm = $(targetElm).find('input[data-control="inlineComboBox"]'),
                  dropdownListControl = targetInputELm.data('kendoDropDownList');
              //targetInputELm.addClass('auto-size').attr('rows', targetRows);

              enumMultiSelectDataSource.bind('requestEnd', function responseHandler(event) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('GetListForRequestOffering:requestEnd', {
                    id: enumMultiSelectConfigId,
                    response: event.response,
                  });
                }

                if (!_.isEmpty(event.response)) {
                  updatePickerDataSource(targetElm, enumMultiSelectDataSource, event.response);
                } else {
                  if (!_.isUndefined(app.custom.utils)) {
                    app.custom.utils.log(2, 'GetListForRequestOffering:requestEnd', 'Warning! Invalid results returned.');
                  }
                }
                enumMultiSelectDataSource.unbind('requestEnd', responseHandler);
              });
              initFetchDataSource(enumMultiSelectDataSource);
          });
        }

        initROTask();
      },
    };

  return definition;
});
