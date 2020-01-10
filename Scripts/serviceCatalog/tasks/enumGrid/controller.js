/* global $, _, angular, app, define, kendo */

/**
 * 'enumGrid' Request Offering Task
 * @module enumGridController
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
      Name: 'enumGrid',
      Type: 'RequestOffering',
      Label: 'Enum List',
      Configs: {},
      Access: true,
    },

    /**
     * @exports enumGridController
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
          app.custom.utils.log('enumGridController:build', {
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
         * Update textarea field value.
         *
         * @param {Object} targetElm - Target textarea container.
         * @param {String} value - New textarea text value.
         */
        function updateTextAreaValue(targetElm, value) {
          var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          roTaskLib.waitForAngular(function () {
            var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            //if (_.isEmpty(currentValue)) {
              $(textareaElm)
                .val(value)
                .trigger('onkeyup')
                .trigger('keyup')
            //}
          });
        }

        /**
         *  Add Click Anywhere To (Un)Select Checkbox
         * Toggle Scrollbar based on Grid height
         * https://docs.telerik.com/kendo-ui/knowledge-base/hide-scrollbar-when-not-needed
         */
        function onDataBound(e) {
          var grid = e.sender,
              rows = grid.items(),
              gridWrapper = e.sender.wrapper,
              gridDataTable = e.sender.table,
              gridDataArea = gridDataTable.closest('.k-grid-content');

          // Toggle scrollbar
          gridWrapper.toggleClass('no-scrollbar', gridDataTable[0].offsetHeight < gridDataArea[0].offsetHeight);
          // Remove Cireson Padding-Right from header
          gridWrapper.children('.k-grid-header').css('padding-right', 'inherit')

          // Add DropDownLists
          for (var i = 0; i < grid.columns.length; i++) {
            var column = grid.columns[i];
            if (!_.isUndefined(column.dataSource)) {
              rows.each(function() {
                var row = $(this),
                    dataItem = grid.dataItem(row),
                    dropdownElm = row.find('.dropDownTemplate');
                if (_.isUndefined(dataItem.get(column.field))) {
                  dataItem[column.field] = column.defaultValue;
                }
                dropdownElm
                  .attr('data-default-value', dataItem.get(column.field))
                  .kendoDropDownList({
                    value: dataItem.get(column.field),
                    dataSource: column.dataSource,
                    dataTextField: 'Name',
                    dataValueField: 'Name',
                    /**
                     *  DropDownList Change Handler
                     */
                    change: function (e) {
                      /*if (_.isUndefined(dataItem.selected) || dataItem.selected === false ) {
                        dataItem.selected = true;
                      }*/
                      dataItem.set(column.field, e.sender.value());
                      dropdownElm.attr('data-default-value', e.sender.value());
                    },
                  });

                dropdownElm.closest('.k-dropdown').on('click', function (e) {
                  e.stopPropagation();
                  return false;
                });
              });
            }
          }
        }

        /**
         * Update Dropdown List DataSource.
         *
         * @param {Object} targetElm - Target dropdown container.
         * @param {String} dataSource - New dropdown DataSource value.
         * @param {Object} data - DataSource fetch response value.
         */
        function addEnumGrid(targetElm, dataSource, data) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:addEnumGrid', {
              targetElm: targetElm,
              dataSource: dataSource,
            });
          }
          var targetInputELm = $(targetElm).find('textarea'),
              keys = Object.keys(_.first(data)),
              title = (options.title) ? options.title : (options.value) ? options.value : keys[2],
              valueField = (options.value) ? options.value : keys[2],
              headerId = app.lib.newGUID(),
              footerId = app.lib.newGUID(),
              targetGridElm = $('<div/>', {
                id: 'grid' + targetInputELm.attr('id'),
                class: 'k-enum-grid',
              });

          // Hide Input Field
          targetInputELm.hide();
          // Append Checkbox Grid Input
          targetInputELm.after(targetGridElm);
          var kendoGridViewModel = {
            dataSource: dataSource,
            dataBound: onDataBound,
            navigatable: true,
            selectable: 'multiple, row',
            sortable: true,
            //selectable: 'multiple,row',
            persistSelection: true,
            columns: [{
              sortable: {
                /**
                 * Sort alphabetically, with exception for Other last.
                 */
                compare: function (a, b, descending) {
                  return a.Name === 'Other' ?
                    descending ? -1 : 1 :
                    b.Name === 'Other' ?
                      descending ? 1 : -1 :
                      a.Name === b.Name ? 0 :
                        a.Name > b.Name ? 1 : -1;
                },
              },
              attributes: {
                class: 'k-grid-checkbox',
              },
              headerAttributes: {
                class: 'k-grid-checkbox-header',
              },
              field: valueField,
              title: title,
              headerTemplate: '<input id="' + headerId + '" class="k-checkbox header-checkbox" type="checkbox"><label class="k-checkbox-label label-middle-align checkbox-inline checkbox-label" for="' + headerId +'"><span>&\#8203;</span></label>' + title,
              template: '<input class="k-checkbox" data-role="checkbox" aria-label="Select row" aria-checked="false" type="checkbox"><label class="k-checkbox-label label-middle-align checkbox-inline"><span>#: ' + valueField + ' #</span></label>',
              //footerTemplate: '<div id="' + footerId + '"></div>',
            }],
            /**
             * Grid Change Handler
             */
            change: function(e) {
              if (_.isUndefined(this.changePrevented) || !this.changePrevented) {
                var selectedRowElms = this.select().toArray(),
                    selectedDataItems = [],
                    sourceDataItems = this.dataSource.data(),
                    sortedDataItems = [],
                    formattedResult = '',
                    dataItems = this.dataItems();
                if (true) {// (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('enumGridController:change', {
                    event: e,
                    selectedRowElms: selectedRowElms,
                    sourceDataItems: sourceDataItems,
                  });
                }

                /**
                 * Bypass custom selection behavior on:
                 * - manual events (select all or keyboard enter)
                 * - init selection
                 * - selection after hiding/showing
                 */
                if (!this.selectEvent.selectAll && !this.selectEvent.enterKey && targetInputELm.val() !== '') {
                  var selectedUIDs = _.chain(dataItems)
                        .where({selected: true})
                        .pluck('uid')
                        .value(),
                      gridRowElms = this.items(),
                      activeGridRowElms = [],
                      selectedGridRowElms = _.filter(gridRowElms, function (gridRowElm) {
                        return _.contains(selectedUIDs, gridRowElm.getAttribute('data-uid'));
                      }),
                      selectedRowElm = $(this.current()).closest('tr'),
                      selectedDataItem = this.dataItem(selectedRowElm);

                  this.changePrevented = true;
                  if(!this.selectEvent.ctrlKey && !this.selectEvent.shiftKey) {
                    if (selectedRowElms.length === 1 && !_.isUndefined(selectedDataItem.selected) && selectedDataItem.selected) {
                      // toggle selection
                      if (!_.isUndefined(selectedDataItem.selected) && selectedDataItem.selected) {
                        targetKendoGrid.clearSelection();
                        activeGridRowElms = _.without(selectedGridRowElms, selectedRowElm.get(0));
                        targetKendoGrid.select(activeGridRowElms);
                      }
                    } else {
                      activeGridRowElms = _.difference(selectedGridRowElms, selectedRowElms);
                      targetKendoGrid.select(activeGridRowElms);
                    }
                  } else if (this.selectEvent.shiftKey) {
                    activeGridRowElms = _.difference(selectedGridRowElms, selectedRowElms);
                    targetKendoGrid.select(activeGridRowElms);
                  }
                  this.changePrevented = false;
                }

                // Get currently Selected rows after Change event handler
                selectedRowElms = this.select();
                // Get selected uid values from the Selected rows
                for (var i = 0; i < selectedRowElms.length; i++) {
                  var dataItem = this.dataItem(selectedRowElms[i]);
                  selectedDataItems.push(dataItem);
                }

                if (selectedDataItems.length > 0) {
                  var formattedResults = [];
                  // Sort selected uids to match original dataset
                  sortedDataItems = _.intersection(sourceDataItems, selectedDataItems)//.join('\n');

                  for (var i = 0; i < sortedDataItems.length; i++) {
                    var dataItem = sortedDataItems[i];
                    formattedResults.push(customLib.stringFormat(options.schema.template, dataItem));
                  }

                  formattedResult = formattedResults.join('\n');
                }


                // Set Footer summary
                //$('#' + footerId).html(selectedUIDs.length + '/' + dataItems.length);
                // Update Original Field value
                updateTextAreaValue(targetElm, formattedResult);
              }
            },
          }

          if (!_.isUndefined(options.height) && options.height !== 'auto') {
            kendoGridViewModel.height = options.height;
          }

          if (!_.isUndefined(options.model)) {
            if (!_.isUndefined(options.model.columns)) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:build:extendmodel', {
                  kendoGridViewModel: kendoGridViewModel,
                  model: options.model,
                });
              }
              /*
              for (var i = 0; i < options.model.columns.length; i++) {
                var column = options.model.columns[i],
                    columnKeys = Object.keys(column);

                for (var j = 0; j < columnKeys.length; j++) {
                  var key = columnKeys[j];
                  switch (key) {
                    case 'sortable':
                      switch (column[key].toLowerCase()) {
                        case 'true':
                          column[key] = true;
                          break;
                        case 'false':
                          column[key] = false;
                          break;
                      }
                      break;
                  }
                }
              }*/

              kendoGridViewModel.columns = kendoGridViewModel.columns.concat(options.model.columns);
            }
          }
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:build', {
              kendoGridViewModel: kendoGridViewModel,
            });
          }
          var targetKendoGrid = targetGridElm.kendoGrid(kendoGridViewModel).data('kendoGrid');
          /**
           * Set default click events for use with the Click handlers and Change event
           */
          targetKendoGrid.selectEvent = {
            selectAll: false,
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
            enterKey: false,
          };

          /**
           * Select ALl checkbox click handler
           */
          targetKendoGrid.thead.find('.k-grid-checkbox-header .k-checkbox-label').on('click', function (e) {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('enumGridController:click', {
                e: e,
                this: this,
                checked: $('#' + $(this).prop('for')).prop('checked'),
              });
            }

            targetKendoGrid.selectEvent.selectAll = true;
            if ($('#' + $(this).prop('for')).prop('checked')) {
              targetKendoGrid.clearSelection();
            } else {
              var gridRowElms = targetKendoGrid.items();
              targetKendoGrid.select(gridRowElms);
            }
            targetKendoGrid.selectEvent.selectAll = false;
            e.stopPropagation();
            return false;
          });

          /**
           * Update Select All checkbox checked status and title text
           */
          targetInputELm.on('manual-change', function(e) {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:manual-change', {
                event: e,
                this: this,
              });
            }
            var dataItems = targetKendoGrid.dataItems(),
                selectedRowElms = targetKendoGrid.select();

            // Reset All DataItems Selected status to False
            for (var i = 0; i < dataItems.length; i++) {
              dataItems[i].selected = false;
            }
            // Set Selected DataItems Selectedstatus to True
            for (var i = 0; i < selectedRowElms.length; i++) {
              var dataItem = targetKendoGrid.dataItem(selectedRowElms[i]);
              dataItem.selected = true;
            }

            // Set header checkbox (un)checked if all items are selected
            var checkboxElm = targetKendoGrid.thead.find('#' + headerId),
                checkboxLabelElm =  targetKendoGrid.thead.find('label[for="' + headerId + '"]'),
                allRowsSelected = (selectedRowElms.length === dataItems.length);

            checkboxElm.prop('checked', allRowsSelected);
            checkboxLabelElm.prop('title', allRowsSelected ? 'Unselect All' : 'Select All');
          });

          targetKendoGrid.table
            .on('click mousedown', 'td', function (e) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:click', e);
              }
              _.extend(targetKendoGrid.selectEvent, {
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
              });
            })
            .on('keydown', function (e) {
              //console.log('keydown!', e, this);
              if (e.keyCode === 13) {//} && e.shiftKey) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('enumGridController:keydown', {
                    targetKendoGrid: targetKendoGrid,
                    currentSelection: targetKendoGrid.current(),
                    currentRow: $(targetKendoGrid.current()).closest('tr'),
                  });
                }
                var currentRow = $(targetKendoGrid.current()).closest('tr'),
                    selectedRows = targetKendoGrid.select();
                targetKendoGrid.selectEvent.enterKey = true;
                if (currentRow.hasClass('k-state-selected')) {
                  // toggle selection
                  targetKendoGrid.clearSelection();
                  var activeRowElms = _.without(selectedRows, currentRow.get(0))
                  targetKendoGrid.select(activeRowElms);
                } else {
                  // select row
                  targetKendoGrid.select(currentRow);
                }
                targetKendoGrid.selectEvent.enterKey = false;
              }
            });
          //$('#' + headerId).change();
          /*$('.k-grid-checkbox-header', targetGridElm)
            //css({width: '30px'})
            .show();*/
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:addEnumGrid', {
              targetElm: targetElm,
              dataSource: dataSource,
              title: title,
              valueField: valueField,
              options: options,
            });
          }
          roTaskLib.waitForAngular(function () {
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
            height: 175, // 4 Rows
            //parentId: '7030beac-cbda-9acf-9c51-6832d91650f2', // Locations
            parentId: '6dc39c57-60fd-4c69-e439-01f41037bee2', // Departments
            schema: {
              template: '{Name}',
            },
          });

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var targetParentId = (typeof options.parentId === 'string') ? options.parentId : options.parentId[targetIndex],
                enumGridConfig = {
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
                    model: {
                      id: 'Name',
                    },
                  },
                },
                enumGridConfigId = 'GetListForRequestOffering.' + customLib.createHash(enumGridConfig),
                enumGridDataSource = customLib.api.getDataSource(enumGridConfigId, enumGridConfig);

            if (!_.isUndefined(options.model) && !_.isUndefined(options.model.columns)) {
              for (var i = 0; i < options.model.columns.length; i++) {
                var columnOptions = options.model.columns[i],
                    columnParentId = columnOptions.parentId,
                    columnConfig = {
                      transport: {
                        read: {
                          url: '/api/v3/Enum/GetListForRequestOffering?parentId='+columnParentId+'&itemFilter=',
                          dataType: 'json',
                          contentType: 'application/json; charset=utf-8',
                        },
                        sort: (options.sort) ? {
                            field: options.sort,
                            dir: 'asc',
                          } : {},
                      },
                      schema: {
                        model: {
                          id: 'Name',
                        },
                      },
                    },
                    columnConfigId = 'GetListForRequestOffering.' + customLib.createHash(columnConfig),
                    columnDataSource = customLib.api.getDataSource(columnConfigId, columnConfig);

                columnOptions.dataSource = columnDataSource;
              }
            }

            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('enumGridController:processNext', {
                targetElm: targetElm,
                enumGridConfigId: enumGridConfigId,
                enumGridDataSource: enumGridDataSource,
              });
            }
            var targetInputELm = $(targetElm).find('input[data-control="inlineComboBox"]'),
                dropdownListControl = targetInputELm.data('kendoDropDownList');
            //targetInputELm.addClass('auto-size').attr('rows', targetRows);

            enumGridDataSource.bind('requestEnd', function responseHandler(event) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('GetListForRequestOffering:requestEnd', {
                  id: enumGridConfigId,
                  response: event.response,
                });
              }

              if (!_.isEmpty(event.response)) {
                addEnumGrid(targetElm, enumGridDataSource, event.response);
              } else {
                if (!_.isUndefined(app.custom.utils)) {
                  app.custom.utils.log(2, 'GetListForRequestOffering:requestEnd', 'Warning! Invalid results returned.');
                }
              }
              enumGridDataSource.unbind('requestEnd', responseHandler);
            });
            initFetchDataSource(enumGridDataSource);
          });
        }

        initROTask();
      },
    };

  return definition;
});
