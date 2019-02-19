/* global _, $, app, kendo, session */

/*
 * Custom Grid Tasks Config
 */

(function () {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('custom.gridTasks');
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
      // Adding background colors to the Priority column based on value.
      app.custom.gridTasks.add(gridData, 'Priority', 'style', '', function () {
        // Custom Priority Style Template
        var template =
          '# if (!_.isUndefined(Priority)) {' +
            'switch (Priority) {' +
              'case "4":' +
                '# #' +
                'break;' +
              'case "3":' +
                '# background-color:rgba(0, 255, 0, 0.25); #' +
                'break;' +
              'case "2":' +
              'case "Medium":' +
                '# background-color:rgba(255, 255, 0, 0.25); #' +
                'break;' +
              'case "1":' +
              'case "High":' +
                '# background-color:rgba(255, 0, 0, 0.25); #' +
                'break;' +
            '}' +
          '} #';

        return template;
      });

      // Adding custom internal and external links to the Title column with dynamic template and no callback.
      app.custom.gridTasks.add(gridData, 'Title', 'task', 'TitleLinks', function (column, task) {
        // Custom Title Links Task Template generated using Underscore templating
        var template =
          '# var url = app.gridUtils.getLinkUrl(data, "***");' +
          'if (!_.isUndefined(WorkItemType) && (WorkItemType === "System.WorkItem.Incident" || WorkItemType === "System.WorkItem.ServiceRequest")) {' +
            '# <%= app.custom.gridTasks.buildTemplate("link", column.field, task.name, wiLinkSettings) %> #' +
          '} else if ((!_.isUndefined(WorkItemType) && WorkItemType.indexOf("Activity") != -1)) {' +
            'var approvalUrl = app.gridUtils.getApprovalLinkUrl(data);' +
            '# <%= app.custom.gridTasks.buildTemplate("link", column.field, task.name, actLinkSettings) %> #' +
            '# <%= app.custom.gridTasks.buildTemplate("link", column.field, task.name, wiLinkSettings) %> #' +
          '} #' +
          '<%= app.custom.gridTasks.buildTemplate("link", column.field, task.name, defaultLinkSettings) %>';

        template = _.template(template, {
          column: column,
          task: task,
          wiLinkSettings: {
            href: '#= url #',
          },
          actLinkSettings: {
            icon: 'fa-check',
            href: '#= approvalUrl #',
          },
          defaultLinkSettings: {
            icon: 'fa-arrow-right',
            bClickPropagation: true,
            className: 'ra-highlight-default-icon',
            href: '#= url #',
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
          // Adding grid task to trigger AssignToAnalystByGroup with dynamic template and custom callback
          app.custom.gridTasks.add(gridData, 'AssignedUser', 'task', 'AssignToAnalystByGroup', function (column, task) {
            // Custom AssignToAnalystByGroup Task Template
            var template =
              '# if (!_.isUndefined(WorkItemType) && (WorkItemType === "System.WorkItem.Incident" || WorkItemType === "System.WorkItem.ServiceRequest")) {' +
                '# <%= app.custom.gridTasks.buildTemplate("task", column.field, task.name, taskSettings) %> #' +
              '} #';

            template = _.template(template, {
              column: column,
              task: task,
              taskSettings: {
                icon: 'fa-pencil',
                bClickPropagation: false,
              },
            });

            return template;
          }, function (data) {
            app.custom.utils.log('AssignToAnalystByGroup:callback', data);
            data.gridData.clearSelection();
            data.gridData.select(data.itemRowEle);

            assignToAnalystByGroupButton.click();
          });
        }
      }

      // Update grid with pending grid task changes.
      app.custom.gridTasks.updateGrid(gridData);
    }
  }

  /**
   * Initialize Custom Grid Tasks.
   *
   * @param {object} [event] - Object event object to unsubscribe from.
   */
  function initGridTasks(event) {
    // Immediately attempt to populate grid tasks.
    populateGridTasks();
    // Subscribe to queryBuilderGridReady to populate grid tasks dynamically.
    app.events.subscribe('queryBuilderGridReady', populateGridTasks);

    if (typeof event !== 'undefined') {
      // Unsubscribe from further sessionStorage events
      app.events.unsubscribe(event.type, initGridTasks);
    }
  }

  if (typeof app.custom.gridTasks !== 'undefined' && app.custom.gridTasks.isReady()) {
    initGridTasks();
  } else {
    app.events.subscribe('gridTasks.Ready', initGridTasks);
  }
}());
