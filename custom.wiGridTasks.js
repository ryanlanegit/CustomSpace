/* global $, _, app, kendo, localizationHelper */

/*
 * Custom Work Item Grid Tasks Config
 */

 (function () {
   'use strict';
   if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
     app.custom.utils.log('custom.wiGridTasks:define');
   }

  /**
   * Populate Work Item grid tasks.
   */
  function populateWIGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.wiGridTasks:populateWIGridTasks');
    }
    // Find Action Log grid.
    var actionLogGridData = $('.k-grid').filter('[data-control-grid="actionLogGrid"]').data('kendoGrid');
    if (!_.isUndefined(actionLogGridData)) {
      app.custom.gridTasks
        // Adding grid task to trigger EditComment with dynamic templates and custom callback
        .add(actionLogGridData, {
          field: 'EnteredDate',
          type: 'task',
          name: 'EditComment',
          /**
           * Custom Edit Comment task template generated using Underscore templating
           *
           * @param {object} column - Kendo grid column object.
           * @param {object} task - gridTask object.
           * @returns {string} Kendo column template.
           */
          template: function template(column, task) {
            var template =
              '# var commentTypes = ["AnalystComment", "EndUserComment"];' +
                'if (typeof ActionType === "string" && commentTypes.indexOf(ActionType) > -1) { #' +
                   '<%= app.custom.gridTasks.buildTemplate("task", field, taskName, taskLinkSettings) %>' +
              '# } #';

            template = _.template(template, {
              field: column.field,
              taskName: task.name,
              taskLinkSettings: {
                icon: 'fa-pencil',
                bClickPropagation: false,
                title: localizationHelper.localize('Edit', 'Edit'),
              },
            });

            return template;
          },
          // Format EnteredDate field
          fieldTemplate: "#= (EnteredDate) ? kendo.toString(new Date(EnteredDate), 'g') : '' #",
          /**
           * Custom Edit callback function.
           *
           * @param {object} data - Grid data object including dataItem and related data.
           */
          callback: function callback(data) {
            app.custom.utils.log('EditComment:callback', data);
            var actionLogVm = data.gridData.dataSource.transport.data.parent(),
                actionLogComment = _.findWhere(actionLogVm.actionLogSource, {uid: data.dataItem.uid}),
                commentBoxEditor = $('#commentBoxEditor').data('kendoEditor');

            /**
             * Remove Action Log comment and update Comment Editor.
             */
            function editComment() {
              var actionLogCommentIndex = _.indexOf(actionLogVm.actionLogSource, actionLogComment);
              if (!_.isUndefined(actionLogComment) && actionLogCommentIndex > -1) {
                // Remove comment from Action Log.
                actionLogVm.actionLogSource.splice(actionLogCommentIndex, 1);

                // Set Comment Editor values.
                commentBoxEditor.value(actionLogComment.Description);
                actionLogVm.set('isPrivate', actionLogComment.IsPrivate);

                // Trigger Comment Editor events.
                commentBoxEditor.trigger('keyup', {
                  currentTarget: commentBoxEditor.body,
                });
                commentBoxEditor.trigger('change');
              }
            }

            if (commentBoxEditor.value() === '') {
              editComment();
            } else {
              $.when(kendo.ui.ExtOkCancelDialog.show({
                  title: localizationHelper.localize('Warning', 'Warning'),
                  message: 'Your comment has not been added to the Action Log, continuing edit will discard the unadded comment.',
                  icon: 'fa fa-exclamation',
                })
              ).done(function (response) {
                if (response.button === 'ok') {
                  editComment();
                }
              });
            }
          },
        });

      // Update grid with pending grid task changes.
      app.custom.gridTasks.apply(actionLogGridData);
    }
  }

  /**
   * Initialize Custom Work Item grid tasks.
   */
  function initWIGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.wiGridTasks:initWIGridTasks');
    }
    // Immediately attempt to populate Work item grid tasks.
    populateWIGridTasks();
  }

  if (typeof app.custom.gridTasks !== 'undefined') {
    app.custom.gridTasks.ready(initWIGridTasks);
  } else {
    // Subscribe initWIGridTasks to gridTasks.Ready event once.
    $(app.events).one('gridTasks.Ready', initWIGridTasks);
  }
}());
