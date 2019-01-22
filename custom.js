/*global $, _, app, console, performance, session, store, transformRO, window */

/**
Custom
**/

/*
  Custom Session Debugging
*/
app.storage.custom = store.namespace('custom');
// app.storage.custom.set('debug', true); // Enable DEBUG Mode via Console/Script/Plugin
// app.storage.custom.set('debug', false); // Disable DEBUG Mode via Console/Script/Plugin

if (app.storage.custom.get('DEBUG_ENABLED')) {
  console.log('DEBUG Mode Enabled', performance.now());
  (function () {
    'use strict';
    function debugEventSubscriber(e) {
      console.log(e.type + '.' + e.namespace, {
        performance: performance.now(),
        event: e,
      });
    }

    var debugEvents = [
      'sessionStorageReady',
      'dynamicPageReady',
      'boundReady.Ready',
      'requirejs.Ready',
      'angular.Ready',
      'gridTasks.Ready',
      'roTasks.Ready',
      'pageTasks.Ready',
      'wiTasks.Ready',
    ];
    
    app.events.subscribe(debugEvents.join(' '), debugEventSubscriber);
  }());
}

/*
  Custom Utilities
*/
app.custom.utils = {
  setDebugMode: function setDebugMode(enabled) {
    'use strict';
    console.log('setDebugMode', {enabled: enabled, this: this});
    app.storage.custom.set('DEBUG_ENABLED', enabled);
  },

  getCachedScript: function getCachedScript(url, options) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('getCachedScript', url);
    }
    options = $.extend(options || {}, {
      dataType: 'script',
      cache: true,
      url: url,
    });

    return $.ajax(options);
  },

  getCSS: function getCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('getCSS', url);
    }
    return $('<link>', {
      type: 'text/css',
      rel: 'stylesheet',
      href: url,
    }).appendTo('head');
  },

  isGuid: function isGuid(string) {
    'use strict';
    if (string[0] === '{') {
      string = string.substring(1, string.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(string);
  },

  sortList: function sortList(ulElement) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('sortList', ulElement);
    }
    ulElement = $(ulElement);

    var listitems = ulElement.children('li').get();
    listitems.sort(function (a, b) {
      return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    });
    _.each(listitems, function (listItem) { ulElement.append(listItem); });
  },

  stringFormat: function stringFormat(format) {
    'use strict';
    format = format.toString();
    if (arguments.length > 1) {
        var args = (typeof arguments[1] === 'string' || typeof arguments[1] === 'number') ? Array.prototype.slice.call(arguments, 1) : arguments[1],
            key;
        for (key in args) {
            if (args.hasOwnProperty(key)) {
                format = format.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
            }
        }
    }
    return format;
  },
};

if (window.location.pathname.indexOf('ServiceCatalog/RequestOffering') > -1) {
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('Custom:RequestOffering', performance.now());
  }

  app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/roTaskMain-built.min.js');

  app.events.subscribe('sessionStorageReady', function loadROToolbox(event) {
    'use strict';
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/custom.ROToolbox.js').done(function () {
      app.lib.mask.apply('Applying Request Offering Template');
      transformRO();
      app.lib.mask.remove();
    });
    // Unsubscribe from further sessionStorage events
    app.events.unsubscribe(event.type, loadROToolbox);
  });
} else if (window.location.pathname.indexOf('/Edit/') > -1 || window.location.pathname.indexOf('/New/') > -1) {
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('Custom:WorkItem', performance.now());
  }
  if (window.location.pathname.indexOf('Incident') > -1 || window.location.pathname.indexOf('ServiceRequest') > -1) {
    app.events.subscribe('requirejs.Ready', function loadWITaskMain(event) {
      'use strict';
      app.custom.utils.getCachedScript('/CustomSpace/Scripts/forms/wiTaskMain-built.min.js');
      // Unsubscribe from further requirejs events
      app.events.unsubscribe(event.type + '.' + event.namespace, loadWITaskMain);
    });
    /*
      Check Is Private In Action Log By Default
    */
    app.custom.formTasks.add('ServiceRequest', null, function (formObj) {
      'use strict';
      formObj.boundReady(function () {
        $('#actionLogisPrivate').trigger('click');
        $('.link[data-bind*=sendEmail]').on('click', function () {
          $('#IsAddToLog').trigger('click').closest('div').hide();
        });
      });
    });

    app.custom.formTasks.add('Incident', null, function (formObj) {
      'use strict';
      formObj.boundReady(function () {
        $('#actionLogisPrivate').trigger('click');
        $('.link[data-bind*=sendEmail]').on('click', function () {
          $('#IsAddToLog').trigger('click').closest('div').hide();
          $('#ChangeStatusToPending').closest('div').hide();
        });
      });
    });
  }
} else if (window.location.pathname.indexOf('/Page/') > -1) {
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('Custom:Page', performance.now());
  }

  app.events.subscribe('angular.Ready', function loadPageTaskMain(event) {
    'use strict';
    console.log(event.type + '.' + event.namespace + ':loadPageTaskMain', loadPageTaskMain, event);
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/page/pageTaskMain-built.min.js');
    // Unsubscribe from further angular events
    app.events.unsubscribe(event.type + '.' + event.namespace, loadPageTaskMain);
  });
} else if (window.location.pathname.indexOf('/View/') > -1) {
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('Custom:View', performance.now());
  }

  app.events.subscribe('requirejs.Ready', function loadGridTaskMain(event) {
    'use strict';
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
    // Unsubscribe from further requirejs events
    app.events.unsubscribe(event.type + '.' + event.namespace, loadGridTaskMain);
  });

  /*
    Custom Grid Tasks
  */
  app.events.subscribe('gridTasks.Ready', function populateGridTasks(event) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      console.log(event.type + '.' + event.namespace + ':event', {
        performance: performance.now(),
      });
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

      if (session.user.Analyst) {
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

    // Unsubscribe from further gridTasks events
    app.events.unsubscribe(event.type + '.' + event.namespace, populateGridTasks);
  });
} else {
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('Custom:Other', performance.now());
  }
}

/*
  Javascript Library Monitoring
*/
if (!_.isUndefined(window.requirejs)) {
  app.events.publish('requirejs.Ready');
} else {
  Object.defineProperty(window, 'requirejs', {
    configurable: true,
    enumerable: true,
    writeable: true,
    get: function () {
      'use strict';
      return this._requirejs;
    },
    set: function (val) {
      'use strict';
      this._requirejs = val;
      app.events.publish('requirejs.Ready');
    },
  });
}

if (!_.isUndefined(window.angular)) {
  app.events.publish('angular.Ready');
} else {
  Object.defineProperty(window, 'angular', {
    configurable: true,
    enumerable: true,
    writeable: true,
    get: function () {
      'use strict';
      return this._angular;
    },
    set: function (val) {
      'use strict';
      this._angular = val;
      app.events.publish('angular.Ready');
    },
  });
}

if (!_.isUndefined(window.pageForm) && !_.isUndefined(window.pageForm.boundReady)) {
  app.events.publish('boundReady.Ready');
} else {
  Object.defineProperty(window, 'pageForm', {
    configurable: true,
    enumerable: true,
    writeable: true,
    get: function () {
      'use strict';
      return this._pageForm;
    },
    set: function (val) {
      'use strict';
      this._pageForm = val;
      if (this._pageForm.boundReady !== undefined) {
        app.events.publish('boundReady.Ready');
      } else {
        Object.defineProperty(this._pageForm, 'boundReady', {
          configurable: true,
          enumerable: true,
          writeable: true,
          get: function () {
            return this._boundReady;
          },
          set: function (val) {
            this._boundReady = val;
            app.events.publish('boundReady.Ready');
          },
        });
      }
    },
  });
}
