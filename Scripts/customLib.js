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

  /**
   * Adapted from Underscore 1.9.1
   * https://underscorejs.org/
   */
  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  /**
   * Adapted from Underscore 1.9.1
   * https://underscorejs.org/
   */
  var deepGet = function(obj, path) {
    var length = path.length,
        result = {};
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      result[path[i]] = obj[path[i]];
    }
    return length ? result : void 0;
  };

  /**
   * Updating val to introduce manual change event
   * https://stackoverflow.com/a/23635867
   */
  /*
  var originalVal = $.fn.val;
  $.fn.val = function() {
    var prev;
    if (arguments.length > 0) {
      prev = originalVal.apply(this, []);
    }
    var result = originalVal.apply(this, arguments);
    if (arguments.length > 0 && prev !== originalVal.apply(this, [])) {
      //$(this).change();  // OR with custom event $(this).trigger('value-changed')
      this.trigger('manual-change');
    }
    return result;
  };
  */

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
                templateElmView = new kendo.View(builtTemplate(), {
                  wrap: false,
                });

            //send popup element back to caller (appended in the callback)
            $('body').append(templateElmView.render());

            return templateElmView;
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
           * Callback to handle Dashboard Data results.
           *
           * @callback DataSourceCallback
           * @param {object[]} data - Dashboard Data array.
           */

          /**
           * Query Kendo DataSource
           * @param {object} dataSource - Kendo DataSource.
           * @param {boolean|string} method - Use (fetch|read) method for DataSource query.
           * @param {DataSourceCallback} [callback] - Callback function for returned data.
           * @returns {object} Ajax Promise or null.
           */
          queryDataSource: function queryDataSource(dataSource, method, callback, asArray) {
            /*
             * DataSource Query Methods:
             * 0|false|'read' : Read
             * 1|true|'fetch' : Fetch (default)
             */
            var options = {
                  asArray: true,
                },
                dataSourcePromise;

            if (typeof asArray !== 'undefined') {
              options.asArray = asArray;
            }
            if (method === 1 || method === true || method === 'fetch') {
              if (typeof callback !== 'undefined') {
                dataSourcePromise = dataSource.fetch(function () {
                  var data = this.data();
                  if (options.asArray) {
                    callback(data);
                  } else if (!_.isEmpty(data)) {
                    callback(data[0]);
                  } else {
                    callback(null);
                  }
                });
              } else {
                dataSourcePromise = dataSource.fetch();
              }
            } else {
              dataSourcePromise = dataSource.read();
              if (typeof callback !== 'undefined') {
                dataSourcePromise.then(function () {
                  var data = dataSource.data();
                  if (options.asArray) {
                    callback(data);
                  } else if (!_.isEmpty(data)) {
                    callback(data[0]);
                  } else {
                    callback(null);
                  }
                });
              }
            }

            return dataSourcePromise;
          },

          /**
           * Get API Result Data
           *
           * @param {object} options - Query data.
           * @param {function|object} [callback] Optional callback if not using promise.
           * @returns {object} Ajax Promise.
           */
          query: function query(options, callback) {
            _.defaults(options, {
              dataType: 'json',
              type: 'GET',
              cache: true,
            });

            switch (typeof callback) {
            case 'function':
              options.success = callback;
              break;
            case 'object':
              $.extend(options, callback);
              break;
            }
            return $.ajax(options);
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
         * Calculate a 32 bit FNV-1a hash
         * Found here: https://gist.github.com/vaiorabbit/5657561
         * Ref.: http://isthe.com/chongo/tech/comp/fnv/
         *
         * @param {string|object} str the input value
         * @param {boolean} [asString=false] set to true to return the hash value as
         *     8-digit hex string instead of an integer
         * @param {integer} [seed] optionally pass the hash of the previous chunk
         * @returns {integer | string}
         */
        createHash: function createHash(str, asString, seed) {
          /*jshint bitwise:false */
          switch (typeof str) {
          case 'object':
            str = JSON.stringify(str);
            break;
          case 'string':
            break;
          default:
            if (typeof str.toString === 'function') {
              str = str.toString();
            }
          }
          var i,
              l,
              hval = (seed === undefined) ? 0x811c9dc5 : seed;

          for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
          }
          if(asString){
            // Convert to 8 digit hex string
            return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
          }
          return hval >>> 0;
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
            app.custom.utils.log('customLib:isValidGUID', content);
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
                type: 'info',
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

          if (typeof type !== 'undefined') {
            options.type = type;
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
              var config = {
                    url: '/api/v3/workitem/GetChildWorkItems',
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(typeof parentIds === 'string' ? [parentIds] : parentIds),
                  },
                  getChildWorkItems = customLibVm.api.query(config, callback);

              return getChildWorkItems;
            },
          },

          Enum: {
            /**
             * Retrieves the displayname for an enumeration id in this format: Parent DisplayName\Child DisplayName.
             *
             * @param {string} enumid - The guid of the enumeration id.
             * @param {function|object} [callback] - Optional callback if not using promise.
             * @returns {object} Ajax Promise.
             */
            GetEnumDisplayName: function GetEnumDisplayName(enumId, callback) {
              var config = {
                    url: '/api/V3/Enum/GetEnumDisplayName',
                    data: {
                      Id: enumId,
                    },
                  },
                  getEnumDisplayName = customLibVm.api.query(config, callback);

              return getEnumDisplayName;
            },
          },

          Projection: {
            /**
             * Callback to handle Parent Work Item results.
             *
             * @callback ParentWICallback
             * @param {object[]} data - Dashboard Data array.
             */

            /**
             * Returns the SCSM settings for Parent Work Items.
             *
             * @example Basic usage.
             * // returns DataSource Ajax promise for query.
             * GetParentWorkItemSettings();
             * @example Basic usage with callback provided.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById(function (data) { console.log('data', data); });
             * @example Passing object specifying DataSource method to use.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById({method: 'fetch'});
             *
             * @param {ParentWICallback|object} [callback] - Callback function for returned data.
             * @param {ParentWICallback}        [callback.callback] - Callback function for returned data.
             * @param {object}                  [callback.config] - DataSource configuration object to extend default properties.
             * @param {boolean|string}          [callback.method] - Use (fetch|read) method for DataSource query.
             * @param {boolean|string}          [method] - Use (fetch|read) method for DataSource query.
             * @returns {?object} Ajax Promise or null.
             */
            GetParentWorkItemSettings : function GetParentWorkItemSettings(callback, method) {
              var options = {
                    /*
                     * DataSource Query Methods:
                     * 0|false|'read' : Read
                     * 1|true|'fetch' : Fetch (default)
                     */
                    method: 'fetch',
                  },
                  config = {
                    transport: {
                      read: {
                        url: '/api/V3/Projection/GetParentWorkItemSettings',
                      },
                    },
                  },
                  dataSource,
                  dataSourcePromise;

              switch (typeof callback) {
              case 'object':
                $.extend(true, options, callback);
                delete callback.method;
                if (typeof options.config !== 'undefined') {
                  $.extend(true, config, options.config);
                }
                break;
              case 'function':
                options.callback = callback;
                break;
              default:
                // Unsupported argument provided.
                return null;
              }

              if (typeof method !== 'undefined') {
                options.method = method;
              }

              dataSource = customLibVm.api.getDataSource('GetParentWorkItemSettings', config);
              dataSourcePromise = customLibVm.api.queryDataSource(dataSource, options.method, options.callback, false);

              return dataSourcePromise;
            },
          },

          Dashboard: {
            /**
             * Callback to handle Dashboard Data results.
             *
             * @callback DashboardCallback
             * @param {object[]} data - Dashboard Data array.
             */

            /**
             * A GET method that executes the provided query id and returns the result in json format.
             *
             * @example Basic usage with only queryId provided.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById('e10f55ae-c243-cce7-0fba-fc2288b4db63');
             * @example Basic usage with queryId and callback provided.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById('e10f55ae-c243-cce7-0fba-fc2288b4db63', function (data) { console.log('data', data); });
             * @example Passing data object.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById({queryId: 'e10f55ae-c243-cce7-0fba-fc2288b4db63', DomainGroupId: '56F5D8DB-1136-AF69-11E8-9935947BDAD9'});
             * @example Passing data object and specifying DataSource method to use.
             * // returns DataSource Ajax promise for query.
             * GetDashboardDataById({queryId: 'e10f55ae-c243-cce7-0fba-fc2288b4db63', DomainGroupId: '56F5D8DB-1136-AF69-11E8-9935947BDAD9', method: 'fetch'});
             *
             * @param {string|object}      queryId - Query's unique identification id as specified on DataSource table.
             * @param {string}             queryid.queryId - Query's unique identification id as specified on DataSource table.
             * @param {DashboardCallback} [queryid.callback] - Callback function for returned data.
             * @param {object}            [queryid.config] - DataSource configuration object to extend default properties.
             * @param {object}            [queryId.data] - Data object to set DataSource's transport read configuration.
             * @param {boolean|string}    [queryid.method] - Use (fetch|read) method for DataSource query.
             * @param {DashboardCallback} [callback] - Callback function for returned data.
             * @param {boolean|string}    [method] - Use (fetch|read) method for DataSource query.
             * @returns {?object} Ajax Promise or null.
             */
            GetDashboardDataById: function GetDashboardDataById(queryId, callback, method) {
              var options = {
                    /*
                     * DataSource Query Methods:
                     * 0|false|'read' : Read
                     * 1|true|'fetch' : Fetch (default)
                     */
                    method: 'fetch',
                  },
                  config = {
                    transport: {
                      read: {
                        url: '/api/V3/Dashboard/GetDashboardDataById',
                      },
                    },
                  },
                  dataSource,
                  dataSourcePromise;

              switch (typeof queryId) {
              case 'object':
                $.extend(true, options, queryId);
                delete queryId.method;
                if (typeof options.config !== 'undefined') {
                  $.extend(true, config, options.config);
                } else if (typeof options.data !== 'undefined') {
                  config.transport.read.data = options.data;
                } else {
                  config.transport.read.data = queryId;
                }
                break;
              case 'string':
                config.transport.read.data = {
                  queryId: queryId,
                };
                break;
              default:
                // Unsupported argument provided.
                return null;
              }

              if (typeof callback === 'function') {
                options.callback = callback;
              }

              if (typeof method !== 'undefined') {
                options.method = method;
              }

              dataSource = customLibVm.api.getDataSource('GetDashboardDataById.' + definition.createHash(config), config);
              dataSourcePromise = customLibVm.api.queryDataSource(dataSource, options.method, options.callback);

              return dataSourcePromise;
            },
          },
        },

        Search: {
          /**
           * A GET method that executes the provided query id and returns the result in json format.
           *
           * @param {string|object} queryId - The query's unique identification id as specified on DataSource table.
           * @param {function|object} [callback] Optional callback if not using promise.
           * @returns {object} Ajax Promise.
           */
          GetObjectProperties: function GetObjectProperties(id, callback) {
            var config = {
              url: '/Search/GetObjectProperties',
            };

            switch (typeof id) {
            case 'string':
              config.data = {
                id: id,
              };
              break;
            case 'object':
              config.data = id;
            }

            return customLibVm.api.query(config, callback);
          },

          /**
           * Retrieves Object properties based on provided projection.
           *
           * @param {string|object} queryId - The query's unique identification id as specified on DataSource table.
           * @param {function|object} [callback] Optional callback if not using promise.
           * @returns {object} Ajax Promise.
           */
          GetObjectPropertiesByProjection: function GetObjectPropertiesByProjection(projectionId, id, callback, method) {
            var options = {
                  /*
                   * DataSource Query Methods:
                   * 0|false|'read' : Read (default)
                   * 1|true|'fetch' : Fetch
                   */
                  method: 'read',
                },
                config = {
                  transport: {
                    read: {
                      url: '/Search/GetObjectPropertiesByProjection',
                    },
                  },
                },
                dataSource,
                dataSourcePromise;

            switch (typeof projectionId) {
            case 'object':
              $.extend(true, options, projectionId);
              if (typeof options.config !== 'undefined') {
                $.extend(true, config, options.config);
              } else if (typeof options.data !== 'undefined') {
                config.transport.read.data = options.data;
              } else {
                config.transport.read.data = _.omit(projectionId, 'method');
              }
              break;
            case 'string':
              config.transport.read.data = {
                projectionId: projectionId,
                id: id,
              };
              break;
            default:
              if (!_.isUndefined(app.custom.utils)) {
                app.custom.utils.log(2, 'customLib:GetObjectPropertiesByProjection',
                  'Warning! Invalid arguments provided', {
                    projectionId: projectionId,
                    id: id,
                    callback: callback,
                    method: method,
                  });
              }
              return null;
            }

            if (typeof callback === 'function') {
              options.callback = callback;
            }

            if (typeof method !== 'undefined') {
              options.method = method;
            }

            dataSource = customLibVm.api.getDataSource('GetObjectPropertiesByProjection.' + definition.createHash(config), config);
            dataSourcePromise = customLibVm.api.queryDataSource(dataSource, options.method, options.callback, false);

            return dataSourcePromise;
          },
        },

        /**
         * Adapted from Underscore 1.9.1
         * https://underscorejs.org/
         * Creates a function that, when passed an object, will traverse that object’s
         * properties down the given `path`, specified as an array of keys or indexes.
         */
        property: function(path) {
          if (!_.isArray(path)) {
            return shallowProperty(path);
          }
          return function(obj) {
            return deepGet(obj, path);
          };
        },
      };

  app.custom.customLib = definition;
  return definition;
});
