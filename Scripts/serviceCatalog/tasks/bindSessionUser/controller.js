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
              console.log('Using session.user object');
              $(targetElm).find('textarea').val(session.user[propertyKey]);
              $(targetElm).find('textarea').trigger('onkeyup');
                    
              console.log('set textarea', session.user[propertyKey], $(targetElm).find('textarea'));
            } else {
              console.log('Waiting for sessionUserData object load');
              app.events.subscribe('sessionUserData.Ready', function (event, data) {
                console.log('TEST Bind Session User!', {
                  data: data[0],
                  dataLength: data.length,
                  propertKey: propertyKey,
                });
                if (data.length > 0) {
                  if (data[0].hasOwnProperty(propertyKey)) {
                    $(targetElm).find('textarea').val(data[0][propertyKey]);
                    $(targetElm).find('textarea').trigger('onkeyup');
                    
                    console.log('set textarea', data[0][propertyKey], $(targetElm).find('textarea'));
                  } else {
                    switch (propertyKey) {
                    case 'EmailAddress':
                      console.log('Email Search');
                      var SMTPFilter = _.filter(data[0].Preference, function (item, index) {
                        return item.ChannelName === 'SMTP';
                      });
                      if (SMTPFilter) {
                        $(targetElm).find('textarea').val(SMTPFilter[0].TargetAddress);
                        $(targetElm).find('textarea').trigger('onkeyup');
                        
                      }
                      break;
                    }
                  }
                }
              });
            }
            /*
            if (currentParams && currentParams.hasOwnProperty(paramKey)) {
              processParam(targetElm, currentParams[paramKey]);
            }

            // Update URL HASH on Input Change
            $('#' + targetId).on('change', function onInputChange(event) {
              'use strict';
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                console.log(event.type + '.' + event.namespace + ':onInputChange', {
                  targetElm: targetElm,
                  event: event,
                });
              }
              var currentParams = app.lib.getQueryParams() || {};
              currentParams[paramKey] = $('#' + targetId).val();
              window.location.replace(window.location.href.split('#')[0] + '#' + $.param(currentParams));
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
            */
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
