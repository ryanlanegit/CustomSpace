/* global $, _, app, define, kendo, session, window */

/**
 * 'Bind Session' Request Offering Task
 * @module bindSessionController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define(function () {
  'use strict';

  var initFetchDataSource = _.once(function (dataSource) {
      dataSource.fetch();
    }),
    roTask = {
      Task: 'bindSessionUser',
      Type: 'RequestOffering',
      Label: 'Bind Session User Properties',
      Configs: {
        SystemUserPreferencesProjectionId: '490ab845-b14c-1d91-c39f-bb9e8a350933',
      },
      Access: true,
    },

    /**
     * @exports bindSessionController
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
         * This callback type is called `processCallback` and is run on a target container.
         *
         * @callback processNextCallback
         * @param {object} targetElm - Target question or display container.
         */

        /**
         * Processes the next N non-task containers.
         *
         * @param {number} next - Number of next non-task containers to process.
         * @param {processNextCallback} func - Callback function to process next question or display container.
         */
        function processNext(next, func) {
          var targetElms = $(roTaskElm).nextAll(':not(.task-container)').slice(0, next);
          if (app.isSessionStored()) {
            _.each(targetElms, func);
          } else {
            // Subscribe execInitTasks to sessionStorageReady event once.
            $(app.events).one('sessionStorageReady', function execInitTasks() {
              _.each(targetElms, func);
            });
          }
        }

        /**
         * Update textarea field value.
         *
         * @param {Object} targetElm - Target textarea container.
         * @param {String} value - New textarea text value.
         */
        function updateTextAreaField(targetElm, value) {
          var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          vm.waitForAngular(function () {
            var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            if (currentValue === null || currentValue.length === 0 || currentValue === ' ') {
              $(textareaElm).val(value);
              $(textareaElm).trigger('onkeyup');
            }
          });
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
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
                            projectionId: roTask.Configs.SystemUserPreferencesProjectionId,
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

          processNext(options.next, function (targetElm, targetIndex) {
            // Update Input If HASH exists on Load
            var targetType = $(targetElm).find('input.question-answer-type').val(),
                targetInputElm,
                propertyKey = options.property || options.properties[targetIndex],
                currentValue,
                bUpdateValue = false;
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('roTask:processNext', {
                task: roTask,
                roTaskElm: roTaskElm,
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
                vm.userObjectPropertiesDataSource.bind('requestEnd', function responseHandler(event) {
                  var data = event.response;
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('Session User Data Ready', {
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
                        var SMTPFilter = _.find(data[0].Preference, function (item, index) {
                          return item.ChannelName === 'SMTP';
                        });
                        if (SMTPFilter) {
                          updateTextAreaField(targetElm, SMTPFilter.TargetAddress);
                        }
                        break;
                      }
                    }
                  }
                  vm.userObjectPropertiesDataSource.unbind('requestEnd', responseHandler);
                });
                initFetchDataSource(vm.userObjectPropertiesDataSource);
              }
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
