/*jslint nomen: true */
/*global _, $, app, console, define, kendo */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }], comma-dangle: ["error", "always-multiline"] */

/**
history
**/

define([
  'text!CustomSpace/Scripts/forms/predefined/history/view.html',
], function (
  historyTemplate
) {
  'use strict';
  var definition = {
    template: historyTemplate,
    build: function (vm, node, callback) {
      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
        console.log('historyController:build', {
          vm: vm,
          node: node,
          callback: callback,
        });
      }

      vm.setWithNoDirty = function (variable, value) {
        var isDirtyState = vm.get('isDirty');
        vm.set(variable, value);
        vm.set('isDirty', isDirtyState);
      };

      /*
      if (!_.isUndefined(pageForm.newWI)) { vm.set('HistoryButton', !pageForm.newWI); } //workitem
      if (!_.isUndefined(pageForm.isNew)) { vm.set('HistoryButton', !pageForm.isNew); } //AM
      */

      vm.view.historyController = {
        loadHistory: function () {
          var kendoDropDownList = $('#showHistoryDropDown').data('kendoDropDownList');
          vm.view.historyController.getObjectHistory(kendoDropDownList.value(), kendoDropDownList.text());
        },

        dropDownDataSet: false,

        getDropDownDataSource: function () {
          var data = [],
            getChildren = function (viewModel, prefix) {
              prefix = prefix || '';
              data.push({
                text: prefix + viewModel.Id + ' - ' + viewModel.Title,
                value: viewModel.BaseId,
              });
              if (viewModel.Activity !== undefined && viewModel.Activity.length > 0) {
                $.each(viewModel.Activity, function (Key, activity) {
                  getChildren(activity, prefix + '  ');
                });
              }
            };

          getChildren(vm);

          return data;
        },

        getObjectHistory: function (objectGUID, objectTitle) {
          vm.setWithNoDirty('historyLabel', { type: 'loading' });
          vm.setWithNoDirty('showHistory', false);

          $.ajax({
            url: '/Search/GetObjectHistory',
            data: { id: objectGUID },
            type: 'GET',
            cache: false,
            success: function (data) {
              vm.setWithNoDirty('historyLabel', { type: 'info', text: objectTitle });

              /*
              if(vm.view.historyController.model !== undefined) {
                vm.view.historyController.view.destroy();
              }*/

              try {
                if (vm.view.historyController.model === undefined) {
                  var customhistoryModel = kendo.observable({
                    nodes: data,
                  });

                  vm.view.historyController.model = customhistoryModel;

                  vm.view.historyController.view = new kendo.View(
                    'viewHistoryTemplate',
                    {
                      model: customhistoryModel,
                      wrap: false,
                      init: $.noop, //empty function
                    }
                  );

                  vm.view.historyController.view.render($('#historyView'));
                } else {
                  vm.view.historyController.model.set('nodes', data);
                }
              } catch (err) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
                  console.log('historyController:error', {
                    'err': err,
                  });
                }
              }

              vm.setWithNoDirty('showHistory', true);
            },
            error: function (data) {
              vm.setWithNoDirty('historyLabel', { type: 'error' });
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
                console.log('historyController:error', {
                  err: data,
                });
              }
            },
          });
        },
      };

      function buildAndRender() {
        var builtHistory = _.template(historyTemplate),
          historyElm = $(builtHistory(node));

        historyElm.find('#showHistoryDropDown').kendoDropDownList({
          dataSource: [{
            text: vm.Id + ' - ' + vm.Title,
            value: vm.BaseId,
          }],
          select: function (event) {
            var dataItem = this.dataItem(event.item);
            vm.view.historyController.getObjectHistory(dataItem.value, dataItem.text);
          },
          open: function (event) {
            if (!vm.view.historyController.dataSourceSet) {
              event.sender.setDataSource(vm.view.historyController.getDropDownDataSource());
              vm.view.historyController.dataSourceSet = true;
            }
          },
        }).data('kendoDropDownList');

        if (typeof callback === 'function') {
          callback(historyElm);
        }
      }

      function initHistory() {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('debug')) {
          console.log('historyController:initHistory');
        }
        vm.setWithNoDirty('historyLabel', { type: 'info', text: '' });
        buildAndRender();
      }

      initHistory();
    },
  };

  return definition;
});
