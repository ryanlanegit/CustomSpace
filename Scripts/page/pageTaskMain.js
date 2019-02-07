/*global $, _, app, console, performance, require, session */

/**
Load Custom Page Task Builder
**/

/**
 * Uncomment when loading gridTaskmain directly through client unoptimized
**/
/*
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
*/

require([
  'CustomSpace/Scripts/page/pageTaskBuilder',
], function (
  pageTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('pageTaskBuilder', performance.now());
  }

  function initTasks() {
    // Build out custom request offering tasks
    pageTaskBuilder.build($('div#main_wrapper'), pageTaskBuilder.node, function () {
      app.events.publish('pageTasks.Ready');
    });
  }

  if (app.isSessionStored()) {
    initTasks();
  } else {
    app.events.subscribe('sessionStorageReady', function execInitTasks() {
      initTasks();
      // Unsubscribe from further sessionStorage events
      app.events.unsubscribe('sessionStorageReady', execInitTasks);
    });
  }
});
