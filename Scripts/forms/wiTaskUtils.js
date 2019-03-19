/* global $, _, angular, app, define, document, kendo, session */

/**
 * Work Item Task Utility Function Library
 * @module wiTaskUtils
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define([
  'text!forms/popups/notificationPopup/view.html',
], function (
  notificationTemplate
) {
  'use strict';

  var wiTaskUtilsVm = {
        buildAndRender: {
          /**
           * Build provided template and append to body.
           *
           * @param {object} template - Template to render.
           * @returns {object} Kendo view of rendered object.
           */
          template: function template (template) {
            var builtTemplate = _.template(template),
                templateElm = new kendo.View(builtTemplate(), {
                  wrap: false,
                });

            //send popup element back to caller (appended in the callback)
            $('body').append(templateElm.render());

            return templateElm;
          },
        },

        data: {
          /**
           * Parent Work Item Settings Data Source
           */
          GetParentWorkItemSettings : new kendo.data.DataSource({
            serverFiltering: false,
            transport: {
              read: {
                url: '/api/V3/Projection/GetParentWorkItemSettings',
                dataType: 'json',
                type: 'GET',
              },
            },
            schema: {
              /**
              * Return Non-Array Result an Array of Length 1.
              */
              data: function (response) {
                return [response];
              },
            },
          }),
        },
      },
      /**
       * @exports wiTaskUtils
       */
      definition = {
        /**
         * Format a string expression with
         *
         * @example
         * // returns '1: String'
         * stringFormat('{0}: {1}', '1', 'String');
         * @example
         * // returns '2: Array'
         * stringFormat('{0}: {1}', ['2', 'Array']);
         * @example
         * // returns '3: Object'
         * stringFormat('{key1}: {key2}', {key1: '3', key2: 'Object'});
         *
         * @param {string} format - String expression with placeholders.
         * @param {...string|string[]|object} content - Placeholder values.
         * @returns {string} Formatted string.
         */
        stringFormat: function stringFormat(format, content) {
          format = format.toString();
          if (arguments.length > 1) {
            var args = (typeof content === 'string' || typeof content === 'number') ? _.toArray(arguments).slice(1) : content;
            _.each(args, function (val, key) {
              format = format.replace(new RegExp('\\{' + key + '\\}', 'gi'), val);
            });
          }
          return format;
        },

        /**
         * Create Kendo popup notification.
         *
         * @param {object|function|number} message - Popup message.
         * @param {string} type - Notification template type.
         */
        createPopupNotification: function createPopupNotification(message, type) {
          if (_.isUndefined(wiTaskUtilsVm.notificationView)) {
            wiTaskUtilsVm.notificationView = wiTaskUtilsVm.buildAndRender.template(notificationTemplate);
          }
          var popupNotification = wiTaskUtilsVm.notificationView.element.getKendoNotification('kendoNotification'),
              options = {
                type: type || 'info',
                message: '',
              };

          switch(typeof message) {
          case 'object':
            $.extend(options, message);
            break;
          case 'function':
            options.message = message().toString();
            break;
          default:
            options.message = message.toString();
          }

          if (!_.isUndefined(popupNotification)) {
            popupNotification.hide();
          } else {
            popupNotification = wiTaskUtilsVm.notificationView.element.kendoNotification({
              templates: [{
                type: 'success',
                template:
                  '<div class="#= type # k-ext-dialog-content">' +
                    '<div class="k-ext-dialog-icon fa fa-check"></div>' +
                    '<div class="k-ext-dialog-message">#= message #</div>' +
                  '</div>',
              },{
                type: 'warning',
                template:
                  '<div class="#= type # k-ext-dialog-content">' +
                    '<div class="k-ext-dialog-icon fa fa-warning"></div>' +
                    '<div class="k-ext-dialog-message">#= message #</div>' +
                  '</div>',
              },{
                type: 'info',
                template:
                  '<div class="#= type # k-ext-dialog-content">' +
                    '<div class="k-ext-dialog-icon fa fa-info-circle"></div>' +
                    '<div class="k-ext-dialog-message">#= message #</div>' +
                  '</div>',
              }],
            }).data('kendoNotification');
          }

          popupNotification.show(options, options.type);
        },

        /**
         * Query if Work Item is assigned to currently logged in user.
         */
         isAssignedToMe: function isAssignedToMe(viewModel) {
           var assignedUserId = viewModel.AssignedWorkItem.get('BaseId');
           return (assignedUserId === session.user.Id);
         },

         api: {
           /**
            * Get Parent Work Item Settings
            * @param {function|object} [callback] Optional callback if not using promise.
            */
           GetParentWorkItemSettings : function GetParentWorkItemSettings(callback) {
             var options = {
                   fetch: true,
                 },
                 dataSourcePromise;
             switch (typeof callback) {
             case 'function':
               dataSourcePromise = wiTaskUtilsVm.data.GetParentWorkItemSettings.read();
               dataSourcePromise.then(function () {
                 var data = wiTaskUtilsVm.data.GetParentWorkItemSettings.data();
                 if (data.length) {
                   callback(data[0]);
                 } else {
                   callback(null);
                 }
               });
               break;
             case 'object':
               $.extend(options, callback);
               if (options.fetch) {
                 if (typeof options.callback === 'function') {
                   dataSourcePromise = wiTaskUtilsVm.data.GetParentWorkItemSettings.fetch(function () {
                     var data = this.data();
                     if (data.length) {
                       options.callback(data[0]);
                     } else {
                       callback(null);
                     }
                   });
                 } else {
                   dataSourcePromise = wiTaskUtilsVm.data.GetParentWorkItemSettings.fetch();
                 }
               } else {
                 dataSourcePromise = wiTaskUtilsVm.data.GetParentWorkItemSettings.read();
               }
               break;
             }

             return dataSourcePromise;
           },

           /**
            * Get Enumeration Display Name
            *
            * @param {string} enumid -  GUID of Enumeration
            * @param {function|object} [callback] Optional callback if not using promise.
            * @returns {object} Ajax Promise.
            */
           GetEnumDisplayName: function GetEnumDisplayName(enumId, callback) {
             var options = {
               url: '/api/V3/Enum/GetEnumDisplayName',
               dataType: 'json',
               type: 'GET',
               cache: true,
               data: {
                 Id: enumId,
               },
             };
             switch (typeof callback) {
             case 'function':
               $.extend(options, {
                 success: callback,
               });
               break;
             case 'object':
               $.extend(options, callback);
               break;
             }
             return $.ajax(options);
            },
          },
      };

  app.custom.wiTaskUtils = definition;
  return definition;
});
