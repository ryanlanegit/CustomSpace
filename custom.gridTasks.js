/*global _, $, app, console, kendo, performance, session */

/**
Custom Grid Tasks Config
**/

(function () {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('custom.gridTasks', performance.now());
  }

  function populateGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('custom.gridTasks:populateGridTasks', performance.now());
    }
    var gridData = $('div[data-role="grid"]:first').data('kendoGrid');
    if (!_.isUndefined(gridData)) {
      // Adding background colors to the Priority column based on value.
      app.custom.gridTasks.add(gridData, 'Priority', 'style', '', function () {
        // Custom Priority Style Template
        var template =
          '# if (!_.isUndefined(Priority)) { ' +
            'switch (Priority) { ' +
              'case "4": ' +
                '# # ' +
                'break; ' +
              'case "3": ' +
                '# background-color:rgba(0, 255, 0, 0.25); # ' +
                'break; ' +
              'case "2": ' +
              'case "Medium": ' +
                '# background-color:rgba(255, 255, 0, 0.25); # ' +
                'break; ' +
              'case "1": ' +
              'case "High": ' +
                '# background-color:rgba(255, 0, 0, 0.25); # ' +
                'break; ' +
            '} ' +
          '} #';
        return template;
      });

      // Adding custom internal and external links to the Title column with dynamic template and no callback.
      app.custom.gridTasks.add(gridData, 'Title', 'task', 'TitleLinks', function (column, task) {
        // Custom Title Links Task Template
        var template =
          '# var url = app.gridUtils.getLinkUrl(data, "***"); ' +
          'if (!_.isUndefined(WorkItemType) && (WorkItemType==="System.WorkItem.Incident" || WorkItemType==="System.WorkItem.ServiceRequest")) { # ' +
            app.custom.gridTasks.buildTemplate('link', column.field, task.name, {
              href: '#=url#',
            }) +
          '# } else if ((!_.isUndefined(WorkItemType)&& WorkItemType.indexOf("Activity") != -1)) {' +
            'var approvalUrl = app.gridUtils.getApprovalLinkUrl(data); # ' +
            app.custom.gridTasks.buildTemplate('link', column.field, task.name, {
              icon: 'fa-check',
              href: '#=approvalUrl#',
            }) +
          '# } # ' +
          app.custom.gridTasks.buildTemplate('link', column.field, task.name, {
            icon: 'fa-arrow-right',
            bClickPropagation: true,
            className: 'ra-highlight-default-icon',
            href: '#=url#',
            target: '',
          });
        return template;
      });

      if (session.user.Analyst === 1) {
        // Adding grid task to trigger AssignToAnalystByGroup with dynamic template and custom callback
        app.custom.gridTasks.add(gridData, 'AssignedUser', 'task', 'AssignToAnalystByGroup', function (column, task) {
          // Custom AssignToAnalystByGroup Task Template
          var template =
            '# if (!_.isUndefined(WorkItemType) && (WorkItemType==="System.WorkItem.Incident" || WorkItemType==="System.WorkItem.ServiceRequest")) { #' +
              app.custom.gridTasks.buildTemplate('task', column.field, task.name, {
                icon: 'fa-pencil',
                bClickPropagation: false,
              }) +
            '# } #';
          return template;
        }, function (data) {
          console.log('AssignToAnalystByGroup:callback', data);
          data.gridData.clearSelection();
          data.gridData.select(data.itemRowEle);

          var assignToAnalystByGroupButton = $('li[data-bind*="click: analystByGroup"]').first();
          assignToAnalystByGroupButton.click();
        });
      }

      app.custom.gridTasks.updateGrid(gridData);
    }
  }

  if (typeof app.custom.gridTasks !== 'undefined' && app.custom.gridTasks.isReady()) {
    populateGridTasks();
  } else {
    app.events.subscribe('gridTasks.Ready', function execUpdateGrid(event) {
      populateGridTasks();
      // Unsubscribe from further gridTasks events
      app.events.unsubscribe(event.type + '.' + event.namespace, execUpdateGrid);
    });
  }
}());
