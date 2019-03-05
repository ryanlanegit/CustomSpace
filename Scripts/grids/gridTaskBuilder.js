/* global $, _, app, define, kendo */

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
         * @param {Object} gridTaskVm - gridTask View Model.
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
            var gridTaskVm = new kendo.observable({
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
                    // Look for provided column in grid by field name
                    taskColumn = _.findWhere(gridData.columns, {field: field}),
                    taskClass,
                    taskStyle;

                if (!_.isUndefined(taskColumn)) {
                  if (_.isUndefined(taskColumn._tasks)) {
                    // Add empty tasks array to column template
                    Object.defineProperty(
                      taskColumn,
                      '_tasks', {
                        enumerable: false,
                        writable: true,
                        value: [],
                      }
                    );
                  }

                  switch (type) {
                  case 'class':
                    // Set class attribute to provided template.
                    taskClass = (typeof template === 'function') ? template(taskColumn) : template;
                    Object.defineProperty(
                      taskColumn.attributes,
                      '_class', {
                        enumerable: false,
                        writable: true,
                        value: taskClass,
                      }
                    );
                    if (typeof taskColumn.attributes.class === 'undefined') {
                      taskColumn.attributes.class = taskClass;
                    } else {
                      taskColumn.attributes.class = _.compact([taskColumn.attributes.class.replace(taskClass, ''), taskClass]).join(' ');
                    }
                    
                    // Fix previous uses of template in saved grid state.
                    if (typeof taskColumn.template !== 'undefined' && field === 'Priority') {
                        var gridId = gridData.element.attr('Id'),
                            gridNode = _.findWhere(app.storage.viewPanels.session.get('all'), {Id: gridId});
                        if (!_.isUndefined(gridNode)) {
                          var columnDefinition = _.findWhere(gridNode.Definition.content.grid.columns, {field: field});
                          if (!_.isUndefined(columnDefinition)) {
                            if (typeof columnDefinition.template === 'undefined') {
                              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                                app.custom.utils.log('gridTasks:add', "Removing previous template for '" + field + "'.");
                              }
                              delete taskColumn.template;
                            } else {
                              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                                app.custom.utils.log('gridTasks:add', "Resetting previous template for '" + field + "'.");
                              }
                              taskColumn.template = columnDefinition.template;
                            }
                          }
                        }
                    }
                    break;
                  case 'style':
                    // Set style attribute to provided template.
                    taskStyle = (typeof template === 'function') ? template(taskColumn) : template;
                    Object.defineProperty(
                      taskColumn.attributes,
                      '_style', {
                        enumerable: false,
                        writable: true,
                        value: taskStyle,
                      }
                    );
                    if (typeof taskColumn.attributes.style === 'undefined') {
                      taskColumn.attributes.style = taskStyle;
                    } else {
                      taskColumn.attributes.style = _.compact([taskColumn.attributes.style.replace(taskStyle, ''), taskStyle]).join(' ');
                    }
                    break;
                  case 'task':
                    var existingTask = that.get(gridData, field, name)
                    if (existingTask) {
                      // Merge new task with existing one in the column template
                      $.extend(existingTask, {
                        name : name,
                        template: template,
                        callback: callback,
                      });
                    } else {
                      // Add new task to the column template
                      taskColumn._tasks.push({
                        name : name,
                        template: template,
                        callback: callback,
                      });
                    }
                    break;
                  }
                } else {
                  app.custom.utils.log(2, 'gridTasks:add', "Warning! Unable to find field '" + field + "'.");
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
                var taskColumn = _.findWhere(gridData.columns, {field: field});

                if (!_.isUndefined(taskColumn)) {
                  if (_.isUndefined(name)) {
                    // Return all tasks for the provided field
                    return taskColumn._tasks;
                  } else {
                    // Look for the specific task named in the provided field
                    var gridTask = _.findWhere(taskColumn._tasks, {name: name});

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

                app.custom.utils.log('gridTasks:callback', data);

                if (existingTask) {
                  // Stop click propagation for jQuery click events if requested
                  if (!bClickPropagation) {
                    event.stopPropagation();
                  }

                  if (typeof existingTask.callback === 'function') {
                    existingTask.callback(data);
                  }
                } else {
                  app.custom.utils.log(2, 'gridTasks:callback', 'Unable to find task for callback.');
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
                    //$.extend(true, gridData.options.columns, gridData.columns);
                    //gridData.options.rowTemplate = gridData._tmpl(gridData.options.rowTemplate, gridData.columns);
                    //gridData.options.altRowTemplate = gridData._tmpl(gridData.options.altRowTemplate || gridData.options.rowTemplate, gridData.columns);
                    
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

            return gridTaskVm;
          }

          /**
           * Initialize Custom Grid Task Builder.
           */
          function initGridTasks() {
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('gridTaskBuilder:initGridTask');
            }
            var gridTasksVm = getGridTasksViewModel();

            // Wait for dynamicPageReady to trigger gridTasks.Ready event once.
            $(app.events).one('dynamicPageReady', function publishGridTasksReady() {
              gridTasksVm.isReady = true;
              gridTasksVm._readyDeferred.resolve();
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
