/* global _, $, app, kendo, session */

/*
 * Custom Grid Tasks Config
 */

(function () {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('custom.gridTasks:define');
  }

  /**
   * Populate the grid tasks of the first Kendo Grid found.
   */
  function populateGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.gridTasks:populateGridTasks');
    }
    // Find first kendoGrid on page.
    var gridData = $('div[data-role="grid"]:first').data('kendoGrid');
    if (!_.isUndefined(gridData)) {
      app.custom.gridTasks
        // Adding background colors to the Priority column based on value.
        .add(gridData, 'Priority', 'class', '', "#= 'ra-grid-priority-' + Priority #")
        // Adding custom internal and external links to the Title column with dynamic template and no callback.
        .add(gridData, 'Title', 'task', 'TitleLinks',
          // Custom Title Links Task Template generated using Underscore templating
          function (column, task) {
            var template =
              '# var url = app.gridUtils.getLinkUrl(data, "***");' +
                'if ((!_.isUndefined(WorkItemType) && WorkItemType.indexOf("Activity") != -1)) {' +
                  'var approvalUrl = app.gridUtils.getApprovalLinkUrl(data); #' +
                  '<%= app.custom.gridTasks.buildTemplate("link", field, taskName, actLinkSettings) %>' +
              '# } #' +
              '<%= app.custom.gridTasks.buildTemplate("link", field, taskName, wiLinkSettings) %>' +
              '<%= app.custom.gridTasks.buildTemplate("link", field, taskName, defaultLinkSettings) %>';

            template = _.template(template, {
              field: column.field,
              taskName: task.name,
              wiLinkSettings: {
                href: '#= url #',
              },
              actLinkSettings: {
                href: '#= approvalUrl #',
                icon: 'fa-check',
              },
              defaultLinkSettings: {
                href: '#= url #',
                icon: 'fa-arrow-right',
                bClickPropagation: true,
                className: 'ra-highlight-default-icon',
                target: '',
              },
            });

            return template;
        });

      // If user is an analyst then add 'AssignToAnalystByGroup' grid task to AssignedUser column.
      if (session.user.Analyst === 1) {
        // Check if page includes the 'analystByGroup' button before adding task.
        var assignToAnalystByGroupButton = $('li[data-bind*="click: analystByGroup"]:first');
        if (assignToAnalystByGroupButton.length > 0) {
          app.custom.gridTasks
            // Adding grid task to trigger AssignToAnalystByGroup with dynamic template and custom callback
            .add(gridData, 'AssignedUser', 'task', 'AssignToAnalystByGroup',
              // Custom AssignToAnalystByGroup Task Template
              function (column, task) {
                var template =
                  '# var analystByGroupTypes = ["System.WorkItem.Incident", "System.WorkItem.ServiceRequest"];' +
                    'if (!_.isUndefined(WorkItemType) && analystByGroupTypes.indexOf(WorkItemType) > -1) { #' +
                       '<%= app.custom.gridTasks.buildTemplate("task", field, taskName, taskLinkSettings) %>' +
                  '# } #';

                template = _.template(template, {
                  field: column.field,
                  taskName: task.name,
                  taskLinkSettings: {
                    icon: 'fa-pencil',
                    bClickPropagation: false,
                    title: 'Assign To Analyst By Group',
                  },
                });

                return template;
              },
              // Custom callback function
              function (data) {
                app.custom.utils.log('AssignToAnalystByGroup:callback', data);
                data.gridData.clearSelection();
                data.gridData.select(data.itemRowEle);

                assignToAnalystByGroupButton.click();
          });
        }
      }

      // Update grid with pending grid task changes.
      app.custom.gridTasks.apply(gridData);
    }
  }

  /**
   * Initialize Custom Grid Tasks.
   */
  function initGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('custom.gridTasks:initGridTasks');
    }
    // Immediately attempt to populate grid tasks.
    populateGridTasks();
    // Subscribe to queryBuilderGridReady events to populate dynamics grids.
    app.events.subscribe('queryBuilderGridReady', populateGridTasks);
  }

  if (typeof app.custom.gridTasks !== 'undefined') {
    app.custom.gridTasks.ready(initGridTasks);
  } else {
    // Subscribe initGridTasks to gridTasks.Ready event once.
    $(app.events).one('gridTasks.Ready', initGridTasks);
  }
}());
