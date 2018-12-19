/*jslint nomen: true */
/*global _, $, app, console, define */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Custom Request Offering Task Builder
**/

define([
    "CustomSpace/Scripts/serviceCatalog/tasks/addClass/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/addInformation/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/autoSize/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/charCount/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/indent/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/layoutTemplate/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/setAttribute/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/setOptions/controller",
    "CustomSpace/Scripts/serviceCatalog/tasks/singleLineEntry/controller"
    // "CustomSpace/Scripts/serviceCatalog/tasks/summary/controller"
], function () {
    "use strict";
    var roTaskModules = arguments,
        nodeConfig = {
            "Name": "roTaskBuilder",
            "Type": "RequestOffering",
            "Label": "Request Offering Task Builder",
            "Access": true,
            "Configs": {}
        },
        definition = {
            node: nodeConfig,
            build: function build(vm, node, callback) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                    console.log("roTaskBuilder:build", {
                        "vm": vm,
                        "node": node,
                        "callback": callback
                    });
                }
                /* BEGIN Functions */
                function buildAndRender(taskName, promptElm, options) {
                    var roTask = _.filter(roTaskModules, function (roTask) {
                        return (roTask.task.Task.toLowerCase() === taskName.toLowerCase());
                    })[0];

                    if (!_.isUndefined(roTask)) {
                        roTask.build(promptElm, options);
                    } else {
                        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                            console.log("Property Not Found For Rendering:", taskName);
                        }
                    }
                }
                /* END functions */

                /* Initialization code */
                function initTask() {
                    $("div.page-panel").each(function () {
                        var roPage = $(this),
                            roTaskElms = roPage.find("p:contains('{\"'), p:contains('{ \"')"),
                            roQuestionElms = roPage.find("div.question-container");
                        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                            console.log("roTaskBuilder:initTask", {
                                "roPage": roPage,
                                "roTaskElms": roTaskElms,
                                "roQuestionElms": roQuestionElms
                            });
                        }

                        // Set 100% Width for Display Rows
                        roPage.find(".row:not(.question-container) .col-xs-12").removeClass("col-md-8").addClass("col-md-12");

                        roQuestionElms.each(function () {
                            var questionElm = $(this),
                                questionId = questionElm.find("input.question-answer-id").attr("value"),
                                questionType = questionElm.find("input.question-answer-type").attr("value"),
                                questionContainer = questionElm.find("div.col-xs-12"),
                                questionFormGroup = questionElm.find("div.form-group"),
                                msgSpan;

                            if (questionContainer.hasClass("col-md-4") || questionContainer.hasClass("col-md-8")) {
                                questionContainer.removeClass("col-md-4 col-md-8").addClass("col-md-6");
                            }

                            switch (questionType) {
                            case "Integer":
                                questionFormGroup.find("input[data-role]").data().handler.setOptions({format: "#", decimals: 0 });
                                if (questionElm.find("span.k-invalid-msg").length === 0) {
                                    msgSpan = $("<span></span");
                                    msgSpan.addClass("k-invalid-msg").attr("data-for", questionId);
                                    questionFormGroup.prepend(msgSpan);
                                }
                                break;
                            }
                        });

                        roTaskElms.each(function () {
                            var parsedProperties = JSON.parse($(this).text()),
                                propertyContainer = $(this).closest(".row"),
                                propName;

                            for (propName in parsedProperties) {
                                if (parsedProperties.hasOwnProperty(propName)) {
                                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get("debug")) {
                                        console.log("roTaskElm.property", {
                                            "name": propName,
                                            "value": parsedProperties[propName]
                                        });
                                    }
                                    buildAndRender(propName, propertyContainer, parsedProperties[propName]);
                                }
                            }
                        });
                    });
                    callback();
                }

                initTask();
            }
        };

    return definition;
});