/* global $, _, angular, app, define, document, kendo, Object, session */

/**
 * Work Item Task Utility Function Library
 * @module wiTaskLib
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define(function () {
  'use strict';

  var wiTaskLibVm = {
      },
      /**
       * @exports wiTaskLib
       */
      definition = {
        /**
         * Query if Work Item is assigned to currently logged in user.
         */
        isAssignedToMe: function isAssignedToMe(viewModel) {
          var assignedUserId = viewModel.AssignedWorkItem.get('BaseId');
          return (assignedUserId === session.user.Id);
        },
      };

  app.custom.wiTaskLib = definition;
  return definition;
});
