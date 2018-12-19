/*jslint nomen: true */
/*global _, $, app, console, define, kendo, localization, localizationHelper, pageForm */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom History
**/

define([
    "text!CustomSpace/Scripts/forms/predefined/history/view.html"
], function (
    viewTemplate
) {
    "use strict";

    var definition = {
        template: viewTemplate,
        build: function (vm, node, callback) {
            var built = _.template(viewTemplate),
                templateFrag = $(built(node)),
                historyViewModel = kendo.observable({
                    "enumId": (pageForm.viewModel.Id + " - " + pageForm.viewModel.Title),
                    "value": (pageForm.viewModel.Id + " - " + pageForm.viewModel.Title),
                    "options": {
                        "autoBind": false,
                        "showPath": false,
                        "mustSelectLeafNode": false,
                        "disabled": false,
                        "required": false,
                        "showClearButton": false
                    }
                });

            if (app.storage.custom.get("debug")) {
                console.log("historyDropDownTree:build", {
                    "vm": vm,
                    "node": node,
                    "callback": callback,
                    "templateFrag": templateFrag,
                    "historyViewModel": historyViewModel
                });
            }

            kendo.bind(templateFrag.find("#showHistoryDropDown"), historyViewModel);

            vm.view.historyController = new kendo.observable({
                setWithNoDirty: function setWithNoDirty(viewModel, variable, value) {
                    var currentDirtyState = vm.isDirty;
                    viewModel.set(variable, value);
                    vm.isDirty = currentDirtyState;
                },

                load: function load() {
                    var kendoDropDownList = $("#showHistoryDropDown").data("kendoExtDropDownTreeViewV3")._dropdown;
                    if (!_.isUndefined(kendoDropDownList)) {
                        vm.view.historyController.getObjectHistory(kendoDropDownList.value(), kendoDropDownList.text());
                    }
                },

                getObjectHistory: function getObjectHistory(objectId, objectDisplayName) {
                    vm.view.historyController.setWithNoDirty(vm, "historyLabel", { "type": "loading" });
                    vm.view.historyController.setWithNoDirty(vm, "showHistory", false);

                    $.ajax({
                        "url": "/Search/GetObjectHistory",
                        "data": { "id": objectId },
                        "type": "GET",
                        "cache": false,
                        "success": function (data) {
                            console.log("GetObjectHistory:data", data);
                            vm.view.historyController.setWithNoDirty(vm, "historyLabel", { "type": "info", "text": objectDisplayName });

                            // try {
                            // if (_.isUndefined(vm.view.historyController.model)) {
                                vm.view.historyController.model = kendo.observable({
                                    nodes: data
                                });
                                
                                if (!_.isUndefined(vm.view.historyController.view)) {
                                    vm.view.historyController.view.destroy()
                                }

                                vm.view.historyController.view = new kendo.View(
                                    "viewHistoryTemplate", {
                                        "model": vm.view.historyController.model,
                                        "wrap": false,
                                        "init": _.noop //empty function
                                    }
                                );

                                vm.view.historyController.view.render($("#historyView"));
                            //} else {
                                // vm.view.historyController.setWithNoDirty(vm.view.historyController.model, "nodes", data);
                                // vm.view.historyController.model.set("nodes", data);
                            //}
                            // } catch (err) {
                            //    app.controls.exception(err);
                            // }

                            vm.view.historyController.setWithNoDirty(vm, "showHistory", true);
                        },
                        "error": function () {
                            vm.view.historyController.setWithNoDirty(vm, "historyLabel", { "type": "error" });
                        }
                    });
                }
            });

            vm.view.historyController.setWithNoDirty(vm, "historyLabel", { "type": "info", "text": "" });
            callback(templateFrag);
        }
    };

    return definition;

});