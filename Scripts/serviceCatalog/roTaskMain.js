/* global $, _, angular, app, document, kendo, require, session */

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
 * Load Custom Request Offering Task Builder
 * @module roTaskMain
 * @see module:roTaskUtils
 * @see module:roTaskBuilder
 */
require([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
  'CustomSpace/Scripts/serviceCatalog/roTaskBuilder',
], function (
  roTaskUtils,
  roTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('roTaskMain');
  }

  /**
   * Initialize Request Offering Question/Task Default Container Classes
   */
  function initContainerStyles() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('roTaskMain:initContainerStyles');
    }
    var roPages = $('div.page-panel');
    if (roPages.length > 0) {
      roPages.each(function () {
        var roPageRows = $(this).children('.row'),
            roQuestionElms = roPageRows.filter('.question-container'),
            roDisplayElms = roPageRows.not(roQuestionElms),
            roTaskElms = roDisplayElms.filter(function () {
              return roTaskUtils.isValidJSON($(this).text());
            });
        // Set 50% width for question rows.
        roQuestionElms.children('.col-xs-12').filter('.col-md-4, .col-md-8').removeClass('col-md-4 col-md-8').addClass('col-md-6');
        // Set 100% width for display (non-question) rows.
        roDisplayElms.children('.col-xs-12').removeClass('col-md-8').addClass('col-md-12');
        // Add 'task-container' class to rows that contain task JSON.
        roTaskElms.addClass('task-container').children().addClass('task-container-content');
      });
    }
  }

  /**
   * Initialize Request Offering Tasks using roTaskBuilder.
   */
  function initTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('roTaskMain:initTask');
    }
    // Set row container styling
    initContainerStyles();
    // Build custom Request Offering Tasks
    roTaskBuilder.build(kendo.observable(), roTaskBuilder.node, function () {
      app.events.publish('roTasks.Ready');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTasks);
  } else {
    initTasks();
  }
});
