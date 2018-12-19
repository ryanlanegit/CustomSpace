/**
relatedItems
**/

define(function (require) {
    var tpl = require("text!forms/predefined/relatedItems/view.html");
    var objectPickerPopup = require("forms/popups/multipleObjectPickerPopup/controller");

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
                isWindowsComputer: false,
                isConfigItemWindowsComputer: function (id) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "/ConfigItems/IsComputer",
                        data: { objectId: id },
                        success: function (result) {
                            vm.view.relatedItemController.isWindowsComputer = (result.toLowerCase() === "true");
                        }
                    });
                },
                isUser: false,
                isConfigItemUser: function (id) {
                    // Replaced IsUser call due to large delays in returning data
                    /*
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "/ConfigItems/IsUser",
                        data: { objectId: id },
                        success: function (result) {
                            vm.view.relatedItemController.isUser = (result.toLowerCase() === "true");
                        }
                    });
                    */
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "/Search/GetObjectProperties",
                        data: {
							id: id
						},
                        success: function (result) {
                            vm.view.relatedItemController.isUser = (result.IsUser === true);
                        }
                    });
                },
                isMoreInfo: function (viewModel) {
                    var bSlideOut = vm.view.relatedItemController.isSlideOut(viewModel);
                    return !bSlideOut;
                },
                isSlideOut: function (viewModel) {
                    // Replaced unneeded calls to IsUser/IsWindowsComputer
                    /*
                    vm.view.relatedItemController.isConfigItemWindowsComputer(viewModel.BaseId);
                    vm.view.relatedItemController.isConfigItemUser(viewModel.BaseId);

                    var bIsWindowsComputer = vm.view.relatedItemController.isWindowsComputer;
                    var bIsUser = vm.view.relatedItemController.isUser;
                    */
                    // Get IsUser Result
                    vm.view.relatedItemController.isConfigItemUser(viewModel.BaseId);
					var bIsUser = vm.view.relatedItemController.isUser;

                    // Set Default IsWindowsComputer Result
                    vm.view.relatedItemController.isWindowsComputer = false;
					var bIsWindowsComputer = false;

                    // If ConfigItem is not a user then check if it is a computer
                    if (!bIsUser) {
                        // Get IsWindowsComputer Result
                        vm.view.relatedItemController.isConfigItemWindowsComputer(viewModel.BaseId);
                        bIsWindowsComputer = vm.view.relatedItemController.isWindowsComputer;
                    }

                    var hasControlCenterURL = !_.isNull(session.consoleSetting.TrueControlCenterURL) && (session.consoleSetting.TrueControlCenterURL != "");

                    return ((bIsWindowsComputer || bIsUser) && hasControlCenterURL) ? true : false;
                },
                showTCCInfo: function (dataItem) {
                    var src = session.consoleSetting.TrueControlCenterURL;
                    var bIsWindowsComputer = vm.view.relatedItemController.isWindowsComputer;
                    var bIsUser = vm.view.relatedItemController.isUser;
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
                    var type = e.item.attributes["custom"].value;
                    var baseId = e.target.attributes["data-base-id"].value;
                    var dataItem =_.find(e.data.RelatesToConfigItem, function (item) { return item.BaseId==baseId; });

                    (type == "slideout") ? vm.view.relatedItemController.showTCCInfo(dataItem) : vm.view.relatedItemController.showMoreInfo(dataItem);
                },
                onContextmenuActivate: function (e) {
                    var baseId = e.target.attributes["data-base-id"].value;
                    // Replaced unneeded calls to IsUser/IsWindowsComputer
                    /*
                    vm.view.relatedItemController.isConfigItemWindowsComputer(baseId);
                    vm.view.relatedItemController.isConfigItemUser(baseId);
                    */
                    // Get IsUser Result
                    vm.view.relatedItemController.isConfigItemUser(baseId);
                    vm.view.relatedItemController.isWindowsComputer = false;

                    // If ConfigItem is not a user then check if it is a computer
                    if (!vm.view.relatedItemController.isUser) {
                        vm.view.relatedItemController.isConfigItemWindowsComputer(baseId);
                    }

                    var managementTitle = localization.UserManagement;
                    if (vm.view.relatedItemController.isWindowsComputer) {
                        managementTitle = localization.ComputerManagement;
                    }

                    var menuItems = [{
                        text: managementTitle,
                        imageUrl: "/Content/Images/Icons/Other/control-center-launcher.png",
                        imageAttr: {
                            height: '16px',
                            width: '16px'
                        },
                        attr: {
                            custom: 'slideout' //custom attribute holds the link type
                        }
                     },
                     {
                         text: "<i class='fa fa-info-circle cursor-pointer'></i>" + localization.AdditionalDetails,
                        encoded: false,
                        attr: {
                            custom: 'info' //custom attribute holds the link type
                        }
                     }];

                    var contextmenu = $("#tccmenu-related-ci").data("kendoContextMenu");
                    contextmenu.setOptions({
                        dataSource: menuItems
                    });
                }
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