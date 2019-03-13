/* global $, _, app, define */

/**
 * 'Add Information' Request Offering Task
 * @module addInformationController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
  'text!CustomSpace/Scripts/serviceCatalog/tasks/addInformation/view.html',
], function (
  roTaskUtils,
  addInformationTemplate
) {
  'use strict';
  var roTask = {
      Name: 'addInformation',
      Type: 'RequestOffering',
      Label: 'Add Information',
      Configs: {},
      Access: true,
    },

    /**
     * @exports addInformationController
     */
    definition = {
      template: addInformationTemplate,
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
          app.custom.utils.log('addInformationController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.info && !options.icon) {
            return;
          }
          var builtInfo = _.template(addInformationTemplate);

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm) {
            $(targetElm).append(builtInfo(options));
          });
        }

        initROTask();
      },
    };

  return definition;
});
