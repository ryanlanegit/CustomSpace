/* global $, _, app, define */

/**
 * 'Set Label' Request Offering Task
 * @module setLabelController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
],
function (
  roTaskLib
) {
  'use strict';
  var roTask = {
      Name: 'setLabel',
      Type: 'RequestOffering',
      Label: 'Set Label',
      Configs: {},
      Access: true,
    },

    /**
     * @exports setLabelController
     */
    definition = {
      template: null,
      task: roTask,
      /**
       * Build Request Offering Task.
       *
       * @param {Object} vm - View Model of the base roTask plugin.
       * @param {Object} roTaskElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('setLabelController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
          });

          /*
          if (!_.has(options, 'label')) {
            if (!_.isUndefined(app.custom.utils)) {
              app.custom.utils.log(2, 'setLabelController:initROTask', 'Warning! Invalid arguments provided');
            }
            return;
          }
          */

          roTaskLib.processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            var labelDomElm = $(targetElm).find('.control-label').get(0),
                label,
                attributes;
            // Set label text value while ignoring child objects
            if (_.has(options, 'label')) {
              label = _.isArray(options.label) ? options.label[targetIndex] : options.label;
              labelDomElm.childNodes[0].nodeValue = '\n' + label + '\n';
            }
            // Set optional attributes for label
            if (_.has(options, 'attributes')) {
              attributes = _.isArray(options.attributes) ? options.attributes[targetIndex] : options.attributes;
              _.each(attributes, function(value, key) {
                var delimiter = key.toLowerCase() === 'class' ? ' ' : ';',
                    currValue = labelDomElm.getAttribute(key);
                labelDomElm.setAttribute(key, _.isNull(currValue) ? value : currValue + delimiter + value);
              });
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
