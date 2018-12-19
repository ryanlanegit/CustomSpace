/*jslint nomen: true */
/*global _, $, app, console, define, kendo, localization, localizationHelper, pageForm */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom History Drop Down Tree Binding
**/

kendo.data.binders.historyDropDownTree = kendo.data.Binder.extend({
    init: function init(element, bindings, options) {
        //call base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var that = this;

        if (bindings.options && bindings.options.path) {
            //options are being passed in via data-bind options: {} object
            var optionsObject = bindings.options.source.get();
            that.options.showPath = optionsObject.showPath;
            that.options.mustSelectLeafNode = optionsObject.leafNodeOnly;
            that.options.disabled = optionsObject[bindings.options.path.disabled];
            that.options.required = ($(element).attr("required") === "required");
            that.options.filterId = optionsObject.filterId;
            that.options.showClearButton = !_.isUndefined(optionsObject.showClearButton) ? optionsObject.showClearButton : false;
            that.options.placeholder = $(element).attr("data-placeholder");
        } else {
            //options are set as data-* attributes (defined forms)
            var bShowClearButton = $(element).attr("data-showclearbutton") === "true" ? true : false;

            that.options.showPath = $(element).attr("data-showpath") === "true" ? true : false;
            that.options.mustSelectLeafNode = $(element).attr("data-mustselectleafnode") === "true" ? true : false;
            that.options.disabled = $(element).attr("data-disabled") === "true" ? true : false;
            that.options.required = $(element).attr("required") === "required";
            that.options.filterId = $(element).attr("data-filter");
            that.options.showClearButton = !_.isUndefined(bShowClearButton) ? bShowClearButton : false;
            that.options.placeholder = $(element).attr("data-placeholder");
        }

        function getRelatedActivitiesList(viewModel, parentId) {
            parentId = parentId || "Root";
            var activityItem = {
                "ParentId" : parentId,
                "Id": viewModel.BaseId,
                "Text": viewModel.Id + " - " + viewModel.Title,
                "Name": viewModel.Id + " - " + viewModel.Title,
                "HasChildren": false,
                "Ordinal": 0,
                "EnumNodes": []
            }

            that.relatedActivitiesList.push(activityItem);

            if (!_.isUndefined(viewModel.Activity) && viewModel.Activity.length > 0) {
                activityItem.HasChildren = true;
                _.each(viewModel.Activity, function (activityViewModel) {
                    getRelatedActivitiesList(activityViewModel, activityItem.Id);
                });
            }
        }

        that.relatedActivitiesList = [];
        getRelatedActivitiesList(pageForm.viewModel);

        if (app.storage.custom.get("debug")) {
            console.log("historyDropDownTree:init", {
                "relatedActivitiesList": that.relatedActivitiesList,
                "bindings": bindings,
                "options": that.options
            });
        }
    },
    options: {
        name: "historyDropDownTree",
        autoBind: false,
        template: "",
        showPath: false,
        mustSelectLeafNode: false,
        disabled: false,
        required: false,
        filterId: "",
        showClearButton: false
    },
    relatedActivitiesList: [],
    getChildActivities: function getChildActivities(parentId) {
        var that = this;
        return _.filter(that.relatedActivitiesList, function(activity){
            return activity.ParentId === parentId;
        });
    },
    refresh: function refresh() {
        var that = this,
            parameterId,
            treeViewDataSource,
            comboDataSource,
            treeViewOptions,
            comboBoxOptions,
            extOptions,
            combobox;

        try {
            parameterId = that.bindings["historyDropDownTree"].get();
        } catch (ex) {
            parameterId = eval(that.bindings["historyDropDownTree"].path);
        }

        if (_.isUndefined(parameterId)) {
            parameterId = "selectedValue";
        }

        if (app.storage.custom.get("debug")) {
            console.log("historyDropDownTree:refresh", {
                "parameterId": parameterId
            });
        }

        //this is necessary in the case when the refresh is called many times and can lead to a stack overflow.
        if (parameterId === that.options.lastParameterId) {
            return;
        }
        that.options.lastParameterId = parameterId;
        that.options.propertyName = that.bindings.value.path;

        if (that.treeViewWidgetData) {
            that.treeViewWidgetData.destroy();

            $(that.element).empty();
            //on initial load, if a value is set, then we want it to display, on refresh because the source
            //of the list has changed, we want to clear it so it does not get invalid values.
            that.bindings.value.set({});
        }

        treeViewDataSource = new kendo.data.HierarchicalDataSource({
            serverFiltering: false,
            transport: {
                read: function (options) {
                    options.filter = options.data.Id || "Root";
                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.treeView:read", {
                            "options": options
                        });
                    }
                    options.success(that.getChildActivities(options.filter));

                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.treeView:read", {
                            "treeviewData": that.getChildActivities(options.filter)
                        });
                    }
                }
            },
            schema: {
                model: {
                    id: "Id",
                    hasChildren: "HasChildren"
                }
            },
            requestEnd: function (e) {
                //wait for datasource to be filled before executing leaf-node-only routine
                _.defer(function () {
                    that.treeViewWidgetData._treeview.expand(".k-item");
                    _.each(e.sender._data, function (i, item) {
                        var dataItem = e.sender._data[item],
                            nodeElm,
                            selectedNode;
                        if (that.treeViewWidgetData.options.mustSelectLeafNode && dataItem.HasChildren) {
                            //disable the specific parent's li element only and not the entire treeview node
                            nodeElm = that.treeViewWidgetData._treeview.findByUid(dataItem.uid).find("span[role='presentation']").next();
                            nodeElm.css("background", "none");
                            nodeElm.css("color", "gray");
                            nodeElm.css("border-color", "white");
                            nodeElm.css("cursor", "default");
                        }
                        //default node selection to current value
                        if (that.bindings["value"].get().Id === dataItem.Id) {
                            nodeElm = that.treeViewWidgetData._treeview.findByUid(dataItem.uid);
                            selectedNode = (nodeElm.find("span[role='presentation']").length !== 0) ? nodeElm.find("span[role='presentation']").next() : nodeElm.find("span").slice(0, 2);
                            selectedNode.addClass("k-state-selected");
                        }
                    });
                });
            }
        });

        comboDataSource = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.comboBox:read", {
                            "options": options,
                            "that": that
                        });
                    }
                    var data = [],
                        filter = (that.treeViewWidgetData) ? that.treeViewWidgetData.handler._dropdown.input.val() : "";
                    $.each(that.relatedActivitiesList, function (Key, activity) {
                        if (activity.Name.toLowerCase().indexOf(filter) !== -1) {
                            data.push(activity);
                        }
                    });

                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.comboBox:read", {
                            "data": data
                        });
                    }
                    options.success(data);
                }
            },
            schema: {
                model: {
                    id: "Id",
                    hasChildren: "HasChildren"
                }
            }
        });


        function getBindingName() {
            var name = that.bindings.value.get("");
            return !_.isNull(name) ? name.Name : "";
        };

        if (app.storage.custom.get("debug")) {
            console.log("historyDropDownTree:refresh", {
                "bindings.value": that.bindings.value.get(""),
                "bindings": that.bindings,
                "relatedActivitiesList[0].Name": _.isUndefined(that.bindings.value.get("")) ? that.relatedActivitiesList[0].Name : getBindingName()
            });
        }

        treeViewOptions = {
            "treeView": {
                "autoBind": false,
                "value": _.isUndefined(that.bindings.value.get("")) ? that.relatedActivitiesList[0].Name : getBindingName(),
                "dataSource": treeViewDataSource,
                "dataTextField": "Name",
                "dataValueField": "Id",
                "loadOnDemand": false,
                "change": function () {
                    var item = this.dataItem(this.select()),
                        vm,
                        propertyName;
                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.treeView:change", {
                            "item": item
                        });
                    }

                    if (item && item.HasChildren && that.options.mustSelectLeafNode) {
                        //this is a branch node, not a leaf, so don't set anything
                        return false;
                    } else if (item) {
                        //we let the parent ExtDropDownTree function handle this change -JK
                        //no need to change the vm value again, this caused a double change event to be fired
                        vm = that.bindings.historyDropDownTree.source.get();

                        if (!(that.options.showPath)) {
                            that.treeViewWidgetData._dropdown.text(that.bindings["value"].source.selectedValue.Name);
                        }

                        vm.set("IsEnumValid", true);
                        setIsValid(true);
                        setInputDecoration();
                    }
                },
                "select": function () {
                    if (app.storage.custom.get("debug")) {
                        console.log("historyDropDownTree.treeView:select");
                    }
                    //we need this empty function to prevent the default ExtDropDownTreeV3 from handeling the select event
                    //if we don't block the default select trigger the change event gets fired twice
                    //a select also triggers a change
                    //this ensure the correct validation

                    return true;
                },
                "messages": {
                    "loading": localization.Loading
                }

            }
        };

        // comboBox options
        comboBoxOptions = {
            "comboBox": {
                "autoBind": false,
                "value": _.isUndefined(that.bindings.value.get("")) ? that.relatedActivitiesList[0].Name : getBindingName(),
                "dataTextField": "Name",
                "dataValueField": "Id",
                "suggest": true,
                "minLength": 2,
                "filter": "contains",
                "placeholder": localizationHelper.localize(this.options.placeholder, localization.ChooseOne),
                "dataSource": comboDataSource,
                "change": function () {
                    //this handles all changes to the enum combobox
                    updateViewModel(this);
                },
                "select": function () {
                    //we need this empty function to prevent the default ExtDropDownTreeV3 from handeling the select event
                    //if we don't block the default select trigger the change event gets fired twice
                    //a select also triggers a change
                    //this ensure the correct validation

                    return true;
                },
                "clearButton": that.options.showClearButton
            }
        };

        extOptions = $.extend({
            "value": that.bindings.value,
            "mustSelectLeafNode": that.options.mustSelectLeafNode
        }, treeViewOptions, comboBoxOptions);

        that.treeViewWidget = $(that.element).kendoExtDropDownTreeViewV3(extOptions);
        that.treeViewWidgetData = that.treeViewWidget.data("kendoExtDropDownTreeViewV3");

        combobox = that.treeViewWidgetData._dropdown;

        //Allow change to vm when item is selected by click event
        combobox.list.on("click", function () {
            updateViewModel(combobox);
        });

        //Allow change to vm when item is selected by tab and enter event
        combobox.input.on("keydown", function (e) {
            var filter = combobox.dataSource.filter() || { filters: [] };

            if ((e.keyCode === 9 || e.keyCode === 13) && filter.filters[0]) { //TAB
                updateViewModel(combobox);
            }
        });

        function updateViewModel(sender) {
            var id = (sender.selectedIndex === -1 || sender.value() === "00000000-0000-0000-0000-000000000000") ? null : sender.value(),
                name = sender.selectedIndex === -1 ? null : sender.text(),
                vm = that.bindings.historyDropDownTree.source.get(),
                propertyName = that.bindings.value.path,
                isRequired = that.options.required,
                isEmpty = false,
                isValid = true,
                selectedItem;

            //did the value actually change
            if (id === vm.get(propertyName).Id) {
                //nothing changed do nothing
                return;
            }

            if ($("html").hasClass("k-ie9")) {
                isEmpty = (sender.input.val() === "" || sender.input.val() === localization.ChooseOne);
            } else {
                isEmpty = (sender.input.val() === "");
            }

            //if a valid value is selected then the selectedIndex will be a positive number
            if (isRequired) {
                if (sender.selectedIndex === -1 || isEmpty) {//required and an invalid selected value or an empty one
                    isValid = false;
                }
            } else if (sender.selectedIndex === -1 && !isEmpty) {//no selected values but we have an entered value
                isValid = false;
            }

            if (id === name) {
                id = vm.get(propertyName).Id;
            }

            if (isValid || isEmpty) {
                vm.set(propertyName, {
                    Id: id || "",
                    Name: name || ""
                });
            }

            vm.set("IsEnumValid", isValid);
            setIsValid(isValid);
            setInputDecoration();

            //now select the item in the tree view
            selectedItem = that.treeViewWidgetData._dropdown.dataItem();
            if (!_.isUndefined(selectedItem)) {
                that.treeViewWidgetData._treeview.select(that.treeViewWidgetData._treeview.findByUid(selectedItem.uid));
            } else {
                that.treeViewWidgetData._treeview.select("");
            }
        }

        //input underline decoration
        function setInputDecoration() {
            var value = that.bindings["value"].get().Name || that.bindings["value"].get().Text;
            if (value && value.length > 0) {
                that.treeViewWidgetData._dropdown.input.css({ "text-decoration": "underline" });
            } else {
                that.treeViewWidgetData._dropdown.input.css({ "text-decoration": "none" });
            }
        };

        //invalid decoration
        function setIsValid(isValid) {
            isValid = isValid || false;
            var targetObj = that.treeViewWidgetData._dropdown.input;
            if (isValid || targetObj.val() === "") { //Added targetObj.val()=="" so that it will remove the pick background if enum is clear
                targetObj.closest(".k-dropdown-wrap").removeClass("input-error");
                targetObj.removeClass("input-error");
            } else {
                targetObj.closest(".k-dropdown-wrap").addClass("input-error");
                targetObj.addClass("input-error");
                //leave the value so user can see what they did wrong
            }
        };

        //display value and make a pretty underline
        //that.treeViewWidgetData._dropdown.value(that.bindings["value"].get().Name);
        setInputDecoration();

        //leaf node only
        if (that.options.mustSelectLeafNode) {
            $(that.treeViewWidget.children()[0]).find("a").bind("click", function () {
                that.treeViewWidgetData._treeview.dataSource.read();
            });
        }

        //disable
        if (that.options.disabled) {
            that.treeViewWidgetData._dropdown.enable(false);
            that.treeViewWidgetData._dropdown.input.attr("placeholder", "");
            $(that.treeViewWidget.children()[0]).find("a").remove();
        }

    },
    destroy: function () {
        if (app.storage.custom.get("debug")) {
            console.log("historyDropDownTree:destroy");
        }
        if (this.treeViewWidgetData) {
            $(this.element).removeAttr("data-role");
            $(this.element).empty();
        }
    }
});