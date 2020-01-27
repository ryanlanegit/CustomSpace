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
         * @param {String|Object} value
         * - (String) New textarea text value.
         * - (Object) GridWidget to format text value from.
         */
        function updateTextAreaValue(targetElm, value) {
          var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          roTaskLib.waitForAngular(function () {
            //var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            //if (_.isEmpty(currentValue)) {
            if (typeof value === 'object' || value instanceof Object) {
              value = getFormattedText(value);
            }
            $(textareaElm)
              .val(value)
              .trigger('onkeyup')
              .trigger('keyup')
            //}
          });
        }

        /**
         * Resize if grid has a set height but content height has not been set
         */
        function autoResizeGridWidget(gridWidget) {
          if (
            !_.isUndefined(gridWidget.element.attr('style')) &&
            gridWidget.element.attr('style').indexOf('height') !== -1 &&
            (
              _.isUndefined(gridWidget.content.attr('style')) ||
              (
                !_.isUndefined(gridWidget.content.attr('style')) &&
                gridWidget.content.attr('style').indexOf('height') === -1
              )
            )
          ) {
            gridWidget.resize();
          }
        }

        /**
         *  Add Click Anywhere To (Un)Select Checkbox
         * Toggle Scrollbar based on Grid height
         * https://docs.telerik.com/kendo-ui/knowledge-base/hide-scrollbar-when-not-needed
         */
        function onDataBound(e) {
          var gridWidget = e.sender,
              rowElms = gridWidget.items();

          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:onDataBound', {
              event: e,
              gridWidget: gridWidget,
              rowElms: rowElms,
            });
          }

          /* Toggle scrollbar
          var gridDataTable = gridWidget.table,
              gridDataArea = gridDataTable.closest('.k-grid-content');
          gridWrapper.toggleClass('no-scrollbar', gridDataTable[0].offsetHeight < gridDataArea[0].offsetHeight);
          */
          // Resize if grid has a set height but content height has not been set
          autoResizeGridWidget(gridWidget);

          // Remove Cireson Padding-Right from header
          gridWidget.wrapper.children('.k-grid-header').css('padding-right', 'inherit')

          // Add DropDownLists
          _.each(gridWidget.columns, function(column) {
            if (!_.isUndefined(column.dataSource)) {
              rowElms.each(function() {
                var row = $(this),
                    dataItem = gridWidget.dataItem(row),
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
                     * DropDownList Change Handler
                     * - Update DataItem object without triggering onDataBound event.
                     * - Manually trigger change event.
                     * @param {Object} e - Kendo DropDownList Change event object.
                     */
                    change: function (e) {
                      gridWidget.onChangeIgnoreSelect = true;
                      gridWidget.onChangeUpdateTextArea = true;
                      dataItem[column.field] = e.sender.value();
                      dropdownElm.attr('data-default-value', e.sender.value());
                      gridWidget.trigger('change');
                      gridWidget.onChangeIgnoreSelect = false;
                      gridWidget.onChangeUpdateTextArea = false;
                    },
                  });

                dropdownElm.closest('.k-dropdown').on('click', function (e) {
                  e.stopPropagation();
                  return false;
                });
              });
            }
          });

          updateGridWidgetDataItems(gridWidget);
          updateTextAreaValue(gridWidget.element.parent(), gridWidget);
        }

        /**
         * - Set Select All Checkbox checked status and title text
         */
        function onCheckboxChange(gridWidget, headerId) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:onCheckboxChange', {
              gridWidget: gridWidget,
              headerId: headerId,
            });
          }
          var dataItems = gridWidget.dataItems(),
              everyDataItemSelected = _.every(dataItems, function (dataItem) { return dataItem.selected }),
              checkboxElm = gridWidget.thead.find('#' + headerId),
              checkboxLabelElm =  gridWidget.thead.find('label[for="' + headerId + '"]');

          checkboxElm.prop('checked', everyDataItemSelected);
          checkboxLabelElm.prop('title', everyDataItemSelected ? 'Unselect All' : 'Select All');

          // Reset Kendo Grid Validation if 0 rows are selected.
          /*if (selectedDataItems.length === 0) {
          updateTextAreaValue(gridWidget.element.parent(), '');
          }*/
        }

       /**
        * Update the selected value of DataItems based on their selected status
        */
       function updateGridWidgetDataItems(gridWidget) {
         if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
           app.custom.utils.log('enumGridController:updateGridWidgetDataItems', {
             gridWidget: gridWidget,
           });
         }
         var dataItems = gridWidget.dataItems(),
             selectedIds = _.map(gridWidget.select(), function (selectedElm) {
               return selectedElm.getAttribute('data-uid');
             });
         // Set all dataitems selected value to match current Selected status
         _.each(dataItems, function(dataItem) {
           if (selectedIds.length > 0) {
             var selectedIndex = _.indexOf(selectedIds, dataItem.uid);
             dataItem.selected = selectedIndex !== -1;
             if (selectedIndex !== -1) {
               selectedIds.splice(selectedIndex, 1);
             }
           } else {
             dataItem.selected = false;
           }
         });
       }

       /**
        *
        */
       function getFormattedText(gridWidget) {
         var formattedResult = '',
             dataItems = gridWidget.dataItems(),
             sourceDataItems = gridWidget.dataSource.data(),
             outputDataItems = [];
         switch (options.schema.output) {
           case 'all':
             outputDataItems = dataItems;
             break;
           case 'selected':
           default:
             // Get currently Selected rows after Change event handler and then
             // get selected uid values from the Selected rows
             _.each(gridWidget.select(), function(selectedRowElm) {
                 var dataItem = gridWidget.dataItem(selectedRowElm);
                 outputDataItems.push(dataItem);
             });
             break;
         }

         if (outputDataItems.length > 0) {
           var formattedResults = [],
               compiled = _.template(options.schema.template);

           _.chain(sourceDataItems)
            // Sort selected uids to match original dataset
            .intersection(outputDataItems)
            // Push compiled template result to formatted results array
            .each(function(dataItem) {
               formattedResults.push(compiled(dataItem));
             });

           formattedResult = formattedResults.join('\n');
         }

         if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
           app.custom.utils.log('enumGridController:getFormattedText', {
             gridWidget: gridWidget,
             dataItems: dataItems,
             sourceDataItems: sourceDataItems,
             outputDataItems: outputDataItems,
             formattedResult: formattedResult,
           });
         }
         return formattedResult;
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
          targetInputELm.addClass('k-enum-grid-input');
          // Set Input text to '' to register Kendo Validator events
          updateTextAreaValue(targetElm, '');
          // Append Checkbox Grid Input
          targetInputELm.after(targetGridElm);
          var kendoGridViewModel = {
            dataSource: dataSource,
            dataBound: onDataBound,
            navigatable: true,
            selectable: options.selectable,
            sortable: true,
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
                class: 'k-grid-checkbox' + ((options.selectable === 'multiple, row') ? '' : ' k-grid-radio'),
              },
              headerAttributes: {
                class: 'k-grid-checkbox-header' + ((options.selectable === 'multiple, row') ? '' : ' k-grid-radio'),
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
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:change:begin', {
                  event: e,
                  this: this,
                  onChangeIgnoreSelect: this.onChangeIgnoreSelect,
                  onChangeUpdateTextArea: this.onChangeUpdateTextArea,
                });
              }
              if (_.isUndefined(this.onChangeIgnoreSelect) || !this.onChangeIgnoreSelect) {
                var selectedRowElms = this.select().toArray(),
                    dataItems = this.dataItems();
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('enumGridController:change:process', {
                    event: e,
                    selectedRowElms: selectedRowElms,
                    dataItems: dataItems,
                  });
                }
                // Update GridWidget Data Items
                updateGridWidgetDataItems(this);
                // Update Checkbox and Select Status
                onCheckboxChange(this, headerId);

                // Set Footer summary
                //$('#' + footerId).html(selectedUIDs.length + '/' + dataItems.length);
                // Update Original Field value
                updateTextAreaValue(targetElm, this);
              } else if (!_.isUndefined(this.onChangeUpdateTextArea) && this.onChangeUpdateTextArea) {
                updateTextAreaValue(targetElm, this);
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

              kendoGridViewModel.columns = kendoGridViewModel.columns.concat(options.model.columns);
            }
          }
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('enumGridController:build', {
              kendoGridViewModel: kendoGridViewModel,
            });
          }
          var gridWidget = targetGridElm.kendoGrid(kendoGridViewModel).data('kendoGrid');
          /**
           * Set default click events for use with the Click handlers and Change event
           */
          gridWidget.selectEvent = {
            selectAll: false,
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
            enterKey: false,
          };

          /**
           * Bypass custom selection behavior on:
           * - manual events (select all or keyboard enter)
           * - init selection
           * - selection after hiding/showing
           */
          function onSelectableChange(e) {
            var dataItems = gridWidget.dataItems(),
                items = gridWidget.items(),
                selectedItems = gridWidget.select();

            if(!gridWidget.selectEvent.ctrlKey && !gridWidget.selectEvent.shiftKey) {
              if (selectedItems.length === 1) {
                // Do not attempt to disable if active is not a gridcell
                if (gridWidget.current().attr('role') === 'gridcell') {
                  var selectedDataItem = gridWidget.dataItem(selectedItems);
                  // disable selection if currently selected
                  if (!_.isUndefined(selectedDataItem.selected) && selectedDataItem.selected) {
                    selectedItems.removeClass('k-state-selected');
                    selectedDataItem.selected = false;
                  }
                }
              }
            }
            if(!gridWidget.selectEvent.ctrlKey && gridWidget.options.selectable === 'multiple, row') {
              var persistentSelectedIds = _.chain(dataItems)
                    .where({selected: true})
                    .pluck('uid')
                    .value();
              // Filter Selected Rows from persistent selection list
              selectedItems.each(function() {
                  var dataItem = gridWidget.dataItem(this),
                      selectedIndex = _.indexOf(persistentSelectedIds, dataItem.uid);
                  //dataItem.selected = true; //selectedIndex !== -1;
                  if (selectedIndex !== -1) {
                    persistentSelectedIds.splice(selectedIndex, 1);
                  }
              })

              // Create collection from remaining persistent selections
              var persistentItems = $([]);
              items.each(function () {
                if (persistentSelectedIds.length === 0) {
                  return false;
                }
                var itemId = this.getAttribute('data-uid'),
                    selectedIndex = _.indexOf(persistentSelectedIds, itemId);
                //dataItem.selected = selectedIndex !== -1;
                if (selectedIndex !== -1) {
                  persistentItems.push(this);
                  persistentSelectedIds.splice(selectedIndex, 1);
                }
              });
              persistentItems.addClass('k-state-selected');
            }
          }
          gridWidget.selectable._events['change'].unshift(onSelectableChange);

          /**
           * Add Show/Hide watcher to:
           * - Set Select All Checkbox checked status and title text
           * - Set DataItems Selection
           */
         if (!_.isNull(targetElm.getAttribute('ng-show'))) {
           roTaskLib.waitForAngular(function () {
             var $scope = angular.element(targetElm).scope(),
                 ngShowAttr = targetElm.getAttribute('ng-show');
              $scope.$watch(ngShowAttr, function (value){
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('enumGridController:onHide', {
                    this: this,
                    targetElm: targetElm,
                    ngShowAttr: ngShowAttr,
                    value: value,
                  });
                }

                updateGridWidgetDataItems(gridWidget);
                onCheckboxChange(gridWidget, headerId);
                if (value === true) {
                  // Set TextArea value to reset Angular validation
                  updateTextAreaValue(targetElm, gridWidget);
                  // Resize if grid has a set height but content height has not been set
                  _.defer(function(){
                    autoResizeGridWidget(gridWidget);
                  });
                }
              });
            });
          }

          /**
           * Select ALl checkbox click handler
           */
          gridWidget.thead.find('.k-grid-checkbox-header .k-checkbox-label').on('click', function (e) {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('enumGridController:click', {
                e: e,
                this: this,
                checked: $('#' + $(this).prop('for')).prop('checked'),
              });
            }

            gridWidget.selectEvent.selectAll = true;
            if ($('#' + $(this).prop('for')).prop('checked')) {
              gridWidget.clearSelection();
            } else {
              var gridRowElms = gridWidget.items();
              gridWidget.select(gridRowElms);
            }
            gridWidget.selectEvent.selectAll = false;
            e.stopPropagation();
            return false;
          });


          gridWidget.table
            /**
             * Click and Drag key modifier listener
             */
            .on('click mousedown', 'td', function (e) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('enumGridController:click', e);
              }
              _.extend(gridWidget.selectEvent, {
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
              });
            })
            /**
             * Keyboard navigation listener
             */
            .on('keydown', function (e) {
              //console.log('keydown!', e, this);
              if (e.keyCode === 13) {//} && e.shiftKey) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('enumGridController:keydown', {
                    gridWidget: gridWidget,
                    currentSelection: gridWidget.current(),
                    currentRow: $(gridWidget.current()).closest('tr'),
                  });
                }
                var currentRow = $(gridWidget.current()).closest('tr'),
                    selectedRows = gridWidget.select();
                gridWidget.selectEvent.enterKey = true;
                if (currentRow.hasClass('k-state-selected')) {
                  // toggle selection
                  gridWidget.clearSelection();
                  var activeRowElms = _.without(selectedRows, currentRow.get(0))
                  gridWidget.select(activeRowElms);
                } else {
                  // select row
                  gridWidget.select(currentRow);
                }
                gridWidget.selectEvent.enterKey = false;
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
            selectable: 'multiple, row',
            schema: {
              template: '<%= Name %>',
              output: 'selected', // selected, all
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
              _.each(options.model.columns, function(columnOptions) {
                if (!_.isUndefined(columnOptions.parentId)) {
                  var columnParentId = columnOptions.parentId,
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
              });
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
