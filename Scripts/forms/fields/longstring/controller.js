/* global $, _, define, kendo, setTimeout */

/**
 * Long String Field Control
 * @module longStringController
 * @see module:gridTaskmain
 * @see module:gridTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/forms/fields/longstring/view.html',
], function (longStringTemplate) {
  'use strict';
  /**
   * @exports longStringController
   */
  var definition = {
    template: longStringTemplate,
    /**
     * Optional build callback type.
     *
     * @callback buildCallback
     * @param {object} fieldElm - Built Field DOM Element.
     */

    /**
     * Build Long String Field Control.
     *
     * @param {object} vm - View Model to add Control View Model to.
     * @param {object} node - Module configuration.
     * @param {buildCallback} [callback] - Callback function once build is complete.
     * @returns {object} Built Field DOM Element.
     */
    build: function build(vm, node, callback) {
      /**
       *  Get Field Controller Kendo View Model.
       */
      function getFieldViewModel(properties) {
        var fieldProperties = {
          LimitLength: (!_.isUndefined(node.MinLength) || !_.isUndefined(node.MaxLength)),
          charactersRemaining: node.MaxLength,
          textCounter: _.debounce(function textCounter() {
            if (this.LimitLength) {
              this.set('charactersRemaining', this.MaxLength - this[this.PropertyName].length);
            }
          }, 100),
        };
        $.extend(true, fieldProperties, properties, node);

        return kendo.observable(fieldProperties);
      }

      /**
       * Build the field and bind it to ViewModel.
       *
       * @returns {object} Built Field DOM Element.
       */
      function buildAndRender(fieldViewModel, fieldTemplate) {
        var builtField = _.template(fieldTemplate),
            fieldView = new kendo.View(builtField(fieldViewModel), {
              wrap: false,
              model: fieldViewModel,
            }),
            fieldElm = fieldView.render();

        // Send View element back to caller (appended in the callback).
        if (typeof callback === 'function') {
          callback(fieldElm);
        }

        return fieldElm;
      }

      /**
       * Initialize Field Controller.
       *
       * @returns {object} Built Field DOM Element.
       */
      function initField() {
        var defaultProperties = {
              visible: true,
              Required: false,
              Disabled: false,
              Rows: 4,
            },
            fieldViewModel = getFieldViewModel(defaultProperties),
            fieldElm = buildAndRender(fieldViewModel, longStringTemplate);

        vm[node.PropertyName] = fieldViewModel;
        return fieldElm;
      }

      return initField();
    },
  };

  return definition;
});
