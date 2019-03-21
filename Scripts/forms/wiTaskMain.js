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
  'CustomSpace/Scripts/forms/formTasksLib',
  'CustomSpace/Scripts/forms/wiTaskBuilder',
], function (
  formTasksLib,
  wiTaskBuilder
) {
  'use strict';
  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.log('wiTaskMain:define');
  }

  /**
   * Sort UL List.
   *
   * @param {object} ulElement - UL elememnt to sort.
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
   * Work Item Tasks initialization script.
   *
   * @param {object} pageForm - Page Form Kendo View Model.
   */
  function initTasks(pageForm) {
    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('wiTaskMain:initTasks', {
        pageForm: pageForm,
      });
    }

    var closedStatusIds = _.chain(app.constants.workItemStatuses)
      .pluck('Closed')
      .compact()
      .value();

    // If Work item is New or Status is not closed then add tasks
    if (pageForm.newWI || closedStatusIds.indexOf(pageForm.viewModel.Status.Id) === -1) {
      // Build out custom Work Item tasks
      wiTaskBuilder.build(pageForm, function (view) {
        sortList(view);
        app.events.publish('wiTasks.Ready');
      });
    }
  }

  formTasksLib.add({
    types: [
      'Incident',
      'ServiceRequest',
    ],
    func: initTasks,
  });
});
