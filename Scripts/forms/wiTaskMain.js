/* global $, _, app, require, session */

/**
 * Load Custom Work Item Task Builder
 */

/**
 * Uncomment when loading WiTaskMain directly through client unoptimized
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
 * Load Custom Work Items Tasks Builder
 * @module wiTaskMain
 * @see module:wiTaskBuilder
 */
require([
  'CustomSpace/Scripts/forms/wiTaskBuilder',
], function (
  wiTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('wiTaskMain:define');
  }

  /**
   *
   */
  function sortList(ulElement) {
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('wiTaskMain:sortList', ulElement);
    }
    ulElement = $(ulElement);

    var listitems = ulElement.children('li').get();
    listitems.sort(function (a, b) {
      return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    });
    _.each(listitems, function (listItem) {
      ulElement.append(listItem);
    });
  }

  /**
   *
   */
  function initTasks(pageForm) {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('wiTaskMain:initTasks', {
        pageForm: pageForm,
      });
    }

    var closedStatusIds = [
      'c7b65747-f99e-c108-1e17-3c1062138fc4', // Service Request Status Closed
      'bd0ae7c4-3315-2eb3-7933-82dfc482dbaf', // Incident Status Closed
      'f228d50b-2b5a-010f-b1a4-5c7d95703a9b', // Change Status Closed
      '25eac210-e091-8ae8-a713-fea2472f32ff', // Problem Status Closed
      '221155fc-ad9f-1e40-c50e-9028ee303137', // Release Record Status Closed
    ];

    // If Work item is New or Status is not closed then add tasks
    if (pageForm.newWI || closedStatusIds.indexOf(pageForm.viewModel.Status.Id) === -1) {
      // Build out custom Work Item tasks
      wiTaskBuilder.build(pageForm, function (view) {
        sortList(view);
        app.events.publish('wiTasks.Ready');
      });
    }
  }

  /**
   *
   */
  function boundReadyInitTasks(formObj) {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('wiTaskMain:boundReadyInitTasks', {
        formObj: formObj,
      });
    }
    formObj.boundReady(function () {
        initTasks(formObj);
    });
  }

  var supportedTypes = [
    'Incident',
    'ServiceRequest',
  ];
  _.each(supportedTypes, function (type) {
    app.custom.formTasks.add(type, null, boundReadyInitTasks);
  });
});
