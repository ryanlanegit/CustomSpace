/* global _, $, app, define */

/**
 * Grid List Item Link Controller
 * @module linkController
 * @see module:gridTaskmain
 * @see module:gridTaskBuilder
 */
define([
  'text!CustomSpace/Scripts/grids/tasks/link/view.html',
], function (
  listItemLinkTemplate
) {
  'use strict';
  var gridTask = {
      Task: 'link',
      Type: 'Grid',
      Label: 'Grid Task List Item Link',
      Configs: {},
      Access: true,
    },

    /**
     * @exports linkController
     */
    definition = {
      template: listItemLinkTemplate,
      task: gridTask,
      /**
       * Build Grid List Item Link
       *
       * @param {string} field - Grid column name.
       * @param {object} task - Grid Task Name.
       * @param {object} options - Grid Task options.
       */
      build: function build(field, task, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('gridTask:build', {
            gridTask: gridTask,
            field: field,
            task: task,
            options: options,
          });
        }

        /**
         * Initialize Grid List Item Link.
         * @returns {string} Kendo template string.
         */
        function initGridTask() {
          var properties = {
              field: field,
              task: task,
              icon: 'fa-external-link',
              bClickPropagation: false,
              className: '',
              href: '/',
              target: '_blank',
              title: '',
            },
            builtLink = _.template(listItemLinkTemplate);

          $.extend(properties, options);
          return builtLink(properties);
        }

        return initGridTask();
      },
    };

  return definition;
});
