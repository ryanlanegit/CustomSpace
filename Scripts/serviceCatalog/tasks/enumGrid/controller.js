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
              rows = grid.tbody.find('[role="row"]'),
              gridWrapper = e.sender.wrapper,
              gridDataTable = e.sender.table,
              gridDataArea = gridDataTable.closest('.k-grid-content');

          // Add Click Anywhere To Rows
          //rows.unbind('click');
          //rows.on('click', onClick);

          // Toggle scrollbar
          gridWrapper.toggleClass('no-scrollbar', gridDataTable[0].offsetHeight < gridDataArea[0].offsetHeight);
        }

        /**
         *  Row Click Handler To Toggle Checkbox
         */
        function onClick(e) {
          if ($(e.target).hasClass('k-checkbox-label')) {
            return;
          }
          var row = $(e.target).closest('tr'),
              checkboxElm = $(row).find('.k-checkbox');

          checkboxElm.prop('checked', row.has('k-state-selected'));
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
              footerId = app.lib.newGUID();
          //var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          var targetGridElm = $('<div/>', {
            id: 'grid' + targetInputELm.attr('id'),
          });

          // Hide Input Field
          targetInputELm.hide();
          // Append Checkbox Grid Input
          targetInputELm.after(targetGridElm);
          var kendoGridViewModel = {
            dataSource: dataSource,
            dataBound: onDataBound,
            height: options.height,
            navigatable: true,
            selectable: 'multiple, row',
            sortable: true,
            //selectable: 'multiple,row',
            persistSelection: true,
            columns: [ {
                sortable: false,
                hidden: true,
                width: '40px' ,
                attributes: {
                  class: 'k-grid-checkbox',
                },
                headerAttributes: {
                  class: 'k-grid-checkbox-header',
                },
                field: valueField,
                title: title,
                headerTemplate: '<input id="' + headerId + '" class="k-checkbox header-checkbox" type="checkbox"><label class="k-checkbox-label label-middle-align checkbox-inline checkbox-label" for="' + headerId +'"><span>&\#8203;</span></label>',
                //template: '<label class="k-checkbox-label k-no-text"></label>',
                //template: '<input class="k-checkbox" data-role="checkbox" aria-label="Select row" aria-checked="false" type="checkbox"><label class="k-checkbox-label"><span>#: ' + valueField + ' #</span></label>',
              },
              {
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
                field: valueField,
                title: title,
                //headerTemplate: '<input id="' + headerId + '" class="k-checkbox header-checkbox" type="checkbox"><label class="k-checkbox-label label-middle-align checkbox-inline checkbox-label" for="' + headerId +'"><span>' + title + '</span></label>',
                //template: '<label class="k-checkbox-label k-no-text"></label>',
                template: '<input class="k-checkbox" data-role="checkbox" aria-label="Select row" aria-checked="false" type="checkbox"><label class="k-checkbox-label label-middle-align checkbox-inline"><span>#: ' + valueField + ' #</span></label>',
                //footerTemplate: '<div id="' + footerId + '"></div>',
              },
            ],
            /**
             * Grid Change Handler
             */
            change: function(e) {
              if (_.isUndefined(this.changePrevented) || !this.changePrevented) {
                var selectedRows = this.select(),
                    selectedValues = [],
                    sortedValues = [],
                    sourceData = _.pluck(this.dataSource.data(), 'Name'),
                    dataItems = this.dataItems();
                if (true) {// (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('enumGridController:change', {
                    event: e,
                    selectedRows: selectedRows,
                    sourceData: sourceData,
                    selectedRowElm: selectedRowElm,
                    selectedDataItem: selectedDataItem,
                  });
                }

                // Bypass custom selection behavior on click on manual events
                if (!this.selectEvent.selectAll && !this.selectEvent.enterKey) {
                  var selectedUIDs = _.chain(dataItems)
                        .where({selected: true})
                        .pluck('uid')
                        .value(),
                      gridRowElms = this.table.find('tr'),
                      activeGridRowElms = [],
                      selectedGridRowElms = _.filter(gridRowElms, function (gridRowElm) {
                        return _.contains(selectedUIDs, gridRowElm.getAttribute('data-uid'));
                      }),
                      selectedRowElm = $(this.current()).closest('tr'),
                      selectedDataItem = this.dataItem(selectedRowElm);

                  this.changePrevented = true;
                  if(!this.selectEvent.ctrlKey && !this.selectEvent.shiftKey) {
                    if (selectedRows.length === 1 && !_.isUndefined(selectedDataItem.selected) && selectedDataItem.selected) {
                      // toggle selection
                      if (!_.isUndefined(selectedDataItem.selected) && selectedDataItem.selected) {
                        targetKendoGrid.clearSelection();
                        activeGridRowElms = _.without(selectedGridRowElms, selectedRowElm.get(0));
                        targetKendoGrid.select(activeGridRowElms);
                      }
                    } else {
                      activeGridRowElms = _.difference(selectedGridRowElms, selectedRows.toArray());
                      targetKendoGrid.select(activeGridRowElms);
                    }
                  } else if (this.selectEvent.shiftKey) {
                    activeGridRowElms = _.difference(selectedGridRowElms, selectedRows.toArray());
                    targetKendoGrid.select(activeGridRowElms);
                  }
                  this.changePrevented = false;
                }

                for (var i = 0; i < dataItems.length; i++) {
                  var dataItemRowElm = this.table.find('tr[data-uid="' + dataItems[i].uid + '"]');
                  dataItems[i].selected = dataItemRowElm.hasClass('k-state-selected');
                }

                selectedValues = _.chain(dataItems)
                  .where({selected:true})
                  .pluck('Name')
                  .value();

                // Set header checkbox (un)checked if all items are selected
                $('#' + headerId).prop('checked', (selectedValues.length === dataItems.length))
                // Sort selected values to match original dataset
                sortedValues = _.intersection(sourceData, selectedValues).join('\n');
                // Set Footer summary
                $('#' + footerId).html(selectedValues.length + '/' + dataItems.length);
                // Update Original Field value
                updateTextAreaValue(targetElm, sortedValues);
              }
            },
          }

          if (!_.isUndefined(options.model)) {
            if (!_.isUndefined(options.model.columns)) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:build:extendmodel', {
                  kendoGridViewModel: kendoGridViewModel,
                  model: options.model,
                });
              }
              kendoGridViewModel.columns = kendoGridViewModel.columns.concat(options.model.columns);
            }
          }
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:build', {
              kendoGridViewModel: kendoGridViewModel,
            });
          }
          var targetKendoGrid = targetGridElm.kendoGrid(kendoGridViewModel).data('kendoGrid');
          targetKendoGrid.selectEvent = {
            selectAll: false,
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
            enterKey: false,
          };
          targetKendoGrid.thead.on('click', '.k-grid-checkbox-header .k-checkbox', function (e) {
            if (e.type === 'click' || e.keyCode === 13) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:click', {
                  e: e,
                  this: this,
                  checked: this.checked,
                });
              }
              targetKendoGrid.selectEvent.selectAll = true;
              if ($(this).prop('checked')) {
                var gridRowElms = targetKendoGrid.table.find('tr');
                targetKendoGrid.select(gridRowElms)
              } else {
                targetKendoGrid.clearSelection();
              }
              targetKendoGrid.selectEvent.selectAll = false;
            }
          });/*
          targetKendoGrid.thead.on('keydown', function (e) {
            console.log('header check!', {
              e: e,
              this: this,
            });
            if (e.keyCode === 13) {
              console.log('header enter check!', {
                e: e,
                this: this,
              });
              targetKendoGrid.selectEvent.selectAll = true;
              if ($(this).find('.k-checkbox').prop('checked')) {
                $(this).find('.k-checkbox').prop('checked', false);
                targetKendoGrid.clearSelection();
              } else {
                $(this).find('.k-checkbox').prop('checked', true);
                var gridRowElms = targetKendoGrid.table.find('tr');
                targetKendoGrid.select(gridRowElms)
              }
              targetKendoGrid.selectEvent.selectAll = false;
            }
          });*/

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
          $('#' + headerId).change();
          $('.k-grid-checkbox-header', targetGridElm)
            //css({width: '30px'})
            .show();
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:addEnumGrid', {
              targetElm: targetElm,
              dataSource: dataSource,
              title: title,
              valueField: valueField,
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
                  /*schema: {
                    /**
                     * Adapte Enum List to Use With MultiSelect
                     *
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
                        }*
                        el.Details = (flag) ? array.join(", ") : "";
                        return el;
                      });
                      return response;
                    },
                    //total: "Total",
                    //errors: "Errors"
                  },*/
                },
                enumGridConfigId = 'GetListForRequestOffering.' + customLib.createHash(enumGridConfig),
                enumGridDataSource = customLib.api.getDataSource(enumGridConfigId, enumGridConfig);

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
