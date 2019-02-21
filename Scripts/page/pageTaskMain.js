/*global $, _, app, require, session */

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
    app.custom.utils.log('pageTaskBuilder:define');
  }

  /**
   * Initialize Custom Page Tasks.
   */
  function initPageTasks() {
    // Build out custom request offering tasks
    pageTaskBuilder.build($('div#main_wrapper'), pageTaskBuilder.node, function () {
      app.events.publish('pageTasks.Ready');
    });
  }

  if (app.isSessionStored()) {
    initPageTasks();
  } else {
    // Subscribe initPageTasks to sessionStorageReady event once.
    $(app.events).one('sessionStorageReady', initPageTasks);
  }
});
