/* global $, _, app, define, window */

/**
 * 'Bind Hash' Request Offering Task
 * @module bindHashController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
],
function (
  roTaskUtils
) {
  'use strict';
  /*
    URL Hash Change Monitoring
  */
  $(window).on('hashchange', function(event) {
    var oldURL = event.originalEvent.oldURL,
        newURL = event.originalEvent.newURL;
    if (newURL !== oldURL) {
      app.events.publish('window.hashChange', {
        event: event,
        oldQueryParams: app.lib.getQueryParams(oldURL.slice(oldURL.indexOf('#'))),
        newQueryParams: app.lib.getQueryParams(newURL.slice(newURL.indexOf('#'))),
      });
    }
  });

  var roTask = {
      Task: 'bindHash',
      Type: 'RequestOffering',
      Label: 'Bind Hash',
      Configs: {
        onChangeTimeOutDelay: 100,
      },
      Access: true,
    },

    /**
     * @exports bindHashController
     */
    definition = {
      template: null,
      task: roTask,
      /**
       * Build Work Item Tasks.
       *
       * @param {object} vm - Request Offering Task View Model.
       * @param {object} roTaskElm - Task Contrainer Element.
       * @param {object} options - roTask parsed options.
       */
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('roTask:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
         * Set target field value using Angular evalAsync.
         *
         * @param {object} targetElm - Target field container element.
         * @param {object|string|number} paramValue - Value to be set.
         */
        function processParam(targetElm, paramValue) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('roTask:build:processParam', {
              targetElm: targetElm,
              paramValue: paramValue,
            });
          }

          // Check if angular framework is ready
          roTaskUtils.waitForAngular(function () {
            targetElm = $(targetElm);
            var questionType = targetElm.children('input.question-answer-type').val(),
                targetId = targetElm.children('input.question-answer-id').val(),
                currentValue = targetElm.find('#' + targetId).val();
            switch (questionType) {
            case 'List':
              if (paramValue !== currentValue) {
                var targetDropdownData = targetElm.find('[data-role="dropdownlist"]').data('kendoDropDownList'),
                    targetDataSourceData = targetDropdownData.dataSource.data(),
                    filteredData;
                if (targetDataSourceData.length > 0) {
                  filteredData = _.findWhere(targetDataSourceData, {name: paramValue});
                  if (!_.isUndefined(filteredData)) {
                    targetDropdownData.select(function(dataItem) {
                      return dataItem.name === paramValue;
                    });
                    targetDropdownData.trigger('change');
                  }
                }
              }
              break;
            default:
              app.custom.utils.log(2, 'Unable to determine Question Type', {
                task: roTask,
                roTaskElm: roTaskElm,
                targetElm: targetElm,
                options: options,
              });
            }
          });
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.param) {
            return;
          }

          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm) {
            var targetId = $(targetElm).children('input.question-answer-id').val(),
                currentParams = app.lib.getQueryParams(),
                paramKey = options.param.toLowerCase(),
                onInputChange;

            // Update Input If HASH exists on Load
            if (currentParams && currentParams.hasOwnProperty(paramKey)) {
              // Set Field to Fetched Data value
              processParam(targetElm, currentParams[paramKey]);
            }

            // Update URL HASH on Input Change
            onInputChange = _.debounce(function(event) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log(event.type + ':onInputChange', {
                  targetElm: targetElm,
                  event: event,
                });
              }
              var currentParams = app.lib.getQueryParams() || {},
                  newParams = $.extend({}, currentParams),
                  newValue = $('#' + targetId).val();
              if (newValue === null || newValue.length === 0 || newValue === " ") {
                delete newParams[paramKey];
              } else {
                newParams[paramKey] = newValue;
              }

              if ($.param(newParams) !== $.param(currentParams)) {
                window.location.replace(window.location.href.split('#')[0] + '#' + $.param(newParams));
              }
            }, roTask.Configs.onChangeTimeOutDelay);
            $('#' + targetId).on('change', onInputChange);

            // Update Input on HASH Change
            app.events.subscribe('window.hashChange', function onHashChange(event, data) {
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log(event.type + '.' + event.namespace + ':onHashChange', {
                  targetElm: targetElm,
                  event: event,
                  data: data,
                });
              }
              if (data.newQueryParams && data.newQueryParams.hasOwnProperty(paramKey)) {
                if(data.oldQueryParams && data.oldQueryParams.hasOwnProperty(paramKey)) {
                  if (data.newQueryParams[paramKey] !== data.oldQueryParams[paramKey]) {
                    processParam(targetElm, data.newQueryParams[paramKey]);
                  }
                } else {
                  processParam(targetElm, data.newQueryParams[paramKey]);
                }
              }
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
