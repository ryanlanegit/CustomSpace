/* global $, _, app, localizationHelper */

/*
 * Dynamically add 'Edit' button to last comment in Action Log grid.
 */

 (function () {
   'use strict';
   if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
     app.custom.utils.log('custom.actionLogTasks:define');
   }

  /**
   * Dynamically add 'Edit' button to last comment in Action Log grid.
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
              title: localizationHelper.localize(task.name, 'Edit Comment'),
            },
          });

          return template;
        },
        // Format EnteredDate field
        fieldTemplate: "#= (EnteredDate) ? kendo.toString(new Date(EnteredDate), 'g'):'' #",
        /**
         * Custom callback function.
         *
         * @param {object} data - Grid data object including dataItem and related data.
         */
        callback: function callback(data) {
          app.custom.utils.log('EditComment:callback', data);
          var commentBoxEditor = $('#commentBoxEditor').data('kendoEditor'),
              actionLogVm = commentBoxEditor.element.get(0).kendoBindingTarget.source,
              actionLogAddButtonElm = $('.action-log-add-button'),
              actionLogComment = _.findWhere(actionLogVm.actionLogSource, {uid: data.dataItem.uid}),
              actionLogCommentIndex;

          if (!_.isUndefined(actionLogComment)) {
            actionLogCommentIndex = _.indexOf(actionLogVm.actionLogSource, actionLogComment);
            if (actionLogCommentIndex > -1) {
              actionLogComment = actionLogVm.actionLogSource[actionLogCommentIndex];
              commentBoxEditor.value(actionLogComment.Description);
              actionLogVm.set('isPrivate', actionLogComment.IsPrivate);

              // Remove comment from Action Log.
              actionLogVm.actionLogSource.splice(actionLogCommentIndex, 1);

              // Trigger Comment Editor events.
              commentBoxEditor.trigger('keyup', {
                currentTarget: commentBoxEditor.body,
              });
              commentBoxEditor.trigger('change');
            }
          }
        },
      });

    // Update grid with pending grid task changes.
    app.custom.gridTasks.apply(actionLogGrid);
  }

  /**
   * Initialize Custom Grid Tasks.
   */
  function initActionLogTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.actionLogTasks:initActionLogTasks');
    }
    // Immediately attempt to populate Action Log grid tasks.
    populateActionLogTasks();
  }

  /**
   * Initialize Dynamic 'Edit' Button Script
   *
   * @param {object} formObj - Page Form Object.
   *
   */
  function initWICustomTask(formObj) {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.actionLogTasks:initWICustomTask');
    }
    formObj.boundReady(function(){
      if (typeof app.custom.gridTasks !== 'undefined') {
        app.custom.gridTasks.ready(initActionLogTasks);
      } else {
        // Subscribe initGridTasks to gridTasks.Ready event once.
        $(app.events).one('gridTasks.Ready', initActionLogTasks);
      }
    });
  }

  var supportedWITypes = [
    'Incident',
    'Problem',
    'ChangeRequest',
    'ServiceRequest',
  ];
  _.each(supportedWITypes, function (type) {
    app.custom.formTasks.add(type, null, initWICustomTask);
  });
}());
