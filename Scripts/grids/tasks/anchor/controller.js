/* global _, app, define */

/**
 * Grid Task Anchor Controller
 * @module anchorController
 * @see module:gridTaskmain
 * @see module:gridTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/grids/tasks/anchor/view.html',
], function (
  anchorTemplate
) {
  'use strict';
  var gridTask = {
      Task: 'anchor',
      Type: 'Grid',
      Label: 'Grid Task Anchor',
      Configs: {},
      Access: true,
    },

    /**
     * @exports anchorController
     */
    definition = {
      template: anchorTemplate,
      task: gridTask,
      /**
       * Build Grid Task Anchor
       *
       * @param {object} column - Grid column object.
       */
      build: function build(column) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('gridTask:build', {
            gridTask: gridTask,
            column: column,
          });
        }

        /**
         * Initialize Grid Task Anchor.
         * @returns {string} Kendo template string.
         */
        function initGridTask() {
          var builtAnchor = _.template(anchorTemplate);
          return builtAnchor(column);
        }

        return initGridTask();
      },
    };

  return definition;
});
