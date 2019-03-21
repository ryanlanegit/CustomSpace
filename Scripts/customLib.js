/* global $, _, angular, app, define, document, kendo, Object, session */

/**
 * Portal API Function Library
 * @module customLib
 */
define([
  'text!Scripts/forms/popups/notificationPopup/view.html',
], function (
  notificationTemplate
) {
  'use strict';

  var customLibVm = {
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

        data: {},

        api: {
          /**
           * Get Kendo DataSource
           *
           * @param {string} key - DataSource key.
           * @param {object} config - DataSource config.
           */
          getDataSource: function getDataSource(key, config) {
            if (key.indexOf('/') > -1) {
              key = _.chain(key.split('/')).compact().last().value();
            }
            if (typeof customLibVm.data[key] === 'undefined') {
              var dataSourceConfig = {
                serverFiltering: false,
                transport: {
                  read: {
                    dataType: 'json',
                    type: 'GET',
                  },
                },
                schema: {
                  /**
                   * Return Non-Array Result an Array of Length 1.
                   */
                  data: function (response) {
                    return (Object.prototype.toString.call(response) === '[object Array]') ? response : [response];
                  },
                },
              };

              $.extend(true, dataSourceConfig, config);
              customLibVm.data[key] = new kendo.data.DataSource(dataSourceConfig);
            }

            return customLibVm.data[key];
          },

          /**
           * Get API Result Data
           *
           * @param {object} options - Query data.
           * @param {function|object} [callback] Optional callback if not using promise.
           * @returns {object} Ajax Promise.
           */
          query: function query(options, callback) {
            var ajaxOptions = {
              dataType: 'json',
              type: 'GET',
              cache: true,
            };
            $.extend(ajaxOptions, options);

            switch (typeof callback) {
            case 'function':
              $.extend(ajaxOptions, {
                success: callback,
              });
              break;
            case 'object':
              $.extend(ajaxOptions, callback);
              break;
            }
            return $.ajax(ajaxOptions);
          },
        },
      },
      /**
       * @exports customLib
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
         * Validate if a given string is a valid GUID.
         *
         * @example
         * // returns true
         * isValidGUID('12604183-1B96-908C-DADE-B46EB8CDF4F9');
         *
         * @param {object|string} content - GUID string to validate.
         * @returns {boolean} Provided string is a valid GUID.
         */
        isValidGUID: function isValidGUID(content) {
          if (app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTaskUtils:isValidGUID', content);
          }
          content = content.toString();
          var rx_one = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi,
              rx_braces = /(^{|}$)/gi;
          return rx_one.test(
            content
              .replace(rx_braces, '')
          );
        },

        /**
         * Validate if a given string is a valid GUID.
         * @see {@link https://github.com/douglascrockford/JSON-js/blob/master/json2.js|JSON-js}
         * @example
         * // returns true
         * isValidJSON('{"bindHash": {"param" : "request"}}');
         *
         * @param {object|string} content - JSON string to validate.
         * @returns {boolean} Provided string is a valid JSON string.
         */
        isValidJSON: function isValidJSON(content) {
          // Regex Check For Valid JSON based on https://github.com/douglascrockford/JSON-js/blob/master/json2.js
          var rx_one = /^[\],:{}\s]*$/,
            rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            rx_four = /(?:^|:|,)(?:\s*\[)+/g;

          return rx_one.test(
            content
              .replace(rx_two, '@')
              .replace(rx_three, ']')
              .replace(rx_four, '')
          );
        },

        /**
         * Create Kendo popup notification.
         *
         * @param {object|function|number} message - Popup message.
         * @param {string} type - Notification template type.
         */
        createPopupNotification: function createPopupNotification(message, type) {
          if (_.isUndefined(customLibVm.notificationView)) {
            customLibVm.notificationView = customLibVm.buildAndRender.template(notificationTemplate);
          }
          var popupNotification = customLibVm.notificationView.element.getKendoNotification('kendoNotification'),
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
            popupNotification = customLibVm.notificationView.element.kendoNotification({
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

        api: {
          /**
           * Get Kendo DataSource by URL.
           *
           * @param {string} key - DataSource URl used as key for lookup.
           * @param {object} config - Optional key.id.
           */
          getDataSource: function getDataSource(key, config) {
            var dataSource = customLibVm.api.getDataSource(key, config);
            return dataSource;
          },

          WorkItem: {
            /**
             * Get Enumeration Display Name
             *
             * @param {string} enumid -  GUID of Enumeration
             * @param {function|object} [callback] Optional callback if not using promise.
             * @returns {object} Ajax Promise.
             */
            GetChildWorkItems: function GetChildWorkItems(parentIds, callback) {
              var getChildWorkItems = customLibVm.api.query({
                  url: '/api/v3/workitem/GetChildWorkItems',
                  type: 'POST',
                  contentType: 'application/json; charset=utf-8',
                  data: JSON.stringify(typeof parentIds === 'string' ? [parentIds] : parentIds),
                },
                callback
              );

              return getChildWorkItems;
            },
          },

          Enum: {
            /**
             * Get Enumeration Display Name
             *
             * @param {string} enumid -  GUID of Enumeration
             * @param {function|object} [callback] Optional callback if not using promise.
             * @returns {object} Ajax Promise.
             */
            GetEnumDisplayName: function GetEnumDisplayName(enumId, callback) {
              var getEnumDisplayName = customLibVm.api.query({
                  url: '/api/V3/Enum/GetEnumDisplayName',
                  data: {
                    Id: enumId,
                  },
                },
                callback
              );
              return getEnumDisplayName;
            },
          },

          Projection: {
            /**
             * Get Parent Work Item Settings
             * @param {function|object} [callback] Optional callback if not using promise.
             */
            GetParentWorkItemSettings : function GetParentWorkItemSettings(callback) {
              var options = {
                    fetch: true,
                  },
                  dataSource = customLibVm.api.getDataSource('GetParentWorkItemSettings', {
                    transport: {
                      read: {
                        url: '/api/V3/Projection/GetParentWorkItemSettings',
                      },
                    },
                  }),
                  dataSourcePromise;
              switch (typeof callback) {
              case 'function':
                dataSourcePromise = dataSource.read();
                dataSourcePromise.then(function () {
                  var data = dataSource.data();
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
                    dataSourcePromise = dataSource.fetch(function () {
                      var data = this.data();
                      if (data.length) {
                        options.callback(data[0]);
                      } else {
                        callback(null);
                      }
                    });
                  } else {
                    dataSourcePromise = dataSource.fetch();
                  }
                } else {
                  dataSourcePromise = dataSource.read();
                }
                break;
              default:
                dataSourcePromise = dataSource.read();
              }

              return dataSourcePromise;
            },
          },
        },
      };

  app.custom.customLib = definition;
  return definition;
});
