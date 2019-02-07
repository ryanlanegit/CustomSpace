/*global $, _, angular, app, console, document, kendo, MutationObserver, performance, require, session, window */

/**
Load Custom Request Offering Task Builder
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
  'CustomSpace/Scripts/serviceCatalog/roTaskBuilder',
], function (
  roTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    console.log('roTaskMain', performance.now());
  }

  var roTaskVm = kendo.observable({
    /**
     * Wait until Angular has finished rendering and insert callback
     * into Angular's evalAsync queue.
     *
     * Asynchronous.
     *
     * @param {string} rootSelector The Angular element selector
     * @param {function(string)} callback callback.
     */
    waitForAngular: function waitForAngular(rootSelector, callback) {
      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
        console.log('waitForAngular', {
          rootSelector: rootSelector,
          callback: callback,
        });
      }

      angular.element(document).ready(function () {
        var angularElm = angular.element(rootSelector),
            angularScope = angularElm.scope();
        angularScope.$evalAsync(function () {
          callback(angularElm, angularScope);
        });
      });
    },
  });

  function initContainerStyles() {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('roTaskMain:initContainerStyles', performance.now());
    }
    var roPages = $('div.page-panel');
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
    // Return true if DOM was modified
    return (roPages.length > 0);
  }

  function initTasks(event) {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('roTaskMain:initTask', performance.now(), arguments);
    }
    // Unsubscibe from further angular.Ready events
    if(typeof event !== 'undefined') {
      app.events.unsubscribe(event.type + '.' + event.namespace, initTasks);
    }
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
