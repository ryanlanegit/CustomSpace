/*jslint nomen: true */
/*global _, $, app, console, define, performance */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Page Task Builder
**/

define([
    "CustomSpace/Scripts/page/tasks/groupPicker/controller"
], function () {
    "use strict";
    var pageTaskModules = arguments,
        nodeConfig = {
            "Name": "pageTaskBuilder",
            "Type": "RequestOffering",
            "Label": "Page Task Builder",
            "Access": true,
            "Configs": {}
        },
        definition = {
            node: nodeConfig,
            build: function build(vm, node, callback) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                    console.log("pageTaskBuilder:build", {
                        "vm": vm,
                        "node": node,
                        "callback": callback
                    });
                }
                /* BEGIN Functions */
                function buildAndRender(taskName, promptElm, options) {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                        console.log("pageTaskBuilder:buildAndRender", {
                            "taskName": taskName,
                            "promptElm": promptElm,
                            "options": options
                        });
                    }
                    var pageTask = _.filter(pageTaskModules, function (pageTask) {
                        if (_.isUndefined(pageTask.task)) {
                            return false;
                        } else {
                            return (pageTask.task.Task.toLowerCase() === taskName.toLowerCase());
                        }
                    })[0];

                    if (!_.isUndefined(pageTask)) {
                        pageTask.build(promptElm, options);
                    } else {
                        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                            console.log("Property Not Found For Rendering:", taskName);
                        }
                    }
                }
                /* END functions */

                /* Initialization code */
                function initTask() {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                        console.log("pageTaskBuilder:initTask", performance.now());
                    }
                    var mainWrapperElm = $("#main_wrapper"),
                        htmlWidgetElms = mainWrapperElm.find("div[adf-widget-type='html']");
                    
                    /*
                    var scopeElm = mainWrapperElm.children("div[ui-view]");
                    var $scope = angular.element(scopeElm).scope();
                    
                    $scope.$evalAsync(function ($scope) {
                        console.log("$evalAsync", {
                            "$scope": $scope
                        });
                    });
                    */
                    if (_.isUndefined(htmlWidgetElms[0])) {
                        console.log("No HTML Widgets On Page", {
                            "mainWrapperElm": mainWrapperElm,
                            "htmlWidgetElms": htmlWidgetElms
                        });
                    } else {
                        console.log(htmlWidgetElms.Length + " HTML Widgets On Page");
                        /*
                        htmlWidgetElms.each(function () {
                            var htmlWidget =  $(this),
                                htmlContentContainer = htmlWidget.find("adf-widget-content div[ng-bind-html]");
                                htmlContent = htmlContentContainer.html();
                            console.log("htmlWidget", {
                                htmlWidget: htmlWidget,
                                htmlContentContainer: htmlContentContainer,
                                htmlContent: htmlContent
                            });
                            
                            // Regex Check For Valid JSON based on https://github.com/douglascrockford/JSON-js/blob/master/json2.js
                            var rx_one = /^[\],:{}\s]*$/,
                                rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                                rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                                rx_four = /(?:^|:|,)(?:\s*\[)+/g;
                            if (
                                rx_one.test(
                                    htmlContent
                                        .replace(rx_two, "@")
                                        .replace(rx_three, "]")
                                        .replace(rx_four, "")
                                )
                            ) {
                                console.log("htmlContent is valid JSON");
                                
                                htmlWidget.addClass("task-container");
                                
                                var parsedProperties = JSON.parse(htmlContent),
                                    propName;

                                // Hide/Show Page Task Template Rows
                                if (_.isUndefined(app.storage.custom)) {
                                    htmlWidget.hide();
                                } else {
                                    if (!app.storage.custom.get("debug")) {
                                        htmlWidget.hide();
                                    }
                                }
                                for (propName in parsedProperties) {
                                    if (parsedProperties.hasOwnProperty(propName)) {
                                        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                                            console.log("pageTaskElm.property", {
                                                "name": propName,
                                                "value": parsedProperties[propName]
                                            });
                                        }
                                        buildAndRender(propName, htmlWidget, parsedProperties[propName]);
                                    }
                                }
                                
                            } else {
                                console.log("htmlContent is NOT valid JSON");
                            }
                        });
                        */
                    }
                    

                    if (typeof callback === "function") {
                        callback();
                    }
                }

                initTask();
            }
        };

    return definition;
});
