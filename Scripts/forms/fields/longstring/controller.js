/*jslint nomen: true */
/*global _, $, define, kendo, setTimeout */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
LONGSTRING
**/

define([
    'text!CustomSpace/Scripts/forms/fields/longstring/view.html'
], function (longStringTemplate) {
    'use strict';
    var definition = {
        template: longStringTemplate,
        build: function build(vm, node, callback) {
            if (_.isUndefined(vm[node.PropertyName])) {
                vm[node.PropertyName] = [];
            }

            function getFieldViewModel(properties) {
                var fieldProperties = {
                    CharactersRemaining: properties.MaxLength,
                    CheckLength: function checkLength(e) { //blur event
                        setTimeout(function () {
                            var elem = $(e.currentTarget),
                                helpBlock = elem.next(),
                                maxChars = elem.attr('maxlength'),
                                count = elem.val().length;
                            if (count > maxChars) {
                                elem.attr('data-invalid', '');
                                helpBlock.show();
                            } else {
                                helpBlock.hide();
                                elem.removeAttr('data-invalid');
                                elem.data('prevent', false);
                            }
                        }, 100);
                    },
                    TextCounter: function textCounter() {
                        this.set('CharactersRemaining', this.MaxLength - this.ResolutionDescription.length);
                    }
                },
                    fieldViewModel = kendo.observable($.extend(true, fieldProperties, properties));

                return fieldViewModel;
            }

            //template .build() and view.renderererers.
            var buildAndRender = {
                fieldEle: function fieldEle(properties, fieldViewModel, fieldTemplate) {
                    $.extend(true, properties, node);
                    // build the field and bind viewmOdel to it
                    var builtField = _.template(fieldTemplate),
                        fieldElm = new kendo.View(builtField(properties), { wrap: false, model: fieldViewModel});

                    //send hidden window back to caller (appended in the callback)
                    if (typeof callback === 'function') {
                        callback(fieldElm.render());
                    }
                    return fieldElm;
                }
            };

            function initField() {
                var fieldTemplateProps = {
                    Required: node.Required,
                    Disabled: node.disabled,
                    MinLength: node.MinLength,
                    MaxLength: node.MaxLength,
                    LimitLength: (!_.isUndefined(node.MinLength) || !_.isUndefined(node.MaxLength)),
                    Rows: node.Rows || 5,
                    visible: (!_.isUndefined(node.IsVisible) && node.IsVisible === false ? 'hidden' : '')
                },
                    fieldViewModel = getFieldViewModel(fieldTemplateProps),
                    fieldEle = buildAndRender.fieldEle(fieldTemplateProps, fieldViewModel, longStringTemplate);

                vm[node.PropertyName] = fieldViewModel;
                return fieldEle;
            }

            return initField();
        }
    };

    return definition;
});
