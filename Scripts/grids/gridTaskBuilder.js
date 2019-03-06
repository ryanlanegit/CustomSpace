/* global $, _, app, define, kendo, pageForm, window */

/**
 * Custom Grid Task Builder
 * @module gridTaskBuilder
 * @see module:gridTaskMain
 */
define([
  'CustomSpace/Scripts/grids/tasks/anchor/controller',
  'CustomSpace/Scripts/grids/tasks/link/controller',
  'CustomSpace/Scripts/grids/tasks/task/controller',
], function (
  anchorController,
  linkController,
  taskController
) {
  'use strict';
  var gridTaskModules = arguments,
      /**
       * @exports gridTaskBuilder
       */
      definition = {
        /**
         * Optional build callback type.
         *
         * @callback buildCallback
         * @param {Object} gridTasksVm - gridTask View Model.
         */

        /**
         * Build Grid Tasks.
         *
         * @param {buildCallback} [callback] - callback function once build is complete.
         */
        build: function build(callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('gridTaskBuilder:build');
          }
          /**
           * Get Grid Tasks View Model.
           */
          function getGridTasksViewModel() {
            var gridTasksVm = new kendo.observable({
              isReady: false,
              _readyDeferred: $.Deferred(),

              /**
               * Check if Grid Tasks is ready.
               *
               * @returns {object} Deferred promise.
               * @param {function} [fn] Optional deferred callback function.
               */
              ready: function ready(fn) {
                if (typeof fn === 'function') {
                  this._readyDeferred.then(fn);
                }
                return this._readyDeferred.promise();
              },

              /**
               * Add new Grid Task
               *
               * @param {object} gridData - Data object of kendoGrid to modify.
               * @param {string} field - Grid column's name to modify.
               * @param {string} type - Grid Task type [anchor/link/task].
               * @param {string} name - Unique Grid Task name.
               * @param {string} template - Kendo template string for column or attribute.
               * @param {function} [callback] - Optional callback if Grid Task type supports it.
               * @returns {this}
               */
              add: function add(gridData, field, type, name, template, callback) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('gridTasks:add', {
                    gridData: gridData,
                    field: field,
                    type: type,
                    name: name,
                    template: template,
                    callback: callback,
                  });
                }
                var that = this,
                    options = {},
                    taskTemplate;

                if (arguments.length > 2) {
                  options = {
                    field: field,
                    type: type,
                    name: name,
                    template: template,
                    callback: callback,
                  };
                } else {
                  if (typeof field === 'object') {
                    $.extend(options, field);
                  } else {
                    if (!_.isUndefined(app.storage.utils)) {
                      app.custom.utils.log(2, 'gridTasks:add', 'Warning! Invalid arguments supplied.');
                    }
                    return this;
                  }
                }

                // Validate options
                if (
                  _.isUndefined(options.field) ||
                  (
                    ['class','style'].indexOf(options.type) === -1 && _.isUndefined(options.name)
                  )
                ) {
                  if (!_.isUndefined(app.storage.utils)) {
                    app.custom.utils.log(2, 'gridTasks:add', 'Warning! Invalid arguments supplied.');
                  }
                  return this;
                }

                // Look for provided column in grid by field name
                var gridColumn = _.findWhere(gridData.columns, {field: options.field});
                if (!_.isUndefined(gridColumn)) {
                  if (_.isUndefined(gridColumn._tasks)) {
                    // Add empty tasks array to column template
                    Object.defineProperty(
                      gridColumn,
                      '_tasks', {
                        enumerable: false,
                        writable: true,
                        value: [],
                      }
                    );
                  }

                  switch (options.type) {
                  case 'class':
                    // Set class attribute to provided template.
                    taskTemplate = (typeof options.template === 'function') ? options.template(gridColumn) : options.template;
                    Object.defineProperty(
                      gridColumn.attributes,
                      '_class', {
                        enumerable: false,
                        writable: true,
                        value: taskTemplate,
                      }
                    );
                    if (typeof gridColumn.attributes.class === 'undefined') {
                      gridColumn.attributes.class = taskTemplate;
                    } else {
                      gridColumn.attributes.class = _.compact([gridColumn.attributes.class.replace(taskTemplate, ''), taskTemplate]).join(' ');
                    }

                    // Fix previous uses of template in saved grid state.
                    if (typeof gridColumn.template !== 'undefined' && options.field === 'Priority') {
                        var gridId = gridData.element.attr('Id'),
                            gridNode = _.findWhere(app.storage.viewPanels.session.get('all'), {Id: gridId});
                        if (!_.isUndefined(gridNode)) {
                          var columnDefinition = _.findWhere(gridNode.Definition.content.grid.columns, {field: options.field});
                          if (!_.isUndefined(columnDefinition)) {
                            if (typeof columnDefinition.template === 'undefined') {
                              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                                app.custom.utils.log('gridTasks:add', "Removing previous template for '" + options.field + "'.");
                              }
                              delete gridColumn.template;
                            } else {
                              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                                app.custom.utils.log('gridTasks:add', "Resetting previous template for '" + options.field + "'.");
                              }
                              gridColumn.template = columnDefinition.template;
                            }
                          }
                        }
                    }
                    break;
                  case 'style':
                    // Set style attribute to provided template.
                    taskTemplate = (typeof options.template === 'function') ? options.template(gridColumn) : options.template;
                    Object.defineProperty(
                      gridColumn.attributes,
                      '_style', {
                        enumerable: false,
                        writable: true,
                        value: taskTemplate,
                      }
                    );
                    if (typeof gridColumn.attributes.style === 'undefined') {
                      gridColumn.attributes.style = taskTemplate;
                    } else {
                      gridColumn.attributes.style = _.compact([gridColumn.attributes.style.replace(taskTemplate, ''), taskTemplate]).join(' ');
                    }
                    break;
                  case 'task':
                    var existingTask = that.get(gridData, options.field, options.name);
                    if (existingTask) {
                      // Merge new task with existing one in the column template
                      $.extend(existingTask, options);
                    } else {
                      // Add new task to the column template
                      gridColumn._tasks.push(options);
                    }
                    break;
                  }
                } else {
                  if (!_.isUndefined(app.storage.utils)) {
                    app.custom.utils.log(2, 'gridTasks:add', "Warning! Unable to find field '" + options.field + "'.");
                  }
                }

                return this;
              },

              /**
               * Get existing Grid Task by Field and Name in kendoGrid.
               *
               * @param {object} gridData - Data object of kendoGrid to query.
               * @param {string} field - Grid column's name to modify.
               * @param {string} name - Grid Task name.
               * @returns {object|null} - Grid Task object, or null if not found.
               */
              get: function get(gridData, field, name) {
                // Look for provided column in grid by field name
                var gridColumn = _.findWhere(gridData.columns, {field: field});
                if (!_.isUndefined(gridColumn)) {
                  if (_.isUndefined(name)) {
                    // Return all tasks for the provided field
                    return gridColumn._tasks;
                  } else {
                    // Look for the specific task named in the provided field
                    var gridTask = _.findWhere(gridColumn._tasks, {name: name});
                    if (!_.isUndefined(gridTask)) {
                      // Return the specific task in the provided field
                      return gridTask;
                    } else {
                      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                        app.custom.utils.log(2, 'gridTasks:get', "Warning! Unable to find task '" + name + "' in field '" + field + "'.");
                      }
                      return null;
                    }
                  }
                } else {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log(2, 'gridTasks:get', 'Warning! Unable to find field:', field);
                  }
                  return null;
                }
              },

              /**
               * Grid Task Callback Handler
               *
               * @param {object} event - Click event object.
               * @param {object} itemEle - Element clicked.
               * @param {boolean} bClickPropagation - Determines if click event should propagate.
               */
              callback: function callback(event, itemEle, bClickPropagation) {
                var item = $(itemEle),
                    gridData = item.closest('div[data-role="grid"]').data('kendoGrid'),
                    itemData = item.data(),
                    itemRowEle = item.closest('tr').get(0),
                    dataItem = gridData.dataItem(itemRowEle),
                    existingTask = this.get(gridData, itemData.field, itemData.task),
                    data = {
                      event: event,
                      gridData: gridData,
                      itemData: itemData,
                      itemRowEle: itemRowEle,
                      dataItem: dataItem,
                    };
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('gridTasks:callback', {
                    data: data,
                  });
                }

                if (existingTask) {
                  // Stop click propagation for jQuery click events if requested
                  if (!bClickPropagation) {
                    event.stopPropagation();
                  }

                  if (typeof existingTask.callback === 'function') {
                    existingTask.callback(data);
                  }
                } else {
                  if (!_.isUndefined(app.storage.utils)) {
                    app.custom.utils.log(2, 'gridTasks:callback', 'Unable to find task for callback.');
                  }
                }
              },

              /**
               * Apply Grid Tasks to provided kendoGrid data object.
               *
               * @param {object} gridData - Data object of kendoGrid to update.
               * @returns {this}
               */
              apply: function apply(gridData) {
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('gridTasks:apply', {
                    gridData: gridData,
                  });
                }
                var that = this,
                    bUpdateGridTemplate = false;

                _.each(gridData.columns, function (column) {
                  if (typeof column._tasks !== 'undefined') {
                    if (column._tasks.length > 0) {
                      column.template = that.buildTemplate('anchor', column);
                    }
                    bUpdateGridTemplate = true;
                  }
                });

                if (bUpdateGridTemplate) {
                  // Update grid row templates if custom tasks/styles are added
                  gridData.rowTemplate = gridData._tmpl(gridData.options.rowTemplate, gridData.columns);
                  gridData.altRowTemplate = gridData._tmpl(gridData.options.altRowTemplate || gridData.options.rowTemplate, gridData.columns);

                  // Refresh grid to show column template changes
                  if (gridData.element.find('.k-loading-mask').length == 0) {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                      app.custom.utils.log('gridTasks:apply', 'Refresh Grid');
                    }
                    gridData.refresh();
                  } else {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                      app.custom.utils.log('gridTasks:apply', 'Patch Grid Columns');
                    }
                    gridData._updateCols();
                  }
                }

                return this;
              },

              /**
               * Create Kendo template string based on Grid Task templating.
               *
               * @param {string} type - Grid Task type [anchor/link/task].
               * @param {string} field - Grid column's name.
               * @param {string} name - Grid Task name.
               * @param {string} options - Grid Task options.
               * @returns {string|null} Kendo template string or null if task type not found.
               */
              buildTemplate: function buildTemplate(type, field, name, options) {
                var gridTask = _.find(gridTaskModules, function (gridTask) {
                  return _.isUndefined(gridTask.task) ? false : (gridTask.task.Task.toLowerCase() === type.toLowerCase());
                });

                if (!_.isUndefined(gridTask)) {
                  return gridTask.build(field, name, options);
                } else {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log(2, 'Property Not Found For Rendering:', type);
                  }
                  return null;
                }
              },
            });

            return gridTasksVm;
          }

          /**
           * Initialize Custom Grid Task Builder.
           */
          function initGridTasks() {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('gridTaskBuilder:initGridTasks');
            }
            var gridTasksVm = getGridTasksViewModel(),
                supportedWITypes = [
                  'Incident',
                  'Problem',
                  'ChangeRequest',
                  'ServiceRequest',
                ];

            /**
             * Resolve deferred ready function queue.
             * gridTaskmain module will publish 'gridTasks.Ready' event.
             */
            function publishGridTasksReady() {
              gridTasksVm.isReady = true;
              gridTasksVm._readyDeferred.resolve();
            }

            // Wait for dynamicPageReady event to trigger gridTasks.Ready event on View or Page path
            $(app.events).one('dynamicPageReady', publishGridTasksReady);

            /**
             * Resolve Grid Tasks ready state on Page Form ready.
             *
             * @param {object} formObj - Page Form Object.
             */
            function initWICustomTask(formObj) {
              formObj.boundReady(publishGridTasksReady);
            }

            _.each(supportedWITypes, function (type) {
              app.custom.formTasks.add(type, null, initWICustomTask);
            });

            if (typeof callback === 'function') {
              callback(gridTasksVm);
            }

            return gridTasksVm;
          }

          return initGridTasks();
        },
      };

  return definition;
});
