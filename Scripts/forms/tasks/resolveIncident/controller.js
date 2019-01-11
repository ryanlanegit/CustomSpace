/*global _, $, app, console, define, kendo, session */

/**
Resolve Incident
**/

define([
  'text!forms/tasks/anchor/view.html',
  'text!CustomSpace/Scripts/forms/tasks/resolveIncident/view.html',
  'forms/fields/enum/controller',
  'CustomSpace/Scripts/forms/fields/longstring/controller',
  'forms/fields/boolean/controller',
], function (
  anchorTemplate,
  resolveIncidentTemplate,
  enumPickerControl,
  txtAreaControl,
  checkBoxControl
) {
  'use strict';
  var resolveIncidentTask = {
      Task: 'resolveIncident',
      Type: 'Incident',
      Label: 'Resolve Incident',
      Access: session.user.Analyst === 1,
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
      },
    },

    incidentResolutionCategoryEnumId = '72674491-02cb-1d90-a48f-1b269eb83602',
    incidentStatusResolvedEnumId = '2b8830b6-59f0-f574-9c2a-f4b4682f1681',
    systemDomainUserClassId = 'eca3c52a-f273-5cdc-f165-3eb95a2b26cf',

    definition = {
      template: resolveIncidentTemplate,
      task: resolveIncidentTask,
      build: function build(vm, node, callback) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          console.log('resolveIncidentTask:build');
        }
        /* BEGIN Functions */
        //form field helper
        function buildEnumPicker(container, props, vmModel) {
          enumPickerControl.build(vmModel, props, function (enumControl) {
            container.html(enumControl);
            app.controls.apply(container, {
              localize: true,
              vm: vmModel,
              bind: true,
            });
          });
        }

        function buildTextArea(container, props, vmModel) {
          return txtAreaControl.build(vmModel, props, function (cbTxtAreaControl) {
            container.html(cbTxtAreaControl);
            /*app.controls.apply(container, {
              localize: true,
              //vm: vmModel,
              bind: true
            });*/
          });
        }

        function buildCheckbox(container, props, vmModel) {
          checkBoxControl.build(vmModel, props, function (txtCheckboxControl) {
            container.html(txtCheckboxControl);
            app.controls.apply(container, {
              localize: true,
              vm: vmModel,
              bind: true,
            });
          });
        }

        function createPopupNotification(message) {
          var popupNotificationElm = $('.popupNotification:first'),
            popupNotification = popupNotificationElm.getKendoNotification('kendoNotification');

          if (!_.isUndefined(popupNotification)) {
            popupNotification.hide();
          } else {
            popupNotification = popupNotificationElm.kendoNotification({
              templates: [{
                type: 'resolveIncidentNotification',
                template: '<div class="success k-ext-dialog-content"><div class="k-ext-dialog-icon fa fa-check"></div><div class="k-ext-dialog-message">#= message #</div></div>',
              }],
            }).data('kendoNotification');
          }

          popupNotification.show({
            message: app.custom.utils.stringFormat(message, vm.viewModel.Id),
          }, 'resolveIncidentNotification');
        }

        function createIncidentResolutionFields(modalWindowViewModel, modalWindowEle) {
          var resolutionProperties = {
            PropertyName: 'ResolutionCategory',
            PropertyDisplayName: 'ResolutionCategory',
            Required: true,
            EnumId: modalWindowViewModel.resolutionCategoryEnumId,
          },
            resolutionDescriptionProperties = {
              PropertyName: 'ResolutionDescription',
              PropertyDisplayName: 'Resolution Notes',
              PlaceHolder: 'Resolution Notes...',
              Required: false,
              MaxLength: node.Configs.description.MaxLength,
              CharactersRemaining: node.Configs.description.MaxLength,
              Rows: node.Configs.description.Rows,
            },
            resolutionAssignToMeProperties = {
              PropertyName: 'ResolutionAssignToMe',
              PropertyDisplayName: 'Assign To Me',
              Inline: true,
              Disabled: false,
              Required: false,
              Checked: true,
            };
          //resolution picker
          buildEnumPicker(modalWindowEle.find('#resolutionPicker'), resolutionProperties, modalWindowViewModel);
          //resolution description
          buildTextArea(modalWindowEle.find('#resolutionDescription'), resolutionDescriptionProperties, modalWindowViewModel);

          buildCheckbox(modalWindowEle.find('#resolutionAssignToMe'), resolutionAssignToMeProperties, modalWindowViewModel);
        }

        // Resolve Incident
        function performResolveIncident(modalWindowViewModel) {
          var actionLogType = app.controls.getWorkItemLogType(vm.viewModel),
            resolvedDateElement = $('input[name="ResolvedDate"]');

          vm.viewModel.set('ResolutionDescription', modalWindowViewModel.ResolutionDescription.ResolutionDescription);
          vm.viewModel.set('ResolutionCategory', { Id: modalWindowViewModel.ResolutionCategory.Id });
          vm.viewModel.set('ResolvedDate', new Date().toISOString());

          // Set Resolved By User
          vm.viewModel.set('RelatesToTroubleTicket', {
            ClassTypeId: systemDomainUserClassId,
            BaseId: session.user.Id,
            DisplayName: session.user.Name,
          });

          // Add 'Resolved Record' comment to the Action Log
          if (actionLogType) {
            vm.viewModel[actionLogType].unshift(new app.dataModels[actionLogType].recordResolved(modalWindowViewModel.ResolutionDescription.ResolutionDescription));
          }

          // Update Resolved Date Field
          switch (resolvedDateElement.attr('data-control')) {
            case 'datePicker':
              resolvedDateElement.val(kendo.toString(new Date(), 'd'));
              break;
            case 'dateTimePicker':
              resolvedDateElement.val(kendo.toString(new Date(), 'g'));
              break;
          }

          // Update Status Indicator
          vm.viewModel.set('Status', {
            Id: incidentStatusResolvedEnumId,
            Name: 'Resolved',
          });

          if (modalWindowViewModel.showResolutionAssignToMe && modalWindowViewModel.ResolutionAssignToMe) {
            vm.viewModel.AssignedWorkItem.set('BaseId', session.user.Id);
            vm.viewModel.AssignedWorkItem.set('DisplayName', session.user.Name);
          }

          // Resolved Popup Notification
          createPopupNotification('{0} has been resolved.<br/>Click Save or Apply to complete the process.');
        }

        // Executes on resolution category dropdown change
        function onModalUpdate(modalWindowViewModel, modalWindowEle) {
          if (
            modalWindowViewModel.ResolutionCategory.Id !== '' &&
              !modalWindowEle.find('div[data-role="ResolutionCategory"] > span > span').hasClass('input-error')
          ) {
            modalWindowViewModel.set('okEnabled', true);
          } else {
            modalWindowViewModel.set('okEnabled', false);
          }
        }

        // Executes when modal dialog is opening
        function onModalActivate(modalWindowViewModel, modalWindowEle) {
          modalWindowEle.find('textarea[name="ResolutionDescription"]').focus();
          onModalUpdate(modalWindowViewModel, modalWindowEle);
        }

        function bindResolutionCategoryFieldEvents(modalWindowViewModel, modalWindowEle) {
          var resolutionCategoryDropDownTreeViewControl = modalWindowEle.find('div[data-role="ResolutionCategory"]').data('kendoExtDropDownTreeViewV3');

          function onModalUpdateHandler() {
            onModalUpdate(modalWindowViewModel, modalWindowEle);
          }

          resolutionCategoryDropDownTreeViewControl._dropdown.input.keyup(onModalUpdateHandler);
          resolutionCategoryDropDownTreeViewControl.bind('change', onModalUpdateHandler);
          resolutionCategoryDropDownTreeViewControl._dropdown.bind('change', onModalUpdateHandler);
          resolutionCategoryDropDownTreeViewControl._treeview.bind('change', onModalUpdateHandler);
        }

        function isAssignedToMe() {
          var assignedUserId = vm.viewModel.AssignedWorkItem.get('BaseId');
          return (assignedUserId === session.user.Id);
        }

        // Template .build() and view.renderererers.
        var buildAndRender = {
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
        };

        function getFormTaskViewModel(modalEle) {
          var taskVm = new kendo.observable({
            resolveIncident: function resolveIncident() {
              var currentStatus = vm.viewModel.get('Status'),
                modalWindowEle,
                modalWindowControl,
                modalWindowViewModel;
              if (currentStatus.Id === incidentStatusResolvedEnumId) {
                createPopupNotification('{0} is already resolved.');
                $('a[data-toggle][data-cid="Resolution"]').click();
              } else {
                modalWindowEle = modalEle.element; //.element.clone(),
                modalWindowControl = modalWindowEle.kendoCiresonWindow({
                  title: node.Label,
                  width: 500,
                  minWidth: 250,
                  height: 400,
                  close: function close() {},
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
                  resolutionCategoryEnumId: incidentResolutionCategoryEnumId,
                  showResolutionAssignToMe: !isAssignedToMe(),
                  ResolutionAssignToMe: true,
                  okEnabled: false,
                  okClick: function okClick() {
                    performResolveIncident(modalWindowViewModel);
                    modalWindowControl.close();
                  },
                  cancelClick: function cancelClick() {
                    modalWindowControl.close();
                  },
                });

                kendo.bind(modalWindowEle, modalWindowViewModel);

                createIncidentResolutionFields(modalWindowViewModel, modalWindowEle);
                bindResolutionCategoryFieldEvents(modalWindowViewModel, modalWindowEle);

                if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                  console.log('resolveIncidentTask:resolveIncident', {
                    modalWindowEle: modalWindowEle,
                    modalWindowControl: modalWindowControl,
                    modalWindowViewModel: modalWindowViewModel,
                  });
                }

                modalWindowEle.removeClass('hide');
                modalWindowEle.show();
                modalWindowControl.wrapper.css('padding-bottom', '65px');
                modalWindowControl.open();
              }
            },
          });

          return taskVm;
        }
        /* END functions */

        /* Initialization code */
        function initFormTask() {
          var modalEle = buildAndRender.windowEle(resolveIncidentTemplate),
            formTaskViewModel = getFormTaskViewModel(modalEle),
            anchorTemplateProps = { Target: node.Task };
          buildAndRender.taskListItem(anchorTemplateProps, formTaskViewModel, anchorTemplate);
        }

        initFormTask();
      },
    };

  return definition;
});
