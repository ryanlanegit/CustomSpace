/* global $, _, app, kendo, localizationHelper */

/*
 * Custom Action log Grid Tasks Config
 */

 (function () {
   'use strict';
   if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
     app.custom.utils.log('custom.actionLogTasks:define');
   }

  /**
   * Populate grid tasks for Action Log.
   */
  function populateActionLogTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.actionLogTasks:populateActionLogTasks');
    }
    var actionLogGrid = $('.k-grid[data-control-grid="actionLogGrid"]').data('kendoGrid');
    app.custom.gridTasks
      // Adding grid task to trigger EditComment with dynamic template and custom callback
      .add(actionLogGrid, {
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
        fieldTemplate: "#= (EnteredDate) ? kendo.toString(new Date(EnteredDate), 'g'):'' #",
        /**
         * Custom Edit callback function.
         *
         * @param {object} data - Grid data object including dataItem and related data.
         */
        callback: function callback(data) {
          app.custom.utils.log('EditComment:callback', data);
          var commentBoxEditor = $('#commentBoxEditor').data('kendoEditor'),
              actionLogVm = data.gridData.dataSource.transport.data.parent(),
              actionLogComment = _.findWhere(actionLogVm.actionLogSource, {uid: data.dataItem.uid});

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

          if (actionLogVm.commentBoxHTML === '') {
            editComment();
          } else {
            $.when(kendo.ui.ExtOkCancelDialog.show({
                title: localizationHelper.localize('Warning', 'Warning'),
                message: 'Your comment has not been added to the Action Log, continuing will overwrite it.',
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
    app.custom.gridTasks.apply(actionLogGrid);
  }

  /**
   * Initialize Custom Action Log Grid Tasks.
   */
  function initActionLogTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.actionLogTasks:initActionLogTasks');
    }
    // Immediately attempt to populate Action Log grid tasks.
    populateActionLogTasks();
  }

  if (typeof app.custom.gridTasks !== 'undefined') {
    app.custom.gridTasks.ready(initActionLogTasks);
  } else {
    // Subscribe initActionLogTasks to gridTasks.Ready event once.
    $(app.events).one('gridTasks.Ready', initActionLogTasks);
  }
}());
