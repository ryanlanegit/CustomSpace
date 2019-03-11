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
 * @see module:roTaskBuilder
 */
require([
  'CustomSpace/Scripts/serviceCatalog/roTaskBuilder',
], function (
  roTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('roTaskMain');
  }

  /**
   * Initialize Request Offering Question/Task Default Container Classes
   * @returns {boolean} - DOM has been modified.
   */
  function initContainerStyles() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('roTaskMain:initContainerStyles');
    }
    var roPages = $('div.page-panel');
    if (roPages.length > 0) {
      roPages.each(function () {
        var roPage = $(this),
            roTaskElms = roPage.find('div.row').filter(function (index) {
              return app.custom.utils.isValidJSON($(this).text());
            }),
            roQuestionElms = roPage.find('div.question-container');

        // Add 'task-container' class to rows contains task JSON
        roTaskElms.addClass('task-container').children().addClass('task-container-content');

        // Set 100% Width for Display Rows
        roPage.find('.row:not(.question-container) .col-xs-12').removeClass('col-md-8').addClass('col-md-12');

        // Set 50% Width for Question Rows
        roQuestionElms.each(function () {
          var questionElm = $(this),
              questionContainer = questionElm.find('div.col-xs-12');
          if (questionContainer.hasClass('col-md-4') || questionContainer.hasClass('col-md-8')) {
            questionContainer.removeClass('col-md-4 col-md-8').addClass('col-md-6');
          }
        });
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * Initialize Request Offering Tasks using roTaskBuilder.
   */
  function initTasks() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('roTaskMain:initTask');
    }
    var roTaskVm = kendo.observable({});
    // Build out custom request offering tasks
    roTaskBuilder.build(roTaskVm, roTaskBuilder.node, function () {
      app.events.publish('roTasks.Ready');
    });
  }

  if (initContainerStyles()) {
    initTasks();
  } else {
    $(document).ready(function () {
      initContainerStyles();
      initTasks();
    });
  }
});
