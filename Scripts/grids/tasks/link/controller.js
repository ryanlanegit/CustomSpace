/*global _, $, app, console, define */

/**
Grid List Item Link
**/

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
      Access: true,
      Configs: {},
    },

    definition = {
      template: listItemLinkTemplate,
      task: gridTask,
      build: function build(field, task, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('gridTask:build', {
            gridTask: gridTask,
            field: field,
            task: task,
            options: options,
          });
        }

        /* Initialization code */
        function initGridTask() {
					var properties = {
						field: field,
						task: task,
						icon: 'fa-external-link',
						bClickPropagation: false,
						className: '',
						href: '/',
						target: '_blank',
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
