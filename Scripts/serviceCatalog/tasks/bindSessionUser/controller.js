/*global $, _, app, console, define, kendo, performance, session, window */

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
          if (app.isSessionStored()) {
            _.each(targetElms, func);
          } else {
            app.events.subscribe('sessionStorageReady', function execInitTasks(event) {
              _.each(targetElms, func);
              // Unsubscibe from further sessionStorage events
              app.events.unsubscribe(event.type, execInitTasks);
            });
          }
        }

        function updateTextAreaField(targetElm, value) {
          var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          vm.waitForAngular(targetElm, function () {
            var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            if (currentValue === null || currentValue.length === 0 || currentValue === ' ') {
              $(textareaElm).val(value);
              $(textareaElm).trigger('onkeyup');
            }
          });
        }

        /* Initialization code */
        function initROTask() {
          options.next = options.next || 1;

          if (!options.property && typeof options.properties === 'undefined') {
            return;
          }

          // Add DataSource For All User Properties
          if (typeof vm.userObjectPropertiesDataSource === 'undefined') {
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
          }

          processNext(promptElm, options.next, function (targetElm, targetIndex) {
            // Update Input If HASH exists on Load
            var targetType = $(targetElm).find('input.question-answer-type').val(),
                targetInputElm,
                propertyKey = options.property || options.properties[targetIndex],
                currentValue,
                bUpdateValue = false;
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              console.log('roTask:processNext', {
                task: roTask,
                promptElm: promptElm,
                targetElm: targetElm,
                propertyKey: propertyKey,
                options: options,
              });
            }
            switch (targetType) {
            case 'String':
              targetInputElm = $(targetElm).find('textarea');
              currentValue = $(targetInputElm).val();
              // Set Field to value if current value is blank
              if (currentValue === null || currentValue.length === 0 || currentValue === ' ') {
                bUpdateValue = true;
              }
              break;
            }

            if (bUpdateValue) {
              // Mapping commonly used Properties to the session.user equivalent
              switch (propertyKey) {
              case 'DisplayName':
                propertyKey = 'Name';
                break;
              }

              if (session.user.hasOwnProperty(propertyKey)) {
                updateTextAreaField(targetElm, session.user[propertyKey]);
              } else {
                vm.userObjectPropertiesDataSource.fetch(function () {
                  var data = this.data();
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    console.log('Session User Data Ready', performance.now(), {
                      data: data[0],
                      dataLength: data.length,
                      propertKey: propertyKey,
                    });
                  }
                  if (data.length > 0) {
                    if (data[0].hasOwnProperty(propertyKey)) {
                      updateTextAreaField(targetElm, data[0][propertyKey]);
                    } else {
                      switch (propertyKey) {
                      case 'EmailAddress':
                        var SMTPFilter = _.filter(data[0].Preference, function (item, index) {
                          return item.ChannelName === 'SMTP';
                        });
                        if (SMTPFilter) {
                          updateTextAreaField(targetElm, SMTPFilter[0].TargetAddress);
                        }
                        break;
                      }
                    }
                  }
                });
              }
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
