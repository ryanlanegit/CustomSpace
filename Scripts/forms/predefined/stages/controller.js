/* global $, _, app, define, kendo */

/**
 * Work Item History Controller
 * @module historyController
 */
define([
  'text!CustomSpace/Scripts/forms/predefined/history/view.html',
], function (
  historyTemplate
) {
  'use strict';
  /**
   * @exports historyController
   */
  var definition = {
    template: historyTemplate,
    /**
     * Optional build callback type.
     *
     * @callback buildCallback
     * @param {object} historyElm - History Control container element.
     */

    /**
     * Build History Controller.
     *
     * @param {object} vm - View Model to add Control View Model to.
     * @param {object} node - Module configuration.
     * @param {buildCallback} [callback] - Callback function once build is complete.
     */
    build: function (vm, node, callback) {
      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
        app.custom.utils.log('historyController:build', {
          vm: vm,
          node: node,
          callback: callback,
        });
      }
      var historyViewModel;

      // #region Utility functions

      /**
       * Get DropDownList data From View Model Activity objects recursively.
       */
      function getDropDownData() {
        var data = [];
        /**
         * Recursive processing of child Activity objects.
         */
        function getChildren(viewModel, prefix) {
          prefix = prefix || '';
          data.push({
            text: prefix + viewModel.Id + ' - ' + viewModel.Title,
            value: viewModel.BaseId,
          });
          if (typeof viewModel.Activity !== 'undefined' && viewModel.Activity.length > 0) {
            _.each(viewModel.Activity, function (activity) {
              getChildren(activity, prefix + '    ');
            });
          }
        };

        getChildren(vm);

        return data;
      }

      /**
       * Check if provided object is a non-empty array.
       * @returns {boolean} Item is a non-empty array.
       */
      function arrayIsNotNullOrEmpty(item) {
        return (typeof item !== 'undefined' && item.length > 0);
      }

      /**
       * Get current object query's GUID value.
       * @returns {string} Object Id.
       */
      function getObjectQueryId() {
        return historyViewModel.dropdownQuery.value;
      }

      // #endregion Utility functions

      /**
       * Get History Controller Kendo View Model.
       */
      function getHistoryViewModel() {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('historyController:getHistoryViewModel');
        }
        var historyProperties = {
          historyLabel: { type: 'info', text: '' },
          showHistory: false,
          dropdownQuery: {},

          dropDownDataSource: new kendo.data.DataSource({
            data: [{
              text: vm.Id + ' - ' + vm.Title,
              value: vm.BaseId,
            }],
          }),

          timelineDataSource: new kendo.data.DataSource({
            serverFiltering: false,
            transport: {
              read: {
                url: '/Search/GetObjectHistory',
                data: {
                  id: getObjectQueryId,
                },
                dataType: 'json',
                type: 'GET',
              },
            },
            filter: {
              logic: 'or',
              filters: [
                { field: 'RelationshipHistory', operator: arrayIsNotNullOrEmpty},
                { field: 'ClassHistory', operator: arrayIsNotNullOrEmpty},
                { field: 'ActionLogHistory', operator: arrayIsNotNullOrEmpty},
              ],
            },
            /**
             * DataSource requestStart event handler.
             * @see {@link https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/events/requeststart}
             */
            requestStart: function requestStart() {
              historyViewModel.set('historyLabel', { type: 'loading' });
              historyViewModel.set('showHistory', false);
            },
            /**
             * DataSource change event handler.
             * @see {@link https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/events/change}
             *
             * @param {object} data - DataSource read result data..
             */
            change: function change(data) {
              historyViewModel.set('historyLabel', {
                type: 'info',
                text: historyViewModel.dropdownQuery.text,
              });
              historyViewModel.set('showHistory', true);
            },
            /**
             * DataSource error event handler.
             * @see {@link https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/events/error}
             */
            error: function error() {
              historyViewModel.set('historyLabel', { type: 'error' });
            },
          }),

          /**
          * Load object from current History DropDownList value.
          */
          loadHistory: function () {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('historyController:loadHistory');
            }
            var kendoDropDownList = $('#showHistoryDropDown').data('kendoDropDownList'),
            dataItem = kendoDropDownList.dataItem();
            if (dataItem) {
              historyViewModel.getObjectHistory(dataItem);
            }
          },

          /**
           * Get object history from provided dataItem.
           *
           * @param {object} dataItem - DropDownList dataItem to query.
           */
          getObjectHistory: function getObjectHistory(dataItem) {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('historyController:getObjectHistory', {
                dataItem: dataItem,
              });
            }
            var viewModel = this;
            viewModel.set('dropdownQuery', dataItem);
            if(typeof viewModel.historyView === 'undefined') {
              viewModel.historyView = new kendo.View(
                'viewHistoryTemplate',
                {
                  wrap: false,
                  model: viewModel,
                }
              );
              viewModel.historyView.render($('#historyView'));
            } else {
              viewModel.timelineDataSource.read();
            }
          },
        };

        return kendo.observable(historyProperties);
      }

      /**
       * Build the History control and bind it to ViewModel.
       *
       * @param {object} historyViewModel - History Controller Kendo viewModel.
       * @returns {object} Bult History DOM element.
       */
      function buildAndRender(historyViewModel) {
        var builtHistory = _.template(historyTemplate),
            historyElm = $(builtHistory(historyViewModel)),
            historyView = new kendo.View(historyElm, {
              model: historyViewModel,
              wrap: false,
            });

        _.defer(function () {
          historyView.render();

          var historyDropDown = historyElm.find('#showHistoryDropDown').data('kendoDropDownList');

          historyDropDown.bind('select', function (event) {
            var dataItem = this.dataItem(event.item);
            historyViewModel.getObjectHistory(dataItem);
          });

          historyDropDown.bind('open', function (event) {
            historyViewModel.dropDownDataSource.data(getDropDownData());
          });

          historyDropDown.select(0);
        });

        historyViewModel.view = historyView;
        historyViewModel.dropDownDataSource.data(getDropDownData());

        if (typeof callback === 'function') {
          callback(historyElm);
        }

        return historyElm;
      }

      /**
       *  Initialize History controller.
       *
       * @returns {object} Bult History DOM element.
       */
      function initHistory() {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
          app.custom.utils.log('historyController:initHistory');
        }
        vm.view.historyController = historyViewModel = getHistoryViewModel();
        return buildAndRender(historyViewModel);
      }

      return initHistory();
    },
  };

  return definition;
});
