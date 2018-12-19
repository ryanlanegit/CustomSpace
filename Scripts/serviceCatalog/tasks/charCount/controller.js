/*jslint nomen: true */
/*global _, $, app, console, define, setTimeout */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
Character Count
**/

define([
    "text!CustomSpace/Scripts/serviceCatalog/tasks/charCount/view.html"
], function (
    charCountTemplate
) {
    "use strict";
    var roTask = {
            "Task": "charCount",
            "Type": "RequestOffering",
            "Label": "Character Count",
            "Access": true,
            "Configs": {}
        },

        definition = {
            template: charCountTemplate,
            task: roTask,
            build: function build(promptElm, options) {
                if (app.storage.custom.get("debug")) {
                    console.log("roTask:build", {
                        "task": roTask,
                        "promptElm": promptElm,
                        "options": options
                    });
                }
                
                // Add the Minimum / Maximum required text to the page
                function createCharacterCount(targetTextArea, options) {
                    $(targetTextArea).parent().find("span.charCount").remove();
                    var currentLength = $(targetTextArea).val().length,
                        builtCharCount = _.template(charCountTemplate);

                    options.minRemainingCharacters = options.charMin - currentLength;
                    options.remainingCharacters = options.charMax - currentLength;

                    $(targetTextArea).parent().append(builtCharCount(options));
                }

                /* Initialization code */
                function initROTask() {
                    var target = promptElm.next(),
                        targetTextArea = $(target).find("textarea");
                    options = {
                        "minText": options.minText || "Minimum Extra Characters Required",
                        "maxText": options.maxText || "Maximum Characters Remaining",
                        "showMin": options.showMin || "true",
                        "showMax": options.showMax || "true",
                        "showMinMax": options.showMinMax || "false",
                        "charMin": $(targetTextArea).parent().find("input").attr("minlength") || 0,
                        "charMax": $(targetTextArea).parent().find("input").attr("maxlength") || 0
                    };

                    $(targetTextArea).on("paste", function () {
                        setTimeout(function () {
                            createCharacterCount($(this), options);
                        }, 100);
                    });
                    $(targetTextArea).on("keyup", function () {
                        createCharacterCount($(this), options);
                    });
                }

                initROTask();
            }
        };

    return definition;
});