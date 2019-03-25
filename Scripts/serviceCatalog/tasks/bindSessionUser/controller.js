/* global $, _, app, define, kendo, session, window */

/**
 * 'Bind Session' Request Offering Task
 * @module bindSessionController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/customLib',
  'CustomSpace/Scripts/serviceCatalog/roTaskLib',
],
function (
  customLib,
  roTaskLib
) {
  'use strict';

  var initFetchDataSource = _.once(function (dataSource) {
      dataSource.fetch();
    }),
    roTask = {
      Name: 'bindSessionUser',
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
          app.custom.utils.log('bindSessionController:build', {
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
        function processNext(roTaskElm, next, func) {
          var targetElms = $(roTaskElm).nextAll().not('.task-container').slice(0, next);
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
        function updateTextAreaValue(targetElm, value) {
          var textareaElm = $(targetElm).find('textarea');
          // Check if angular framework is ready
          roTaskLib.waitForAngular(function () {
            var currentValue = $(textareaElm).val();
            // Set Field to value if current value is still blank
            if (_.isEmpty(currentValue)) {
              $(textareaElm).val(value);
              $(textareaElm).trigger('onkeyup');
            }
          });
        }

        /**
         * Update field value based on provided Kendo type.
         *
         * @param {string} targetType - Target field type.
         * @param {object} targetElm - Target field container.
         * @param {object|number|string} value - New field value.
         */
        function updateField(targetType, targetElm, value) {
          switch (targetType) {
          case 'String':
            updateTextAreaValue(targetElm, value);
            break;
          }
        }

        /**
         * Validate if field should be updated.
         *
         * @param {string} targetType - Target field type.
         * @param {object} targetElm - Target field container.
         * @returns {boolean} If value should be updated.
         */
        function validateUpdate(targetType, targetElm) {
          var bUpdateValue = false,
              targetInputElm,
              currentValue;
          switch (targetType) {
          case 'String':
            targetInputElm = $(targetElm).find('textarea');
            currentValue = $(targetInputElm).val();
            // Update target field if current value is blank.
            if (_.isEmpty(currentValue)) {
              bUpdateValue = true;
            }
            break;
          }
          return bUpdateValue;
        }

        // #endregion Utility functions

        /**
         * Request Offering Task initialization script.
         */
        function initROTask() {
          _.defaults(options, {
            next: 1,
          });

          if (!_.has(options, 'property') && !_.has(options, 'properties')) {
            if (!_.isUndefined(app.custom.utils)) {
              app.custom.utils.log(2, 'bindSessionController:initROTask', 'Warning! Invalid arguments provided');
            }
            return;
          }

          processNext(roTaskElm, options.next, function (targetElm, targetIndex) {
            // Update Input If HASH exists on Load
            var targetType = $(targetElm).find('input.question-answer-type').val(),
                targetInputElm,
                propertyKey = options.property || options.properties[targetIndex];
            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('bindSessionController:processNext', {
                task: roTask,
                roTaskElm: roTaskElm,
                targetElm: targetElm,
                propertyKey: propertyKey,
                options: options,
              });
            }

            if (validateUpdate(targetType, targetElm)) {
              // Mapping commonly used Properties to the session.user equivalent
              switch (propertyKey) {
              case 'DisplayName':
                propertyKey = 'Name';
                break;
              }

              if (session.user.hasOwnProperty(propertyKey)) {
                updateField(targetType, targetElm, session.user[propertyKey]);
              } else {
                var sessionUserConfig = {
                      transport: {
                        read: {
                          url: '/Search/GetObjectPropertiesByProjection',
                          data: {
                            projectionId: roTask.Configs.SystemUserPreferencesProjectionId,
                            id: session.user.Id,
                          },
                        },
                      },
                    },
                    sessionUserConfigId = 'GetObjectPropertiesByProjection.' + customLib.createHash(sessionUserConfig),
                    sessionUserDataSource = customLib.api.getDataSource(sessionUserConfigId, sessionUserConfig);

                sessionUserDataSource.bind('requestEnd', function responseHandler(event) {
                  if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                    app.custom.utils.log('GetObjectPropertiesByProjection:requestEnd', {
                      id: sessionUserConfigId,
                      propertKey: propertyKey,
                      response: event.response,
                    });
                  }
                  if (!_.isEmpty(event.response)) {
                    var data = _.first(event.response);
                    if (_.has(data, propertyKey)) {
                      updateField(targetType, targetElm, data[propertyKey]);
                    } else {
                      switch (propertyKey) {
                      case 'EmailAddress':
                        var SMTPChannel = _.findWhere(data.Preference, { ChannelName: 'SMTP'});
                        if (!_.isUndefined(SMTPChannel)) {
                          updateField(targetType, targetElm, SMTPChannel.TargetAddress);
                        }
                        break;
                      }
                    }
                  } else {
                    if (!_.isUndefined(app.custom.utils)) {
                      app.custom.utils.log(2, 'GetObjectPropertiesByProjection:requestEnd', 'Warning! Invalid results returned.');
                    }
                  }
                  sessionUserDataSource.unbind('requestEnd', responseHandler);
                });
                initFetchDataSource(sessionUserDataSource);
              }
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
