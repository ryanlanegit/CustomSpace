/* global _, app, require, session */

/*
 * Load Custom Grid Task Builder
 */

/*
 * Uncomment when loading gridTaskmain directly through client unoptimized
 */
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

/**
 * Load Custom Grid Tasks Builder
 * @module gridTaskMain
 * @see module:gridTaskBuilder
 */
require([
  'CustomSpace/Scripts/grids/gridTaskBuilder',
], function (
  gridTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('gridTaskMain:define');
  }

  /**
   * Initialize Grid Tasks using gridTaskBuilder.
   */
  function initGridTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('gridTaskMain:initGridTasks');
    }
    // Build custom Grid Tasks
    gridTaskBuilder
      .build(function(gridTasksVm) {
        app.custom.gridTasks = gridTasksVm;
      })
      .ready(function () {
        app.events.publish('gridTasks.Ready');
      });
  }

  initGridTasks();
});
