/*global $, _, app, console, document, kendo, performance, require, session, window */

/**
Load Custom Request Offering Task Builder
**/
require.config({
  waitSeconds: 0,
  urlArgs: 'v=' + ((typeof session !== 'undefined' && typeof session.staticFileVersion !== 'undefined') ? session.staticFileVersion : 894),
  baseUrl: '/Scripts/',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace',
  },
});

require([
  'CustomSpace/Scripts/serviceCatalog/roTaskBuilder',
], function (
  roTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('roTaskBuilder', performance.now());
  }

  function initTasks() {
    // Build out custom request offering tasks
    var roTaskVm = kendo.observable({
      /**
       * Wait until Angular has finished rendering and has
       * no outstanding $http calls before continuing. The specific Angular app
       * is determined by the rootSelector.
       *
       * Asynchronous.
       *
       * @param {string} rootSelector The selector housing an ng-app
       * @param {function(string)} callback callback. If a failure occurs, it will
       *     be passed as a parameter.
       */
      waitForAngular: function waitForAngular(rootSelector, callback) {
        'use strict';
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('waitForAngular', {
            rootSelector: rootSelector,
            callback: callback,
          });
        }
        
        angular.element(rootSelector).ready(callback);
      },
    });

    roTaskBuilder.build(roTaskVm, roTaskBuilder.node, function () {
      app.events.publish('roTasks.Ready');
    });
  }

  if (typeof angular !== 'undefined') {
      initTasks();
  } else {
    app.events.subscribe('angular.Ready', function execInitTasks(event) {
      initTasks();
      // Unsubscibe from further angular.Ready events
      app.events.unsubscribe(event.type + '.' + event.namespace, execInitTasks);
    });
  }
});
