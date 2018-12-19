/**
history
**/

define(function (require) {
    var tpl = require("text!CustomSpace/Scripts/forms/predefined/history/view.html");


    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            
            var built = _.template(tpl);
            var templateFrag = $(built(node));

            vm.setWithNoDirty = function(variable, value) {
                var isDirtyState = vm.get("isDirty");
                vm.set(variable, value);
                vm.set("isDirty", isDirtyState);
            };
            
            /*
            if (!_.isUndefined(pageForm.newWI)) { vm.set("HistoryButton", !pageForm.newWI); } //workitem
            if (!_.isUndefined(pageForm.isNew)) { vm.set("HistoryButton", !pageForm.isNew); } //AM 
            */

            templateFrag.find("#showHistoryDropDown").kendoDropDownList({
                dataSource: [{
                    text: pageForm.viewModel.Id + ' - ' + pageForm.viewModel.Title,
                    value: pageForm.viewModel.BaseId
                }],
                select: function(event) {
                    var dataItem = this.dataItem(event.item);
                    vm.view.history.getObjectHistory(dataItem.value, dataItem.text);
                },
                open: function(event) {
                    if(!vm.view.history.dataSourceSet) {
                        event.sender.setDataSource(vm.view.history.getDropDownDataSource());
                        vm.view.history.dataSourceSet = true;
                    }
                }
            }).data("kendoDropDownList");
            
            vm.setWithNoDirty("historyLabel", { type: "info", text: "" });
            
            $.extend(vm.view, {
                history: {                
                    loadHistory: function() {
                        var kendoDropDownList = $("#showHistoryDropDown").data("kendoDropDownList");
                        vm.view.history.getObjectHistory(kendoDropDownList.value(), kendoDropDownList.text());                  
                    },
                    
                    dropDownDataSet: false,

                    getDropDownDataSource: function () {
                        var data = [];
                        var getChildren = function (viewModel, prefix) {
                            prefix = prefix || "";
                            data.push({
                                text: prefix + viewModel.Id + " - " + viewModel.Title,
                                value: viewModel.BaseId
                            });
                            if (viewModel.Activity !== undefined && viewModel.Activity.length > 0) {
                                $.each(viewModel.Activity, function (Key, activity) {
                                    getChildren(activity, prefix + "    ");
                                });
                            }
                        };

                        getChildren(pageForm.viewModel);  

                        return data;
                    },
                    
                    getObjectHistory: function (objectGUID, objectTitle) {
                        vm.setWithNoDirty("historyLabel", { type: "loading" });
                        vm.setWithNoDirty("showHistory", false);

                        $.ajax({
                            url: "/Search/GetObjectHistory",
                            data: { id: objectGUID },
                            type: "GET",
                            cache: false,
                            success: function (data) {
                                vm.setWithNoDirty("historyLabel", { type: "info", text: objectTitle });
                                
                                /*
                                if(vm.view.history.model !== undefined) {
                                    vm.view.history.view.destroy();
                                }*/
                                
                                try {
                                    if(vm.view.history.model === undefined) {
                                        var customhistoryModel = kendo.observable({
                                            nodes: data
                                        });

                                        vm.view.history.model = customhistoryModel;

                                        vm.view.history.view = new kendo.View(
                                            "viewHistoryTemplate",
                                            {
                                                model: customhistoryModel,
                                                wrap: false,
                                                init: $.noop //empty function
                                            }
                                        );

                                        vm.view.history.view.render($("#historyView"));
                                    } else {
                                        vm.view.history.model.set("nodes", data);
                                    }
                                }
                                catch (err) {
                                    
                                }
                                
                                vm.setWithNoDirty("showHistory", true);
                            },
                            error: function (data) {
                                vm.setWithNoDirty("historyLabel", { type: "error" });
                            }
                        });
                    }
                }
            });

            callback(templateFrag);
        }
    }

    return definition;

});