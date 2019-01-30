/*global $, _, app, console, define, window */

/**
Bind Hash
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'bindHash',
      Type: 'RequestOffering',
      Label: 'Bind Hash',
      Access: true,
      Configs: {
        onChangeTimeOutDelay: 100,
      },
    },

    definition = {
      template: null,
      task: roTask,
      build: function build(vm, promptElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('roTask:build', {
            task: roTask,
            promptElm: promptElm,
            options: options,
          });
        }

        function processNext(targetElm, next, func) {
          var targetElms = $(targetElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        function processParam(targetElm, paramValue) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            console.log('roTask:build:processParam', {
              targetElm: targetElm,
              paramValue: paramValue,
            });
          }
          var questionType = $(targetElm).find('input.question-answer-type').attr('value'),
              targetId = $(targetElm).find('input.question-answer-id').attr('value');
          switch (questionType) {
          case 'List':
            var currentValue = $(targetElm).find('#' + targetId).val();
            if (paramValue !== currentValue) {
              var targetDropdownData = $(targetElm).find('[data-role="dropdownlist"]').data('kendoDropDownList'),
                  targetDataSourceData = targetDropdownData.dataSource.data(),
                  filteredData;
              if (targetDataSourceData.length > 0) {
                filteredData = _.filter(targetDataSourceData, function (item, index) {
                  return item.name === paramValue;
                });
                if (filteredData) {
                  targetDropdownData.select(function(dataItem) {
                    return dataItem.name === paramValue;
                  });
                  targetDropdownData.trigger('change');
                }
              }
            }
            break;
          default:
            console.log('Unable to determine Question Type', {
              task: roTask,
              promptElm: promptElm,
              targetElm: targetElm,
              options: options,
            });
          }
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.param) {
            return;
          }

          processNext(promptElm, options.next, function (targetElm) {
            var targetId = $(targetElm).find('input.question-answer-id').attr('value'),
                currentParams = app.lib.getQueryParams(),
                paramKey = options.param.toLowerCase(),
                onChangeTimeout = null;

            // Update Input If HASH exists on Load
            if (currentParams && currentParams.hasOwnProperty(paramKey)) {
              // Check if angular framework is ready
              if (typeof angular === 'undefined') {
                // Wait for angular framework to be ready
                app.events.subscribe('angular.Ready', function processROTask(event) {
                  'use strict';
                  // Wait for Request Offering scope to be ready
                  angular.element($('#GeneralInformation')).ready(function () {
                    'use strict';
                    // Set Field to Fetched Data value
                    processParam(targetElm, currentParams[paramKey]);
                  });
                    // Unsubscribe from further angular.Ready events
                  app.events.unsubscribe(event.type, processROTask);
                });
              } else {
                // Wait for Request Offering scope to be ready
                angular.element($('#GeneralInformation')).ready(function () {
                  'use strict';
                  // Set Field to Fetched Data value
                  processParam(targetElm, currentParams[paramKey]);
                });
              }
            }

            // Update URL HASH on Input Change
            $('#' + targetId).on('change', function onInputChange(event) {
              'use strict';
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                console.log(event.type + ':onInputChange', {
                  targetElm: targetElm,
                  event: event,
                });
              }

              if (onChangeTimeout != null) {
                  clearTimeout(onChangeTimeout);
              }
              onChangeTimeout = setTimeout(function() {
                onChangeTimeout = null;
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
            });

            // Update Input on HASH Change
            app.events.subscribe('window.hashChange', function onHashChange(event, data) {
              'use strict';
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                console.log(event.type + '.' + event.namespace + ':onHashChange', {
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
