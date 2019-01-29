/*global $, _, app, console, performance, require, session */

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
    var roTaskVm = kendo.observable();
    roTaskBuilder.build(roTaskVm, roTaskBuilder.node, function () {
      app.events.publish('roTasks.Ready');
    });
  }

  if (app.isSessionStored()) {
    initTasks();
  } else {
    app.events.subscribe('sessionStorageReady', function execInitTasks() {
      initTasks();
      // Unsubscibe from further sessionStorage events
      app.events.unsubscribe('sessionStorageReady', execInitTasks);
    });
  }
});
