/*global $, _, app, console, define, window */

/**
Bind Session User Properties
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'bindSessionUser',
      Type: 'RequestOffering',
      Label: 'Bind Session User Properties',
      Access: true,
      Configs: {
        SystemUserPreferencesNotificationEndpointProjectionId: '39d94137-3c03-d846-4eb4-511f7d7aa3fc',
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

        /*
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
        }*/

        function updateTextAreaField(textareaElm, value) {
          // Check if angular framework is ready
          if (typeof angular === 'undefined') {
            // Wait for angular framework to be ready
            app.events.subscribe('angular.Ready', function processROTask(event) {
              'use strict';
              // Wait for Request Offering scope to be ready
              angular.element($('#GeneralInformation')).ready(function () {
                'use strict';
                // Set Field to value
                $(textareaElm).val(value);
                $(textareaElm).trigger('onkeyup');
              });
                // Unsubscribe from further angular.Ready events
              app.events.unsubscribe(event.type, processROTask);
            });
          } else {
            // Wait for Request Offering scope to be ready
            angular.element($('#GeneralInformation')).ready(function () {
              'use strict';
              // Set Field to session.user value
              $(textareaElm).val(value);
              $(textareaElm).trigger('onkeyup');
            });
          }
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.property) {
            return;
          }

          processNext(promptElm, options.next, function (targetElm) {
            // Update Input If HASH exists on Load
            var targetId = $(targetElm).find('input.question-answer-id').attr('value'),
                currentParams = app.lib.getQueryParams(),
                propertyKey = options.property;

            // Mapping commonly used Properties to the session.user equivalent
            switch (propertyKey) {
            case 'DisplayName':
              propertyKey = 'Name';
              break;
            }

            if (session.user.hasOwnProperty(propertyKey)) {
              updateTextAreaField($(targetElm).find('textarea'), session.user[propertyKey]);
            } else {
              // console.log('Waiting for sessionUserData object load');
              app.events.subscribe('sessionUserData.Ready', function (event, data) {
                'use strict';
                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  console.log('Session User Data Ready', {
                    data: data[0],
                    dataLength: data.length,
                    propertKey: propertyKey,
                  });
                }
                if (data.length > 0) {
                  if (data[0].hasOwnProperty(propertyKey)) {
                    updateTextAreaField($(targetElm).find('textarea'), data[0][propertyKey]);
                  } else {
                    switch (propertyKey) {
                    case 'EmailAddress':
                      console.log('Email Search');
                      var SMTPFilter = _.filter(data[0].Preference, function (item, index) {
                        return item.ChannelName === 'SMTP';
                      });
                      if (SMTPFilter) {
                        updateTextAreaField($(targetElm).find('textarea'), SMTPFilter[0].TargetAddress);
                      }
                      break;
                    }
                  }
                }
              });
            }
          });

          // Add DataSource For All User Properties
          if(typeof vm.userObjectPropertiesDataSource === 'undefined') {
            vm.userObjectPropertiesDataSource = new kendo.data.DataSource({
                serverFiltering: false,
                transport: {
                    read: {
                        url: "/Search/GetObjectPropertiesByProjection",
                        data: {
                            projectionId: roTask.Configs.SystemUserPreferencesNotificationEndpointProjectionId,
                            id: session.user.Id,
                        },
                        dataType: "json",
                        type: "GET",
                    },
                },/* // For Use With Non-Array Results
                schema: {
                  data: function(response) {
                    return [response];
                  },
                },*/
            });
            vm.userObjectPropertiesDataSource.fetch(function(){
              var data = this.data();
              app.events.publish('sessionUserData.Ready', [data]);
            });
          }
        }

        initROTask();
      },
    };

  return definition;
});
