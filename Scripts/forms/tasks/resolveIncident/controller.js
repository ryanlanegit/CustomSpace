/* global $, _, app, define, kendo, localizationHelper, session */

/**
 * 'Resolve Incident' Work Item Task
 * @module resolveIncidentController
 * @see module:wiTaskMain
 * @see module:wiTaskBuilder
 */
define([
  'CustomSpace/Scripts/customLib',
  'CustomSpace/Scripts/forms/wiTaskLib',
  'text!forms/tasks/anchor/view.html',
  'text!CustomSpace/Scripts/forms/tasks/resolveIncident/view.html',
  'forms/fields/enum/controller',
  'CustomSpace/Scripts/forms/fields/longstring/controller',
  'forms/fields/boolean/controller',
], function (
  customLib,
  wiTaskLib,
  anchorTemplate,
  resolveIncidentTemplate,
  enumPickerController,
  txtAreaController,
  checkBoxController
) {
  'use strict';
  var resolveIncidentTask = {
        Task: 'resolveIncident',
        Type: 'Incident',
        Configs: {
          ResolutionCategory: {
            Id: 'c5f6ada9-a0df-01d6-7087-6b8500ca6c2b',
            Name: 'Fixed by analyst',
          },
          description: {
            MinLength: 4,
            MaxLength: 4000,
            Rows: 4,
          },
          systemDomainUserClassId: 'eca3c52a-f273-5cdc-f165-3eb95a2b26cf',
        },
        /**
         * @type (string)
         */
        get Label() {
          return localizationHelper.localize('ResolveIncident', 'Resolve Incident');
        },
        /**
         * @type {boolean}
         */
        get Access() {
          return (session.user.Analyst === 1);
        },
      },
      /**
       * @exports resolveIncidentController
       */
      definition = {
        template: resolveIncidentTemplate,
        task: resolveIncidentTask,
        /**
         * Build Work Item Task.
         *
         * @param {Object} vm - View Model of the base roTask plugin.
         * @param {Object} roTaskElm - Source task container element.
         * @param {Object} options - Parsed options from roTaskElm's JSON contents
         */
        build: function build(vm, node, callback) {
          if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
            app.custom.utils.log('resolveIncidentTask:build');
          }

          // #region Utility functions

          // Template .build() and view.renderererers.
          var buildAndRender = {
            /**
             *
             */
            windowEle: function windowEle(windowTemplate) {
              //build the template for the window
              var builtModal = _.template(windowTemplate),
                  ele = new kendo.View(builtModal(), {
                    wrap: false,
                  });
              //send hidden window back to caller (appended in the callback)
              if (typeof callback === 'function') {
                callback(ele.render());
              }
              return ele;
            },

            /**
             *
             */
            taskListItem: function taskListItem(properties, anchorViewModel, template) {
              $.extend(true, properties, node);
              //build the anchor and bind viewModel to it
              var builtAnchor = _.template(template),
                  anchorElm = new kendo.View(builtAnchor(properties), {
                    wrap: false,
                    model: anchorViewModel,
                  });
              //send anchor element back to caller (appended in the callback)
              if (typeof callback === 'function') {
                callback(anchorElm.render());
              }
              return anchorElm;
            },

            /**
             * form field helper
             */
            enumPicker: function enumPicker(container, props, vmModel) {
              enumPickerController.build(vmModel, props, function (enumControl) {
                container.html(enumControl);
                app.controls.apply(container, {
                  localize: true,
                  vm: vmModel,
                  bind: true,
                });
              });
            },

            /**
             *
             */
            textArea: function textArea(container, props, vmModel) {
              return txtAreaController.build(vmModel, props, function (cbTxtAreaControl) {
                container.html(cbTxtAreaControl);
                /*app.controls.apply(container, {
                  localize: true,
                  //vm: vmModel,
                  bind: true
                });*/
              });
            },

            /**
             *
             */
            checkbox: function checkbox(container, props, vmModel) {
              checkBoxController.build(vmModel, props, function (txtCheckboxControl) {
                container.html(txtCheckboxControl);
                app.controls.apply(container, {
                  localize: true,
                  vm: vmModel,
                  bind: true,
                });
              });
            },
          };

          /**
           * Create resolution fields.
           *
           * @param {object} modalWindowViewModel - Modal Window Kendo View Model.
           * @param {object} modalWindowEle - Modal Window Element.
           */
          function createIncidentResolutionFields(modalWindowViewModel, modalWindowEle) {
            var resolutionProperties = {
                  PropertyName: 'ResolutionCategory',
                  PropertyDisplayName: localizationHelper.localize('ResolutionCategory', 'Resolution Category'),
                  Required: true,
                  EnumId: modalWindowViewModel.resolutionCategoryEnumId,
                },
                resolutionDescriptionProperties = {
                  PropertyName: 'ResolutionDescription',
                  PropertyDisplayName: localizationHelper.localize('ResolutionDescription', 'Resolution Description'),
                  PlaceHolder: localizationHelper.localize('ResolutionDescription', 'Resolution Description'),
                  Required: false,
                  MaxLength: node.Configs.description.MaxLength,
                  CharactersRemaining: node.Configs.description.MaxLength,
                  Rows: node.Configs.description.Rows,
                },
                resolutionAssignToMeProperties = {
                  PropertyName: 'ResolutionAssignToMe',
                  PropertyDisplayName:  modalWindowViewModel.ResolutionAssignToMeEnabled ? localizationHelper.localize('AssignToMe', 'Assign To Me') : localizationHelper.localize('AssignedToMe', 'Assigned To Me'),
                  Inline: true,
                  Disabled: !modalWindowViewModel.ResolutionAssignToMeEnabled,
                  Required: false,
                  Checked: true,
                };
            // Resolution Category Picker
            buildAndRender.enumPicker(modalWindowEle.find('#resolutionCategory'), resolutionProperties, modalWindowViewModel);
            // Resolution Description
            buildAndRender.textArea(modalWindowEle.find('#resolutionDescription'), resolutionDescriptionProperties, modalWindowViewModel);
            // Assign To Me Checkbox
            buildAndRender.checkbox(modalWindowEle.find('#resolutionAssignToMe'), resolutionAssignToMeProperties, modalWindowViewModel);
          }

          /**
           * Resolve Incident
           *
           * @param {object} modalWindowViewModel - Modal Window Kendo View Model.
           */
          function applyResolveIncident(wiViewModel, modalWindowViewModel) {
            var actionLogType = app.controls.getWorkItemLogType(wiViewModel),
                resolvedDateElement = $('input').filter('[name="ResolvedDate"]'),
                resolvedDate = new Date();

            wiViewModel.set('ResolutionDescription', modalWindowViewModel.ResolutionDescription.ResolutionDescription);
            wiViewModel.set('ResolutionCategory', { Id: modalWindowViewModel.ResolutionCategory.Id });
            wiViewModel.set('ResolvedDate', resolvedDate.toISOString());

            // Update Resolved Date Field
            switch (resolvedDateElement.attr('data-control')) {
              case 'datePicker':
                resolvedDateElement.val(kendo.toString(resolvedDate, 'd'));
                break;
              case 'dateTimePicker':
                resolvedDateElement.val(kendo.toString(resolvedDate, 'g'));
                break;
            }

            // Set Resolved By User Relationship
            wiViewModel.set('RelatesToTroubleTicket', {
              ClassTypeId: node.Configs.systemDomainUserClassId,
              BaseId: session.user.Id,
              DisplayName: session.user.Name,
            });

            // Add 'Resolved Record' comment to the Action Log
            if (actionLogType) {
              var resolvedActionLog = new app.dataModels[actionLogType].recordResolved(modalWindowViewModel.ResolutionDescription.ResolutionDescription);
              wiViewModel[actionLogType].unshift(resolvedActionLog);
            }

            // Assign To Me
            if (modalWindowViewModel.ResolutionAssignToMeEnabled && modalWindowViewModel.ResolutionAssignToMe) {
              wiViewModel.AssignedWorkItem.set('BaseId', session.user.Id);
              wiViewModel.AssignedWorkItem.set('DisplayName', session.user.Name);
            }

            // Update Status Indicator
            customLib.api.Enum.GetEnumDisplayName(app.constants.workItemStatuses.Incident.Resolved, function (displayName) {
              wiViewModel.set('Status', {
                Id: app.constants.workItemStatuses.Incident.Resolved,
                Name: displayName,
              });
            });

            // Create Resolved Popup Notification
            customLib.createPopupNotification({
              message: customLib.stringFormat('{Id} has been resolved.<br/>Click Save or Apply to complete the process.', wiViewModel),
              type: 'success',
            });
          }

          /**
           * Executes on resolution category dropdown change
           *
           */
          function onModalUpdate(modalWindowViewModel, modalWindowEle) {
            var okEnabled = modalWindowViewModel.ResolutionCategory.Id !== '' && !modalWindowEle.find('#resolutionCategory .form-control .k-dropdown-wrap').hasClass('input-error');
            modalWindowViewModel.set('okEnabled', okEnabled);
          }

          /**
           * Executes when modal dialog is opening
           *
           */
          function onModalActivate(modalWindowViewModel, modalWindowEle) {
            modalWindowEle.find('#resolutionDescription textarea').focus();
            onModalUpdate(modalWindowViewModel, modalWindowEle);
          }

          /**
           * Bind onModalUpdate to Resolution Catagory Field events.
           */
          function bindResolutionCategoryFieldEvents(modalWindowViewModel, modalWindowEle) {
            var resolutionCategoryDropDownTreeViewControl = modalWindowEle.find('#resolutionCategory .form-control').data('kendoExtDropDownTreeViewV3');

            /**
             * Handle Passing View Model and Modal Elmement on Resolution Catgegory change.
             */
            function onModalUpdateHandler() {
              onModalUpdate(modalWindowViewModel, modalWindowEle);
            }

            resolutionCategoryDropDownTreeViewControl._dropdown.input.keyup(onModalUpdateHandler);
            resolutionCategoryDropDownTreeViewControl.bind('change', onModalUpdateHandler);
            resolutionCategoryDropDownTreeViewControl._dropdown.bind('change', onModalUpdateHandler);
            resolutionCategoryDropDownTreeViewControl._treeview.bind('change', onModalUpdateHandler);
          }

          /**
           * Create Work itme Form Task View Model.
           * View Model is bound to Task Menu list item.
           *
           * @param {object} modalView - Kendo View of built resolveIncidentTemplate.
           * @returns (object) Task View Model.
           */
          function getFormTaskViewModel(modalView) {
            var taskVm = new kendo.observable({
             /**
              * Create Resolve Incident window and bind events.
              */
              resolveIncident: function resolveIncident() {
                var currentStatus = vm.viewModel.get('Status'),
                    modalWindowEle,
                    modalWindowControl,
                    modalWindowViewModel;
                if (currentStatus.Id === app.constants.workItemStatuses.Incident.Resolved) {
                  customLib.createPopupNotification({
                    message: customLib.stringFormat('{Id} is already resolved.', vm.viewModel),
                  });
                  $('#myTab a').filter('[data-toggle][data-cid="Resolution"]').click();
                  return;
                }

                modalWindowEle = modalView.element; //.element.clone(),
                modalWindowControl = modalWindowEle.kendoCiresonWindow({
                  title: node.Label,
                  width: 600,
                  minWidth: 250,
                  height: 480,
                  actions: [],
                  /**
                   *
                   */
                  close: function close() {},
                  /**
                   *
                   */
                  activate: function activate() {
                    //on window activate bind the view model to the loaded template content
                    onModalActivate(modalWindowViewModel, modalWindowEle);
                  },
                  /*deactivate: function deactivate() {
                    modalWindowControl.destroy();
                  },*/

                }).data('kendoWindow');
                modalWindowViewModel = kendo.observable({
                  ResolutionCategory: node.Configs.ResolutionCategory,
                  resolutionCategoryEnumId: app.constants.enumPickerIds.IncidentResolution,
                  ResolutionAssignToMeEnabled: !wiTaskLib.isAssignedToMe(vm.viewModel),
                  ResolutionAssignToMe: true,
                  okEnabled: false,
                  /**
                   * Apply Resolve Incident
                   */
                  okClick: function okClick() {
                    applyResolveIncident(vm.viewModel, modalWindowViewModel);
                    modalWindowControl.close();
                  },
                  /**
                   * Cancel Resolve Incident process
                   */
                  cancelClick: function cancelClick() {
                    modalWindowControl.close();
                  },
                });

                kendo.bind(modalWindowEle, modalWindowViewModel);

                createIncidentResolutionFields(modalWindowViewModel, modalWindowEle);
                bindResolutionCategoryFieldEvents(modalWindowViewModel, modalWindowEle);

                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  app.custom.utils.log('resolveIncidentTask:resolveIncident', {
                    modalWindowEle: modalWindowEle,
                    modalWindowControl: modalWindowControl,
                    modalWindowViewModel: modalWindowViewModel,
                  });
                }

                modalWindowEle.removeClass('hide').show();
                modalWindowControl.wrapper.css('padding-bottom', '65px');
                modalWindowControl.open();
              },
            });

            return taskVm;
          }

          // #endregion Utility functions

          /**
           * Work Item Form Task initialization script.
           */
          function initFormTask() {
            var modalView = buildAndRender.windowEle(resolveIncidentTemplate),
                formTaskViewModel = getFormTaskViewModel(modalView),
                anchorTemplateProps = { Target: node.Task };
            buildAndRender.taskListItem(anchorTemplateProps, formTaskViewModel, anchorTemplate);
          }

          initFormTask();
        },
      };

  return definition;
});
