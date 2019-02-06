/*global _, app, console, performance, require, session */

/**
Load Custom Grid Task Builder
**/
if (typeof require !== 'undefined') {
  require.config({
    waitSeconds: 0,
    urlArgs: 'v=' + ((typeof session !== 'undefined' && typeof session.staticFileVersion !== 'undefined') ? session.staticFileVersion : 894),
    baseUrl: '/Scripts/',
    paths: {
      'text': 'require/text',
      'CustomSpace': '../CustomSpace',
    },
  });
}

require([
  'CustomSpace/Scripts/grids/gridTaskBuilder',
], function (
  gridTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('gridTaskMain:define', performance.now());
  }

  function initGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('gridTaskMain:initGridTasks', performance.now());
    }

    gridTaskBuilder.build(function () {
      app.events.subscribe('dynamicPageReady', function publishGridTasksReady() {
        app.events.publish('gridTasks.Ready');
        // Unsubscibe from further dynamicPage events
        app.events.unsubscribe('dynamicPageReady', publishGridTasksReady);
      });
    });
  }

  initGridTasks();
});
