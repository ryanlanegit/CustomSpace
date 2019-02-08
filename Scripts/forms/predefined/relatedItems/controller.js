/*global _, $, app, console, define, kendo, localization, performance, session */
/*eslint  "comma-dangle": ["off", "always-multiline"] */

/**
relatedItems
**/

define([
  'text!forms/predefined/relatedItems/view.html',
  'forms/popups/multipleObjectPickerPopup/controller',
], function (
  tpl,
  objectPickerPopup
) {
    'use strict';
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            var properties = {
                Disabled: !_.isUndefined(node.disabled) ? node.disabled : false
            };

            $.extend(true, properties, node);

            var view = new kendo.View();

            var cur_table = false;

            //use setters and getters if you want vm boundOdj to trigger change
            if (_.isUndefined(vm.RelatesToConfigItem)) {
                vm.set('RelatesToConfigItem', new kendo.data.ObservableArray([]));
            }
            var boundArray = vm.get('RelatesToConfigItem');

            vm.view.relatedItemController = new kendo.observable({
                addConfigItem: function (e) {
                    if (!_.isUndefined(this.selectedConfigItemId)) {
                        addAffectedItem(this.selectedConfigItemId);
                    }
                },
                searchConfigItem: function() {
                    var popupWindow = objectPickerPopup.getPopup("62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC", "DisplayName,Path,Status", null, null, true);
                    popupWindow.setSaveCallback(function(object) {
                        addAffectedItem(object.BaseId);
                    });
                    popupWindow.open();
                },
                selectedConfigItemId: "",
                selectedConfigItem: "",
                configItemDataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: {
                            url: function (data) {
                                var configItem = (data.filter.filters.length > 0) ? data.filter.filters[0].value : "";
                                return "/api/V3/Config/GetAffectedItemsList?itemFilter=" + configItem;
                            },
                            dataType: "json"
                        }
                    }
                }),
                onConfigItemChange: function(e) {
                    var dataItem = e.sender.dataItem(e.sender.selectedIndex);
                    if (!_.isUndefined(dataItem))
                        this.selectedConfigItemId = dataItem.Id;
                },
                isUserCIVisible: !_.isUndefined(vm.RequestedWorkItem) ? true : false,
                selectedUserConfigItemId: "",
                selectedUserConfigItem: "",
                addUserConfigItem: function(e) {
                    if (!_.isUndefined(this.selectedUserConfigItemId)) {
                        addAffectedItem(this.selectedUserConfigItemId);
                    }
                },
                userConfigItemDataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: {
                            url: "/ConfigItems/GetAffectedUserConfigItemsList",
                            data: { affectedUserId: function() { return !_.isUndefined(vm.RequestedWorkItem) && !_.isNull(vm.RequestedWorkItem.BaseId) ? vm.RequestedWorkItem.BaseId : "" } },
                            dataType: "json",
                            type: "GET"
                        },
                        parameterMap: function (data) {
                            var searchFilter = (data.filter && data.filter.filters.length > 0) ? data.filter.filters[0].value : "";
                            return _.extend(data, { searchFilter: searchFilter });
                        }
                    }
                }),
                onUserConfigItemChange: function(e) {
                    var dataItem = e.sender.dataItem(e.sender.selectedIndex);
                    if (!_.isUndefined(dataItem))
                        this.selectedUserConfigItemId = dataItem.Id;
                },
                dataSource: new kendo.data.DataSource({
                    schema: {
                        data: "Data",
                        total: "Total",
                        errors: "Errors",
                        model: {
                            id: "BaseId",
                        }
                    },
                    data: {
                        Data: boundArray,
                        Total: boundArray.length
                    }
                }),
                showMoreInfo: function (e) {
                    var detailsPopupEle = $("<div>");
                    detailsPopupEle.appendTo("body");

                    var detailsPopup = detailsPopupEle.kendoCiresonWindow({
                        title: "",
                        width: 550,
                        height: 500,
                        actions: ["Close"]
                    }).data("kendoWindow");

                    var baseId = null;
                    var displayName = "";
                    if (e.data == null && e.BaseId != null) {
                        baseId = e.BaseId;
                        displayName = e.DisplayName;
                    } else {
                        baseId = e.data.BaseId;
                        displayName = e.data.DisplayName;
                    }

                    detailsPopup.refresh({
                        url: "/Search/ObjectViewer",
                        data: { id: baseId }
                    });
                    detailsPopupEle.find(".k-content").html("<div style='padding: 55px'>Loading...</div>");
                    detailsPopup.title(displayName).center().open();
                },
                onDataBinding: function (e) {
                    cur_table = e.sender.table;
                    _.each(boundArray, function(item) {
                        item.AssetStatus = !_.isUndefined(item.AssetStatus) ? item.AssetStatus : { Id: null, Name: null };
                        item.Status = !_.isUndefined(item.Status) ? item.Status : { Id: null, Name: null };
                    });
                },
                isDesktopView: !app.isMobileDevice(),
                isMobileView: app.isMobileDevice(),
                isEnabled: !properties.Disabled,
                isConfigItemWindowsComputer: function isConfigItemWindowsComputer(viewModel) {
                  return $.ajax({
                    type: 'GET',
                    async: true,
                    url: '/ConfigItems/IsComputer',
                    data: {
                        objectId: viewModel.BaseId,
                    },
                    success: function (result) {
                      if (typeof viewModel._isWindowsComputer === 'undefined') {
                        Object.defineProperty(
                          viewModel,
                          '_isWindowsComputer', {
                            enumerable: false,
                            writable: true,
                            value: null,
                          }
                        );
                      }
                      viewModel.set('_isWindowsComputer', (result.toLowerCase() === 'true'));
                    },
                  });
                },
                isConfigItemUser: function isConfigItemUser(viewModel) {
                  return $.ajax({
                    type: 'GET',
                    async: true,
                    url: '/Search/GetObjectProperties',
                    data: {
                        id: viewModel.BaseId,
        						},
                    success: function (result) {
                      if (typeof viewModel._isUser === 'undefined') {
                        Object.defineProperty(
                          viewModel,
                          '_isUser', {
                            enumerable: false,
                            writable: true,
                            value: null,
                          }
                        );
                      }
                      viewModel.set('_isUser', (result.IsUser === true));
                    },
                  });
                },
                isMoreInfo: function isMoreInfo(viewModel) {
                    if (typeof viewModel._isSlideOut === 'undefined') {
                      Object.defineProperty(
                        viewModel,
                        '_isSlideOut', {
                          enumerable: false,
                          writable: true,
                          value: false,
                        }
                      );
                      vm.view.relatedItemController.isSlideOut(viewModel);
                    }
                    return !viewModel._isSlideOut;
                },
                isSlideOut: function isSlideOut(viewModel) {
                    if (typeof viewModel._isSlideOut === 'undefined') {
                      Object.defineProperty(
                        viewModel,
                        '_isSlideOut', {
                          enumerable: false,
                          writable: true,
                          value: false,
                        }
                      );
                      vm.view.relatedItemController.isSlideOutAsync(viewModel);
                    }
                    return viewModel._isSlideOut;
                },
                isSlideOutAsync: function isSlideOutAsync(viewModel) {
                  // Get IsUser Result
                  vm.view.relatedItemController.isConfigItemUser(viewModel).always(function(){
                    // Set Default IsWindowsComputer Result
                    if (typeof viewModel._isWindowsComputer === 'undefined') {
                      Object.defineProperty(
                        viewModel,
                        '_isWindowsComputer', {
                          enumerable: false,
                          writable: true,
                          value: false,
                        }
                      );
                    }
                    var bIsUser = viewModel._isUser,
                        bIsWindowsComputer = viewModel._isWindowsComputer,
                        hasControlCenterURL = !_.isNull(session.consoleSetting.TrueControlCenterURL) && (session.consoleSetting.TrueControlCenterURL != '');

                    if (bIsUser) {
                      var bisSlideOut = ((bIsWindowsComputer || bIsUser) && hasControlCenterURL) ? true : false;
                      viewModel.set('_isSlideOut', bisSlideOut);
                    } else {
                      // If ConfigItem is not a user then check if it is a computer
                      // Get IsWindowsComputer Result
                      vm.view.relatedItemController.isConfigItemWindowsComputer(viewModel).always(function () {
                        bIsWindowsComputer = viewModel._isWindowsComputer;
                        var bisSlideOut = ((bIsWindowsComputer || bIsUser) && hasControlCenterURL) ? true : false;
                        viewModel.set('_isSlideOut', bisSlideOut);
                      });
                    }
                  })
                },
                showTCCInfo: function (dataItem) {
                    var src = session.consoleSetting.TrueControlCenterURL;
                    var bIsWindowsComputer = dataItem._isWindowsComputer;
                    var bIsUser = dataItem._isUser;
                    var tooltip = localization.ComputerManagement;

                    if (bIsWindowsComputer) {
                        src = app.slideOutNav.getTCCSourceURL(dataItem, "computer");
                    } else if (bIsUser) {
                        src = app.slideOutNav.getTCCSourceURL(dataItem, "user");
                        tooltip = localization.UserManagement;
                    }

                    var options = {
                        url: src,
                        tooltip: tooltip
                    }
                    app.slideOutNav.show(options);
                },
                onContextmenuSelect: function (e) {
                  var type = e.item.attributes["custom"].value,
                      baseId = e.target.attributes["data-base-id"].value,
                      dataItem =_.find(e.data.RelatesToConfigItem, function (item) { return item.BaseId==baseId; });

                  (type == "slideout") ? vm.view.relatedItemController.showTCCInfo(dataItem) : vm.view.relatedItemController.showMoreInfo(dataItem);
                },
                onContextmenuActivate: function (e) {
                  var baseId = e.target.attributes["data-base-id"].value,
                      dataItem =_.find(e.data.RelatesToConfigItem, function (item) { return item.BaseId === baseId; }),
                      managementTitle = localization.UserManagement;

                  function createContextMenu() {
                    var menuItems = [{
                        text: managementTitle,
                        imageUrl: '/Content/Images/Icons/Other/control-center-launcher.png',
                        imageAttr: {
                          height: '16px',
                          width: '16px',
                        },
                        attr: {
                          custom: 'slideout', //custom attribute holds the link type
                        },
                      },
                      {
                        text: "<i class='fa fa-info-circle cursor-pointer'></i>" + localization.AdditionalDetails,
                        encoded: false,
                        attr: {
                          custom: 'info', //custom attribute holds the link type
                        },
                    }];

                    var contextmenu = $("#tccmenu-related-ci").data("kendoContextMenu");
                    contextmenu.setOptions({
                      dataSource: menuItems,
                    });
                  }

                  // Get IsUser Result
                  vm.view.relatedItemController.isConfigItemUser(dataItem).always(function(){
                    if (dataItem._isUser) {
                      createContextMenu();
                    } else {
                      vm.view.relatedItemController.isConfigItemWindowsComputer(dataItem).always(function () {
                        if (dataItem._isWindowsComputer) {
                          managementTitle = localization.ComputerManagement;
                        }
                        createContextMenu();
                      });
                    }
                  });
                },
            });

            var grid = vm.view.relatedItemController;

            grid.dataSource.originalFilter = grid.dataSource.filter;

            // Replace the original filter function.
            grid.dataSource.filter = function () {

                // Call the original filter function.
                var result = grid.dataSource.originalFilter.apply(this, arguments);

                // If a column is about to be filtered, then raise a new "filtering" event.
                if (arguments.length > 0) {
                    this.trigger("filterApplied", arguments);
                }

                return result;
            }

            grid.dataSource.bind("filterApplied", function (e) {

                $.each($(cur_table).find("th a.k-header-column-menu i"), function () {
                    $(this).remove();
                });

                if (grid.dataSource.filter()) {

                    var filters = grid.dataSource.filter().filters || [];
                    var dsFilters = [];
                    for (var i in filters) {
                        if (filters[i].filters) {
                            var innerFilters = filters[i].filters;
                            for (var x in innerFilters) {
                                dsFilters.push(innerFilters[x]);
                            }
                        } else {
                            dsFilters.push(filters[i]);
                        }
                    }

                    dsFilters = _.uniq(dsFilters, function(el) { return el.field; });

                    for (var i in dsFilters) {
                        $(cur_table).find("th[data-field=" + dsFilters[i].field + "] a.k-header-column-menu").append("<i class=\"fa fa-filter\"></i>");
                    }

                }
            });

            var templateFrag = built(properties);
            view = new kendo.View(templateFrag, { wrap: true, model: vm.view.relatedItemController });
            callback(templateFrag);


            if (properties.Disabled) {
                var searchButton = $(view.content).find(".search");
                searchButton.addClass("search-disabled");
            }

            if (vm.view.relatedItemController.isUserCIVisible) {
                vm.RequestedWorkItem.bind("change", function (e) {
                    vm.view.relatedItemController.userConfigItemDataSource.read();
                });
            }

            //more functions
            var isDuplicate = function (idToAdd) {
                var n = false;
                $.each(boundArray, function (i, item) {
                    if (item.BaseId == idToAdd) {
                        n = true;
                    }
                });
                return n;
            }

            var addAffectedItem = function (baseId) {
                if (isDuplicate(baseId)) { return; }
                $.getJSON('/ConfigItems/GetAffectedItem', { id: baseId }, function (json) {
                    var item = {
                        BaseId: baseId,
                        DisplayName: json.DisplayName,
                        ClassName: json.ObjectClassName,
                        Path: json.Path,
                        AssetStatus: !_.isUndefined(json.AssetStatus) ? (json.AssetStatus != null) ? json.AssetStatus : "" : { Name: !_.isUndefined(json.AssetStatus) ? json.AssetStatus : "" },
                        Status: !_.isUndefined(json.Status) ? (json.Status != null) ? json.Status : "" : { Name: !_.isUndefined(json.Status) ? json.Status : "" }
                    };
                    boundArray.push(item);
                });
            }
        }
    }

    return definition;

});
