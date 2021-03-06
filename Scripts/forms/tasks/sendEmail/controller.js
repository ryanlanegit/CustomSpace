﻿/*global _, $, app, atob, console, define, document, jQuery, kendo, localization, location, navigator, pageForm, session, setTimeout, window, ArrayBuffer, Blob, FormData, Image, Uint8Array, shown */
/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
 * Send Email Task Controller
 * @module sendEmailController
 */
define([
  'text!forms/tasks/anchor/view.html',
  'text!forms/tasks/sendEmail/mobile_view.html',
  'text!forms/tasks/sendEmail/view.html',
  'forms/popups/userPickerPopup/controller',
  'forms/popups/multipleObjectPickerPopup/controller',
  'forms/flyout/fileAttachmentsFlyout/controller',
  'forms/fields/enum/controller',
  'forms/fields/longstring/controller',
], function (
  anchor,
  mobileTemplate,
  desktopTemplate,
  objectPickerPopup,
  _objectPickerPopup,
  attachmentPickerFlyout,
  enumPickerControl,
  txtAreaControl
) {
    'use strict';
    //we only need the achor template for this task
    //var anchor = require("text!forms/tasks/anchor/view.html");
    //var tpl = app.isMobile() ?  require("text!forms/tasks/sendEmail/mobile_view.html") : require("text!forms/tasks/sendEmail/view.html");
    //var objectPickerPopup = require("forms/popups/userPickerPopup/controller");
    //var _objectPickerPopup = require("forms/popups/multipleObjectPickerPopup/controller");
    //var attachmentPickerFlyout = require("forms/flyout/fileAttachmentsFlyout/controller");
    //var enumPickerControl = require("forms/fields/enum/controller");
    //var txtAreaControl = require("forms/fields/longstring/controller");
    var tpl = app.isMobile() ?  mobileTemplate : desktopTemplate;

    var definition = {
        template: tpl,
        /**
         * Build Send Email Task
         */
        build: function (vm, node, callback) {

            //build the template for the window
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });
            var filter = {};
            var recipientList = {
                recipientToList: [],
                recipientCCList: [],
            };
            var statusModalWindowControl = null;
            var shown = false;
            //add FileAttachment on viewModel if not found
            if (_.isUndefined(vm.viewModel.FileAttachment)) {
                vm.viewModel.set("FileAttachment", []);
            }

            //add in hidden window
            callback(view.render());
            view.destroy();//there is some issue with the cloned element if we don't destroy the view
            //this view Model is bound to the anchor element
            var viewModel = kendo.observable({
                /**
                 * Send Email Task initialization script
                 */
                sendEmail: function () {
                    var cont = view.element; //we have the element in memory so no need use a selector

                    if (app.isMobile()) {
                        var win = cont.kendoCiresonWindow({
                            title: localization.SendEmail,
                            width: 650,
                            height: 740,
                            actions: [],
                            /**
                             * Activate Send Email popup
                             */
                            activate: function () {
                                getAffectedUserEmail(_vmWindow);
                                setDefaultWIStatus(_vmWindow);
                            },
                        }).data("kendoWindow");
                    }




                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        emailTo: "",
                        emailCC: "",
                        emailSubject: "[" + vm.viewModel.Id + "] " + vm.viewModel.Title,
                        emailHTMLMessage: (session.emailBodyTemplate.length > 0) ? $('<div/>').html(session.emailBodyTemplate).text() : "",
                        emailTextMessage:"",
                        emailAttachment: "",
                        emailTemplateDataSource: tempateDataSource,
                        emailTemplateValue: "",
                        attachmentErrorMessage: "",
                        addToLog: (session.addToActionLogDefault === "true" || session.forceAddToActionLog === "true") ? true : false,
                        enableAddToLog: (session.forceAddToActionLog === "true") ? false : true,
                        okEnabled: true,
                        setAsPrivate: (session.saveMessageAsPrivate === "true") ? true : false,
                        /**
                         * OK On Click Event Handler
                         */
                        okClick: function (e) {
                            var userPickerTo = cont.find("#userPickerTo").data("kendoMultiSelect"),
                                userPickerCc = cont.find("#userPickerCc").data("kendoMultiSelect"),
                                recipientList = {
                                  recipientToList : userPickerTo.listView._dataItems,
                                  recipientCCList : userPickerCc.listView._dataItems,
                                };

                            var recipientToEmail = _.without(recipientList["recipientToList"], _.findWhere(recipientList["recipientToList"], {
                                Email: "",
                            }));
                            recipientToEmail = _.uniq(_.pluck(recipientToEmail, "Email"));
                            _vmWindow.set("emailTo", recipientToEmail.join(";"));

                            var recipientCcEmail = _.without(recipientList["recipientCCList"], _.findWhere(recipientList["recipientCCList"], {
                                Email: "",
                            }));
                            recipientCcEmail = _.uniq(_.pluck(recipientCcEmail, "Email"));
                            _vmWindow.set("emailCC", recipientCcEmail.join(";"));


                            //validate email addresses first
                            var arrEmail = _.union(recipientToEmail, recipientCcEmail);
                            if (recipientToEmail.length <= 0) {
                                kendo.ui.ExtAlertDialog.show({
                                    title: localization.InvalidEmailAddress,
                                    message: localization.PleaseProvideEmailAddress,
                                });
                                return;
                            }
                            else {
                                var invalidEmailAdress = validateEmailAddress(arrEmail);

                                if (invalidEmailAdress != null) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.InvalidEmailAddress,
                                        message: localization.InvalidEmailAddressMessage.replace("{0}", invalidEmailAdress),
                                    });
                                    return;
                                }
                            }

                            //if we are adding to action log we require there to be message content
                            if (this.addToLog) {
                                var editor = cont.find("#messageEditor").data("kendoEditor");
                                this.set("emailTextMessage", editor.body.innerText || editor.body.textContent);

                                var trimmedMessage = (this.emailTextMessage && _.isString(this.emailTextMessage)) ? this.emailTextMessage.trim() : "";

                                if (trimmedMessage.length <= 0) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.MessageRequired,
                                        message: localization.MessageRequiredWhenAddingLogEntry,
                                    });
                                    return;
                                }
                            }

                            var workItemStatuses = app.constants.workItemStatuses;
                            var serviceRequestCompleted = workItemStatuses.ServiceRequest.Completed;
                            var incidentResolved = workItemStatuses.Incident.Resolved;

                            //This will only created if the the Incident is set to resolve or Service Request is set to completed
                            if (((vm.type.toLowerCase() == "incident" || node.Configs.type == "Incident") && (_vmWindow.Status.id == incidentResolved || _vmWindow.Status.Id == incidentResolved))
                                || ((vm.type.toLowerCase() == "servicerequest" || node.Configs.type == "ServiceRequest") && (_vmWindow.Status.id == serviceRequestCompleted || _vmWindow.Status.Id == serviceRequestCompleted)))
                            {
                                var statusWindow = cont.find("#SendEmailChangeStatusWindow").clone();
                                var _vm = vm.viewModel;
                                var implementationNotesProperties, resolutionProperties, dateField;

                                if (vm.type.toLowerCase() == "incident" || node.Configs.type == "Incident")
                                {
                                     implementationNotesProperties = {
                                        PropertyName: "ResolutionDescription",
                                        PropertyDisplayName: "ResolutionDescription",
                                        Required: false,
                                        MaxLength: 4000,
                                        Rows: 5,
                                        vm: vm,
                                    };

                                    resolutionProperties = {
                                        PropertyName: "ResolutionCategory",
                                        PropertyDisplayName: "ResolutionCategory",
                                        Required: false,
                                        EnumId: "72674491-02cb-1d90-a48f-1b269eb83602",
                                    };

                                    dateField = "ResolvedDate";
                                }

                                if (vm.type.toLowerCase() == "servicerequest" || node.Configs.type == "ServiceRequest") {
                                    implementationNotesProperties = {
                                        PropertyName: "Notes",
                                        PropertyDisplayName: "Implementationnotes",
                                        Required: true,
                                        MaxLength: 4000,
                                        Rows: 5,
                                        vm: vm,
                                    };

                                    resolutionProperties = {
                                        PropertyName: "ImplementationResults",
                                        PropertyDisplayName: "ImplementationResults",
                                        Required: false,
                                        EnumId: "4ea37c27-9b24-615a-94da-510539371f4c",
                                    };

                                    dateField = "CompletedDate";
                                }

                                var containerDescription = statusWindow.find("#resolutionDescription");

                                txtAreaControl.build(_vm, implementationNotesProperties, function (cbTxtAreaControl) {
                                    containerDescription.html(cbTxtAreaControl);
                                    app.controls.apply(containerDescription, {
                                        localize: true,
                                        vm: _vm,
                                        bind: true,
                                    });
                                });

                                var containerEnum = statusWindow.find("#resolutionPicker");

                                enumPickerControl.build(_vm, resolutionProperties, function (enumControl) {
                                    containerEnum.html(enumControl);
                                    app.controls.apply(containerEnum, {
                                        localize: true,
                                        vm: _vm,
                                        bind: true,
                                    });
                                });

                                statusModalWindowControl = statusWindow.kendoCiresonWindow({
                                    title: localization.Resolution,
                                    width: 600,
                                    height: 480,
                                    actions: [],
                                    /**
                                     * Activate trigger when window open animation is complete.
                                     */
                                    activate: function () {

                                    },
                                }).data("kendoWindow");

                                var ths = this;
                                statusWindow.find("#statusOk").click(function () {
                                    vm.viewModel[dateField] = new Date().toISOString();
                                    statusModalWindowControl.close();
                                    statusWindow.remove();

                                    //send email
                                    kendo.ui.progress(cont, true);
                                    sendEmail(ths, cont);
                                });

                                statusWindow.find("#statusCancel").click(function () {
                                    statusModalWindowControl.close();
                                    statusWindow.remove();
                                });

                                statusModalWindowControl.open();
                            }
                            else {
                                //send email
                                kendo.ui.progress(cont, true);
                                sendEmail(this, cont);
                            }

                        },
                        /**
                         * Cancel Click Event Handler
                         */
                        cancelClick: function (e) {
                            console.log('cancelClick', e);
                            if (app.isMobile()) {
                                win.close();
                            } else {
                                $.when(kendo.ui.ExtOkCancelDialog.show({
                                    title: localization.Warning,
                                    message: localization.UnsavedDataMessage,
                                    icon: "fa fa-exclamation",
                                })
                                   ).done(function (response) {
                                       if (response.button === "ok") {
                                           if (vm.widget)
                                               vm.widget.remoteManageRecepient = null;
                                           shown = false;
                                           cont.modal('hide');
                                       }
                                   });
                            }
                        },
                        /**
                         * Email Template Change Event Handler
                         */
                        emailTemplateChange: function (e) {
                            var filter = {
                                field: "Id",
                                operator: "eq",
                                value: e.sender._old, //_old stores the selected value's id
                            };
                            tempateDataSource.filter(filter);

                            var dView = tempateDataSource.view();
                            var subject = (dView.length > 0 && dView[0].Subject.replace(/\s/g, '').length > 0) ? "[" + vm.viewModel.Id + "] " + dView[0].Subject : "[" + vm.viewModel.Id + "] " + vm.viewModel.Title;
                            var content = (dView.length > 0 && dView[0].Content.replace(/\s/g, '').length > 0) ? dView[0].Content : "";

                            content = cont.find("#messageEditor").html(content).text();

                            //change new line (\n) to line break (<br>) on non-html template only
                            if (!content.match(/<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/)) {
                                content = cont.find("#messageEditor").html(content).text().replace(/\r\n|\r|\n/g, "<br />");
                            }

                            this.set("emailSubject", subject);
                            this.set("emailHTMLMessage", content);

                            tempateDataSource.filter({});
                        },
                        /**
                         * Resize Editor Event Handler
                         */
                        resizeEditor: function (e) {
                            e.preventDefault();

                            var $this = $(e.currentTarget);

                            if ($this.children('i').hasClass('fa-expand')) {
                                $this.children('i').removeClass('fa-expand');
                                $this.children('i').addClass('fa-compress');
                            }
                            else if ($this.children('i').hasClass('fa-compress')) {
                                $this.children('i').removeClass('fa-compress');
                                $this.children('i').addClass('fa-expand');
                            }
                            $('#EmailNotificationWindow').find('table.k-editor').toggleClass('editor-expanded');
                        },
                        showChangeStatus: (vm.type === "Incident"),
                        changeStatus: false,
                        sendEmailAttachments: [],
                        fromWorkItemAttachementsId: [],
                        setFirstResponseDate: (_.isNull(vm.viewModel.FirstResponseDate)) ? true : false,
                        enableFirstResponseDate: (_.isNull(vm.viewModel.FirstResponseDate)) ? true : false,
                        /**
                         * Open Popup Event Handler
                         */
                        openPopup: function (e) {
                            console.log('openPopup', e);
                            var filter = [{
                                logic: "and",
                                filters: [
                                    { field: "Email", operator: "neq", value: '' },
                                    { field: "Email", operator: "neq", value: null },
                                ],
                            }];
                            var popupWindow = _objectPickerPopup.getPopup('3567434d-015f-8dcc-f188-0a407f3a2168', null, null, filter, null, true);
                            popupWindow.setSaveCallback(function (object) {
                                console.log('setSaveCallback', object);
                                var recipientType = (e.currentTarget.id === "toField") ? "recipientToList" : "recipientCCList";

                                var picker = (e.currentTarget.id === "toField")
                                    ? cont.find("#userPickerTo").data("kendoMultiSelect")
                                    : cont.find("#userPickerCc").data("kendoMultiSelect");
                                /*
                                var userEmailObj = _.find(_vmWindow.users, function (item) {
                                    return item.guid === object.BaseId;
                                });*/
                                var userEmailObj = {
                                    'Email': object.Email,
                                    'Id': object.Id,
                                    'Name': object.DisplayName,
                                };

                                var isUserExist = picker.dataSource.data().find(function (element) {
                                    return element.Id === userEmailObj.Id;
                                });

                                if (!isUserExist) {
                                    var key = (recipientType.toLowerCase().indexOf("to") > -1) ? "TO" : "CC";
                                    filter[key] = userEmailObj.Name;
                                    picker.dataSource.add(userEmailObj);
                                }

                                recipientList[recipientType].push(userEmailObj);
                                picker.value(_.pluck(recipientList[recipientType], "Id"));
                            });
                            popupWindow.open();
                        },
                        /**
                         * View Workitem Files Event Handler
                         */
                        viewWorkItemFiles: function() {
                            var flyoutWindow = attachmentPickerFlyout.getPopup(vm, "sendEmail");
                            flyoutWindow.setSaveCallback(function(data) {
                                var selectedFiles = data.selectedFiles || [];
                                for (var n = 0; n < selectedFiles.length; n++) {
                                    _vmWindow.sendEmailAttachments.push(selectedFiles[n]);
                                    _vmWindow.fromWorkItemAttachementsId.push(selectedFiles[n].BaseId);
                                }
                            });
                            flyoutWindow.open();
                        },
                        filesCount: vm.viewModel.FileAttachment.length || 0,
                        users: [],
                        Status: { Id: "", Name: "" },
                        changeStatusSetting: {
                            statusTypeId: "",
                            defaultStatusId: "",
                            rootStatusEnumId: "",
                            enableChangeStatus: true,
                        },
                    });

                    //add control to the window
                    kendo.bind(cont, _vmWindow);

                    if (!app.isMobile()) {
                        cont.on('shown.bs.modal',
                            function () {
                                //prevent shown event from duplicate trigger
                                $(this).off('shown.bs.modal');
                                //prevent body from scrolling when flyout is open
                                $("body").addClass("modal-open");
                                //set to true when flyout is open
                                shown = true;
                                //reposition modal backdrop
                                $('.modal-backdrop').each(function (i, obj) {
                                    cont.before(obj);
                                });
                                //remove modal focus so tools with popup would work
                                $(document).off('focusin.modal');

                                $('[data-toggle="tooltip"]').tooltip();

                                //set defaults
                                if (!_.isUndefined(vm.widget) && vm.widget.remoteManageRecepient && vm.widget.remoteManageRecepient.BaseId != null)
                                    getRemoteManageRecepient();
                                else
                                    getAffectedUserEmail(_vmWindow);

                                getSendEmailChangeStatusSettings(_vmWindow);
                                setDefaultWIStatus(_vmWindow);

                                //build editor
                                buildEditor(cont.find("#messageEditor"), _vmWindow);

                                //build uploader
                                initializeUploader(cont, _vmWindow);

                                //build userpicker
                                initializeUserPicker(cont.find("#userPickerTo"), _vmWindow, "recipientToList");
                                initializeUserPicker(cont.find("#userPickerCc"), _vmWindow, "recipientCCList");

                                //build status picker
                                initializeStatusPicker(cont.find("#statusPicker"), _vmWindow);

                                //apply change status rule if root enum is not specified
                                if (_.isNull(_vmWindow.changeStatusSetting.rootStatusEnumId)) {
                                    applyChangeStatus(cont, vm, _vmWindow);
                                }

                            });

                        cont.on('hidden.bs.modal', function () {
                            $("body").removeClass("modal-open");

                            $('.modal-backdrop').remove();

                            var toPicker = cont.find("#userPickerTo").data("kendoMultiSelect");
                            var ccPicker = cont.find("#userPickerCc").data("kendoMultiSelect");

                            //clear userpicker values on modal close
                            toPicker.value("");
                            ccPicker.value("");

                            //clear filters and recipients vars
                            filter = {};
                            recipientList = {
                                recipientToList: [],
                                recipientCCList: [],
                            };
                        });

                        cont.on('hide.bs.modal',
                            function (e) {
                                if (shown && $('#extOkCancelDialog').length <= 1) {
                                    _vmWindow.cancelClick(e);
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    return false;
                                }
                            });
                        /*
                        $.get("/api/V3/User/GetUserList",
                            { fetchAll: true },
                            function (data) {
                                var names = $.map(data, function (value, i) {
                                    return { 'id': i, 'name': value.Name, 'guid': value.Id, 'email': value.Email };
                                });

                                //store user data to viewmodel
                                _vmWindow.users = names;
                                cont.modal('show');
                            });
                          */
                          cont.modal('show');
                    } else {
                        $.get("/api/V3/User/GetUserList",
                            { fetchAll: true },
                            function(data) {
                                var names = $.map(data,
                                    function(value, i) {
                                        return { 'id': i, 'name': value.Name, 'guid': value.Id, 'email': value.Email };
                                    });

                                //store user data to viewmodel
                                _vmWindow.users = names;

                                //build userpicker
                                initializeUserPicker(cont.find("#userPickerTo"), _vmWindow, "recipientToList");
                                initializeUserPicker(cont.find("#userPickerCc"), _vmWindow, "recipientCCList");

                                //build uploader
                                initializeUploader(cont, _vmWindow);

                                //set status defaults
                                getSendEmailChangeStatusSettings(_vmWindow);
                                setDefaultWIStatus(_vmWindow);

                                //build status picker
                                initializeStatusPicker(cont.find("#statusPicker"), _vmWindow);

                                //init editor
                                buildEditor(cont.find("#messageEditor"), _vmWindow);

                                $('[data-toggle="tooltip"]').tooltip();

                                cont.removeClass('hide');
                                cont.show();

                                win.open();

                            });

                    }
                },
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "sendEmail",
            };
            $.extend(true, properties, node);
            // Add in Anchor
            var anchorElm = new kendo.View(link(properties), {
                wrap: false,
                model: viewModel,
                /**
                * Add In Anchor
                */
                init: function (e) { },
            });
            callback(anchorElm.render());

            //more functions
            var tempateDataSource = new kendo.data.DataSource({
                transport: {
                    read: "/EmailNotification/GetNotificationTemplates",
                    dataType: "json",
                },
                schema: {
                    model: {
                        fields: {
                            Id: { type: "string" },
                            Name: { type: "string" },
                        },
                    },
                },
            });

            /**
             * Add To Comment Log Event Handler
             */
            var addToCommentLog = function (commentMessage,  setAsPrivate) {
                var newActionLog = {
                    EnteredBy: session.user.Name,
                    Title: localization.EMailSent,
                    IsPrivate: setAsPrivate,
                    EnteredDate: new Date().toISOString(),
                    LastModified: new Date().toISOString(),
                    Description: commentMessage,
                    DescriptionDisplay: commentMessage,
                    Image: app.config.iconPath + app.config.icons["E-Mail Sent"],
    		            ActionType: {
    		                Id: "15e86d4a-1b55-01be-C9fa-660a3cb3fc26",
    		                Name: "Email Sent",
    		            },
                    //ActionType: { Id: "15E86D4A-1B55-01BE-C9FA-660A3CB3FC26", Name: "E-Mail Sent" }
                }
                if (!vm.viewModel.ActionLog) {
                    vm.viewModel.ActionLog = [];
                }

                var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                if (actionLogType) {
                    vm.viewModel[actionLogType].push(newActionLog);
                }
            }

            /**
             * Save Failure Event Handler
             */
            var saveFailure = function (exceptionMessage) {
                if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                    app.lib.message.add(exceptionMessage, "danger");
                } else {
                    //fallback to generic message
                    app.lib.message.add(localization.PleaseCorrectErrors, "danger");
                }
                app.lib.message.show();
            }

            /**
             * Get Affected User
             */
            var getAffectedUserEmail = function (_vmWindow) {
                if (viewModel.RequestedWorkItem && viewModel.RequestedWorkItem.DisplayName != null) {
                    filter['TO'] = vm.viewModel.RequestedWorkItem.DisplayName;
                }
                var affectedUserId = (vm.viewModel.RequestedWorkItem) ? vm.viewModel.RequestedWorkItem.BaseId : "";
                $.ajax({
                    url: "/EmailNotification/GetffectedUserEmail",
                    type: "GET",
                    data: { baseId: affectedUserId },
                    /**
                     * Get Affected User Email Success Event Handler
                     */
                    success: function (data, textStatus, jqXHR) {
                        if (!_.isUndefined(data) && data != "") {
                            var affectedUser = { Id: vm.viewModel.RequestedWorkItem.BaseId, Name: vm.viewModel.RequestedWorkItem.DisplayName, Email: data };
                            var picker = $("#userPickerTo").data("kendoMultiSelect");
                            var isUserExist = picker.dataSource.data().find(function (element) {
                                return element.Id === affectedUser.Id;
                            });

                            //add affected user to userpicker data source if id does not exist
                            if (!isUserExist) {
                                picker.dataSource.add(affectedUser);
                            }

                            //add affected user to recipient list
                            recipientList["recipientToList"].push(affectedUser);

                            //set userpicker value to affected user
                            picker.value(affectedUser.Id);
                        }
                    },
                });
            }

            /**
             * Get Remote Manage Recipient
             */
            var getRemoteManageRecepient = function () {
                $(document).ready(function() {
                    var recepient = { Id: vm.widget.remoteManageRecepient.BaseId, Name: vm.widget.remoteManageRecepient.DisplayName, Email: vm.widget.remoteManageRecepient.Email };
                    filter['TO'] = recepient.DisplayName;
                    var picker = $("#userPickerTo").data("kendoMultiSelect");
                    var isUserExist = picker.dataSource.data().find(function (element) {
                        return element.Id === recepient.Id;
                    });

                    //add affected user to userpicker data source if id does not exist
                    if (!isUserExist) {
                        picker.dataSource.add(recepient);
                    }

                    //add affected user to recipient list
                    recipientList["recipientToList"].push(recepient);

                    //set userpicker value to affected user
                    picker.value(recepient.Id);
                });
            }

            /**
             * Set Default Work Item Status Event Handler
             */
            var setDefaultWIStatus = function (_vmWindow) {
                var enumId = _vmWindow.changeStatusSetting.defaultStatusId;

                if (enumId == null || enumId == "") {
                    _vmWindow.Status.set("Id", vm.viewModel.Status.Id);
                    _vmWindow.Status.set("Name", vm.viewModel.Status.Name);
                } else {
                    $.ajax({
                        url: "/api/V3/Enum/GetEnumDisplayName",
                        type: "GET",
                        data: { id: enumId },
                        async: false,
                        /**
                         * Get Status DisplayName Success Event Handler
                         */
                        success: function (data, textStatus, jqXHR) {
                            _vmWindow.Status.set("Id", enumId);
                            _vmWindow.Status.set("Name", data);
                        },
                    });
                }
            }

            /**
             * Validate Email Address Handler
             */
            var validateEmailAddress = function (arrEmail) {
                var invalidEmailAddress = null;
                for (var i in arrEmail) {
                    var email = arrEmail[i].trim();
                    if (email == "") continue;
                    if (app.validateEmail(email) == false) {
                        invalidEmailAddress = email;
                        break;
                    }
                }
                return invalidEmailAddress;
            }

            /**
             * Initialize Uploader
             */
            var initializeUploader = function (cont, _vmWindow) {
                _vmWindow.set("sendEmailAttachments", []);
                _vmWindow.set("filesCount", 0);

                /**
                 * File Action Event Handler
                 */
                var fileAction = function (el) {

                    if (el.hasClass("opennewtab")) {
                        var win = window.open('about:blank');
                        setTimeout(function () { //FireFox seems to require a setTimeout for this to work.
                            win.document.body.appendChild(win.document.createElement('img')).src = el.closest(".thumbnail-file").find(".thumbnail-img img")[0].src;
                            win.href = el.closest(".thumbnail-file").find(".thumbnail-img img")[0].src;
                            win.focus();
                        }, 0);

                    }
                    else {
                        var dialog = $('.fileattachment-img-modal');
                        var downloadUrl = app.config.rootURL + "FileAttachment/ViewFile/";
                        var listView = cont.find(".fileattachment-list").data("kendoListView");
                        var item = el.closest("[role='option']");
                        var dataItem = listView.dataSource.getByUid(item.data("uid"));


                        if (dataItem.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && !el.hasClass("download")) {
                            dialog.kendoDialog({
                                modal: true,
                                title: dataItem.DisplayName,
                                content: "<div class='file-img-container'><img src=\"data:image/png;base64," + dataItem.Content.data + "\" onerror=\"this.onerror = null; this.src = '/Content/Images/Icons/FileUpload/document.svg';\" alt=\"" + dataItem.DisplayName + "\" /></div>",
                                animation: {
                                    open: {
                                        effects: "fade:in",
                                    },
                                },
                            });
                            $('.k-window.k-widget').addClass('acivity-popup-window');
                            dialog.data("kendoDialog").open();
                        } else {
                            if (!_.isNull(dataItem.BaseId)) {
                                location.href = downloadUrl + dataItem.BaseId;
                            } else {
                                if (dataItem.Content.data) {
                                    var fileName = dataItem.DisplayName;
                                    var a = document.createElement("a");
                                    document.body.appendChild(a);
                                    a.style = "display: none";

                                    a.href = "data:application/octet-stream;charset=utf-16le;base64," + dataItem.Content.data;
                                    a.download = fileName;
                                    a.click();
                                    document.body.removeChild(a);
                                }
                            }
                        }
                    }
                }

                cont.find(".fileattachment-list").kendoListView({
                    dataSource: _vmWindow.sendEmailAttachments,
                    template: kendo.template(cont.find("#fileTemplate").html()),
                    selectable: "single",
                    /**
                     * File Attachment dataBound Event Handler
                     */
                    dataBound: function (e) {

                        cont.find(".custom-click").on("click", function () {
                            fileAction($(this));
                        });

                        if (!app.isMobile()) {
                            //Remove view image icon if not in mobile.
                            cont.find("a[view-image]").parent().hide();

                            cont.find(".thumbnail-img").on("click", function () {
                                fileAction($(this));
                            });
                        }
                    },
                    /**
                     * File Attachment Remove Event Handler
                     */
                    remove: function (e) {
                        //console.warn(_vmWindow)
                    },
                });



                var uploader = cont.find("#email-attachment").kendoUpload({
                    async: {
                        saveUrl: "/FileAttachment/UploadAttachment/" + vm.viewModel.BaseId + "?className=" + vm.viewModel.ClassName + "&count=" + vm.viewModel.FileAttachment.length,
                        autoUpload: true,
                    },
                    /**
                     * Upload Email Attachment Success Event Handler
                     */
                    success: function (e) {
                        kendo.ui.progress(cont.find(".fileattachment-list"), true);
                        var response = e.response;
                        if (e.operation == "upload") {
                            for (var i = 0; i < e.files.length; i++) {
                                var file = e.files[i].rawFile;
                                if (file) {
                                    if (!_.isUndefined(response.FileAttachment)) {
                                        _vmWindow.sendEmailAttachments.push(response.FileAttachment);
                                        _vmWindow.set("attachmentErrorMessage", "");
                                        _vmWindow.set("okEnabled", true);
                                    } else if (!_.isUndefined(response.success) && response.success == false) {
                                        _vmWindow.set("okEnabled", false);
                                        kendo.ui.ExtAlertDialog.show({
                                            title: localization.ErrorDescription,
                                            message: response.message,
                                            icon: "fa fa-exclamation",
                                        });
                                    }
                                }
                            }
                        }
                        kendo.ui.progress(cont.find(".fileattachment-list"), false);
                    },
                    /**
                     * Upload Email Attachment Error Event Handler
                     */
                    error: function (e) {
                        var err = $.parseJSON(e.XMLHttpRequest.responseText);
                        $.map(e.files, function (file) {
                            console.warn("Could not upload " + file.name);
                        });
                    },
                    showFileList: false,
                    dropZone: ".drop-zone-element",
                }).data("kendoUpload");

                cont.find(".browse-file").click(function (e) {
                    $("#email-attachment").trigger("click");
                });


            }

            /**
             * Initialize User Picker
             */
            var initializeUserPicker = function (targetEle, viewModel, targetProp) {
                //skipped initialization if we already have one created
                if (!_.isUndefined(targetEle.data("kendoMultiSelect"))) { return; }

                var targetKey = (targetEle[0].id.toLowerCase().indexOf("to") > -1) ? "TO" : "CC";
                var userPicker = targetEle.kendoMultiSelect({
                    placeholder: localization.Search,
                    dataTextField: "Name",
                    dataValueField: "Id",
                    autoBind: false,
                    filter: "contains",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "/api/V3/User/GetUserListWithEmail",
                                data: {
                                    filterByAnalyst: false,
                                    maxNumberOfResults: 1000,
                                    /**
                                     * Filter Users
                                     */
                                    userFilter: function () {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    },
                                },
                            },
                        },
                        serverFiltering: true,
                        filter: [{ field: "Email", operator: "neq", value: "" }],
                    }),
                    /**
                     * Filtering Handler
                     */
                    filtering: function (e) {
                        if (e.filter != undefined) {
                            var key = (e.sender.element[0].id.toLowerCase().indexOf("to") > -1) ? "TO" : "CC";
                            filter[key] = e.filter.value;
                        }
                    },
                    /**
                     * Filtering Handler
                     */
                    open: function () {
                        var filters = this.dataSource.filter();
                        if (filters!=null) {
                            //clear applied filters
                            //Filter should be cleared to remove conflict with assigning the affected users.
                            //this.dataSource.filter({});
                        }
                    },
                    tagTemplate: "<span title='#: data.Email #'>#: data.Name #;</span>",
                    /**
                     * Select Event Handler
                     */
                    select: function (e) {
                        var currentList = recipientList[targetProp];
                        currentList.push(e.dataItem);
                        recipientList[targetProp] = currentList;
                    },
                    /**
                     * Deselect Event Handler
                     */
                    deselect: function (e) {
                        var currentList = recipientList[targetProp];
                        if (e.dataItem.Id) {
                            currentList = _.filter(currentList,
                                function(item) {
                                    return item.Id !== e.dataItem.Id;
                                });
                        }
                        recipientList[targetProp] = currentList;
                    },
                    clearButton: false,
                }).data("kendoMultiSelect");

                userPicker.input.on("keydown", function (e) {
                    if (e.keyCode === 9) {
                        //treat tab event as "enter"
                        var e = jQuery.Event("keydown");
                        e.which = 13; // # Some key code value
                        e.keyCode = 13;
                        userPicker.input.trigger(e);
                    }
                });
            }

            /**
             * Send Email Event Handler
             */
            var sendEmail = function (_vmWindow, cont) {
                var bChangeStatus = _vmWindow.changeStatus;
                var bAddActionLog = _vmWindow.addToLog;
                var addToLogSkipped = false;
                var bHasAttachment = (_vmWindow.sendEmailAttachments.length > 0);
                var strAttachedFileNames = (_vmWindow.sendEmailAttachments.length > 0)
                    ? _.pluck(_vmWindow.sendEmailAttachments, "DisplayName").join('|') : ""; //multiple filenames, pipe delimited
                var strMessage = encodeURIComponent(_vmWindow.emailHTMLMessage);
                var strMessagePlain = _vmWindow.emailTextMessage;

                var workItemFileIds = (_vmWindow.fromWorkItemAttachementsId.length > 0)
                    ? _vmWindow.fromWorkItemAttachementsId.join(',') : "";


                strMessage = (session.emailFooterTemplate.length > 0)
                    ? strMessage + "\r\n" + encodeURIComponent($('<div/>').html(session.emailFooterTemplate).text())
                    : strMessage;

                var emailData = {
                    To: _vmWindow.emailTo,
                    Cc: _vmWindow.emailCC,
                    Subject: _vmWindow.emailSubject.replace(/</g, "%3C").replace(/>/g, "%3E"),
                    Message: strMessage,
                    AttachedFileNames: strAttachedFileNames,
                    WorkItemId: vm.viewModel.BaseId,
                    workItemFileIds: workItemFileIds,
                };
                var sendEmailAttachments = _vmWindow.sendEmailAttachments;
                var bSetFirstResponsDate = _vmWindow.setFirstResponseDate;

                $.ajax({
                    url: "/EmailNotification/SendEmailNotification",
                    type: "POST",
                    data: emailData,
                    async: false,
                    /**
                     * Send Email Notification Success Event Handler
                     */
                    success: function (data, textStatus, jqXHR) {
                        var bSuccess = data.toLowerCase() == "true" ? true : false;
                        kendo.ui.progress(cont, false);
                        if (bSuccess) {
                            $.when(kendo.ui.ExtAlertDialog.show({
                                title: localization.SendEmail,
                                message: localization.SendEmailSuccessMessage,
                            })).done(function (response) {
                                //change status if status in dropdown has value
                                if (_vmWindow.Status != null && _vmWindow.Status.Id != "") {
                                    vm.viewModel.Status.set("Id", _vmWindow.Status.Id);
                                    bChangeStatus = true;
                                }

                                if (bHasAttachment) {
                                    //add file attachment details to vm after email is sent
                                    if (!_.isUndefined(vm.viewModel.FileAttachment)) {
                                        _.each(sendEmailAttachments, function (item) {
                                            vm.viewModel.FileAttachment.push(item);

                                            var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                                            if (actionLogType) {
                                                vm.viewModel[actionLogType].unshift(new app.dataModels[actionLogType].fileAdded(item.DisplayName));
                                            }
                                        });
                                    }
                                }

                                if (bAddActionLog) {
                                    strMessagePlain = _.isUndefined(strMessagePlain) ? "" : strMessagePlain.substring(0, 4000);

                                    if (strMessagePlain.length > 0) {
                                        addToCommentLog(strMessagePlain.replace(/</g, '&lt;').replace(/>/g, '&gt;'), _vmWindow.setAsPrivate);
                                    } else {
                                        bAddActionLog = false;
                                        addToLogSkipped = true;
                                    }
                                }

                                if (bSetFirstResponsDate) {
                                    vm.viewModel.set("FirstResponseDate", new Date().toISOString());
                                }

                                //--end additional change checks/processing

                                /**
                                 * Save changes and show warnings, if any
                                 */
                                var handleSaveSuccess = function () {
                                    if (vm.widget)
                                        vm.widget.remoteManageRecepient = null;
                                    shown = false;
                                    cont.modal('hide');
                                    vm.save(function () {
                                        app.lib.message.add(localization.ChangesApplied, "success");
                                        switch (vm.type) {
                                        case "ChangeRequest":
                                            location.href = "/ChangeRequest/Edit/" + vm.viewModel.Id + "/";
                                            break;
                                        case "ServiceRequest":
                                            location.href = "/ServiceRequest/Edit/" + vm.viewModel.Id + "/";
                                            break;
                                        case "Incident":
                                            location.href = "/Incident/Edit/" + vm.viewModel.Id + "/";
                                            break;
                                        case "Problem":
                                            location.href = "/Problem/Edit/" + vm.viewModel.Id + "/";
                                            break;
                                        case "ReleaseRecord":
                                            location.href = "/ReleaseRecord/Edit/" + vm.viewModel.Id + "/";
                                            break;
                                        default:
                                            //my workitem view
                                            location.href = "/View/cca5abda-6803-4833-accd-d59a43e2d2cf/";
                                            break;
                                        }
                                    }, saveFailure);
                                }
                                if (addToLogSkipped) {
                                    //note: addToLogSkipped dialog will only show if the empty message validation fails
                                    $.when(kendo.ui.ExtAlertDialog.show({
                                        title: localization.SkippedAddingLogEntryTitle,
                                        message: localization.ErrorAddingLogEntryMessage,
                                        icon: "fa fa-warning",
                                    })).done(function() {
                                        handleSaveSuccess();
                                    });
                                } else {
                                    handleSaveSuccess();
                                }
                                //--end save changes and warnings
                            });
                        } else {
                            $.when(kendo.ui.ExtAlertDialog.show({
                                title: localization.SendEmail,
                                message: localization.SendEmailFailedMessage,
                            }));
                            kendo.ui.progress(cont, false);
                            console.log(jqXHR, textStatus, localization.SendEmailFailedMessage);
                        }
                    },
                    /**
                     * Send Email Notification Error Event Handler
                     */
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR, textStatus, errorThrown);
                    },
                });
            }

            /**
             * Build Editor
             */
            var buildEditor = function (targetEle, _vmWindow) {
                var defaultTools = [
                     "bold", "italic", "underline",
                     "formatting", "foreColor", "backColor",
                     "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
                     "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                     "createLink", "unlink", "insertImage",
                     "viewHtml",
                     "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn",
                     { name: "insertLineBreak", shift: true },
                     { name: "insertParagraph", shift: true },
                ];
                var mobileTools = [
                    "formatting",
                    "createLink", "unlink", "insertImage", "viewHtml",
                    "bold", "italic", "underline",
                    "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                    "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn",
                    { name: "insertLineBreak", shift: true },
                    { name: "insertParagraph", shift: true },
                ];
                var editor = targetEle.data("kendoEditor");
                if (!_.isUndefined(editor)) { return; }
                editor = targetEle.kendoEditor({
                    /**
                     * Change Event Handler
                     */
                    change: function (e) {
                        var content = e.sender.body.innerText || e.sender.body.textContent;
                        _vmWindow.set("emailTextMessage", content);
                    },
                    tools: app.isMobileDevice() ? mobileTools : defaultTools,
                    stylesheets: ["/Content/Styles/cireson.mentions-in-keditor.min.css"],
                    encoded: true,
                    /**
                     * Paste Event Handler
                     */
                    paste: function (e) {
                    },
                    pasteCleanup: {
                        /**
                        * pasteCleanup Handler
                        */
                        custom: function (html) {

                            try {
                                if ($(html)[0].tagName === "IMG") {

                                    var dataSRC = $(html).attr('src');
                                    var blob;

                                    if (dataSRC.match(/^data:image\/(png|jpg);base64,/) === null) {
                                        var img = new Image;

                                        img.setAttribute('crossOrigin', 'anonymous');

                                        img.src = dataSRC;

                                        $(img).one("load",
                                            function () {
                                                setTimeout(function () {
                                                        dataSRC = getBase64Image(img);
                                                        blob = dataURItoBlob(dataSRC);
                                                        uploadPastedImage(blob, _vmWindow);
                                                    },
                                                    0);
                                            }).each(function () {
                                            if (this.complete) $(this).load();
                                        });
                                    } else {
                                        blob = dataURItoBlob(dataSRC);
                                        uploadPastedImage(blob, _vmWindow);
                                    }
                                }
                            } catch (err) {
                                //console.error(err);
                            }

                            return html;
                        },
                    },
                });

                /**
                 * Upload Pasted Image Handler
                 */
                function uploadPastedImage(file, _vmWindow) {
                    var d = new Date();
                    var timestamp = d.getTime();

                    var formData = new FormData();
                    formData.append('files', file, "screenshot_" + timestamp + ".png");

                    $.ajax({
                        url: "/FileAttachment/UploadAttachment/" +
                            vm.viewModel.BaseId +
                            "?className=" +
                            vm.viewModel.ClassName +
                            "&count=" +
                            vm.viewModel.FileAttachment.length,
                        data: formData,
                        type: 'POST',
                        async: true,
                        contentType: false,
                        processData: false,
                        dataType: "json",
                        /**
                         * Upload Pasted Image Success Event Handler
                         */
                        success: function (response) {
                            if (!_.isUndefined(response.FileAttachment)) {
                                _vmWindow.sendEmailAttachments.push(response.FileAttachment);
                                _vmWindow.set("attachmentErrorMessage", "");
                                _vmWindow.set("okEnabled", true);
                            } else {
                                _vmWindow.set("attachmentErrorMessage", response.message);
                                _vmWindow.set("okEnabled", false);
                                _vmWindow.set("emailAttachment", "");
                            }
                        },
                        /**
                         * Upload Pasted Image Error Event Handler
                         */
                        error: function(err) {
                            console.warn(err);
                        },
                    });
                }

                /**
                 * Convert image to base64
                 */
                function getBase64Image(img) {
                    // Create an empty canvas element
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    // Copy the image contents to the canvas
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    // Get the data-URL formatted image
                    // Firefox supports PNG and JPEG. You could check img.src to
                    // guess the original format, but be aware the using "image/jpg"
                    // will re-encode the image.
                    var dataURL = canvas.toDataURL("image/png");
                    return dataURL;
                }

                /**
                 * Convert base64 data to blob
                 */
                function dataURItoBlob(dataURI) {
                    // convert base64 to raw binary data held in a string
                    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
                    var byteString = atob(dataURI.split(',')[1]);

                    // separate out the mime component
                    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

                    // write the bytes of the string to an ArrayBuffer
                    var ab = new ArrayBuffer(byteString.length);

                    // create a view into the buffer
                    var ia = new Uint8Array(ab);

                    // set the bytes of the buffer to the correct values
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    // write the ArrayBuffer to a blob, and you're done
                    var blob = new Blob([ab], { type: mimeString });
                    return blob;

                }

                /*
                var at_config = {
                    at: "@",
                    data: _vmWindow.users,
                    headerTpl: '<div class="atwho-header">Search Users</div>',
                    insertTpl: '${atwho-at}${name}',
                    displayTpl: "<li id='${guid}'> ${name} <br><span>${email}</span> </li>",
                    limit: 5,
                    startWithSpace: false,
                    editableAtwhoQueryAttrs: {},
                }

                var iframe = editor.prev()[0];
                var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

                var $inputor = $(innerDoc).find('body').atwho(at_config);
                $inputor.caret('pos', 47);
                $inputor.atwho('run');

                $inputor.on("inserted.atwho", function (event, $li) {
                    var picker = $("#userPickerTo").data("kendoMultiSelect");
                    var userId = $($li)[0].id;
                    var user = _.filter(at_config.data,
                        function (el) {
                            return el.guid === userId;
                        });

                    if (!_.isUndefined(user[0]) && !_.isNull(user[0])) {
                        var userData = { Id: user[0].guid, Name: user[0].name, Email: user[0].email }
                        recipientList["recipientToList"].push(userData);

                        var isUserExist = picker.dataSource.data().find(function (element) {
                            return element.Id === userData.Id;
                        });

                        //add at-mentioned user to userpicker data source if id does not exist
                        if (!isUserExist) {
                            picker.dataSource.add(userData);
                        }
                    }

                    picker.value(_.pluck(recipientList["recipientToList"], "Id"));
                });

                $(document).on("removed.atwho", function (e) {
                    var picker = $("#userPickerTo").data("kendoMultiSelect");
                    if ($(iframe).is($(e.target.activeElement))) {
                        var userId = e.removedAtWhoId;
                        var newList = _.without(recipientList["recipientToList"], _.findWhere(recipientList["recipientToList"], {
                            Id: userId,
                        }));
                        recipientList["recipientToList"] = newList;
                        picker.value(_.pluck(recipientList["recipientToList"], "Id"));
                    }
                });
                */
            }

            /**
             * Initialize Status Picker
             */
            var initializeStatusPicker = function (targetEle, viewModel) {
                var filterIdParam = "";
                var filterId = viewModel.changeStatusSetting.rootStatusEnumId;
                if (filterId != null) {
                    if (filterId.toLowerCase() == viewModel.Status.Id.toLowerCase()) {
                        filterIdParam = filterId;
                    } else {
                        filterIdParam = filterId + "," + viewModel.Status.Id;
                    }
                }
                var enumId = viewModel.changeStatusSetting.statusTypeId;

                var statusProperties = {
                    PropertyName: "Status",
                    PropertyDisplayName: "ChangeStatus",
                    EnumId: viewModel.changeStatusSetting.statusTypeId,
                    FilterIds: filterIdParam,
                    Disabled: !viewModel.changeStatusSetting.enableChangeStatus || !session.user.Analyst || pageForm.newWI,
                };

                buildEnumPicker(targetEle, statusProperties, viewModel);
            };

            /**
             * Initialize Enum Picker
             */
            var buildEnumPicker = function (container, props, vmModel) {
                enumPickerControl.build(vmModel, props, function (enumControl) {
                    container.html(enumControl);
                    app.controls.apply(container, {
                        localize: true,
                        vm: vmModel,
                        bind: true,
                    });
                });
            };

            /**
             * Apply Change Status
             */
            var applyChangeStatus = function (cont, vm, _vmWindow) {
                var selectedWiType = vm.type;
                var currentStatusId = vm.viewModel.Status.Id;
                var statusEnumId = _vmWindow.changeStatusSetting.statusTypeId;
                var rootStatusEnumId = _vmWindow.changeStatusSetting.rootStatusEnumId;
                var dropDownControl = cont.find('div[data-role="Status"]').data().handler._dropdown;
                var treeControl = cont.find('div[data-role="Status"]').data().handler._treeview;

                //determine allowed status changes based on current type and status
                var changeRules = app.lib.getChangeStatusRules();
                var changeRulesFilter = changeRules[selectedWiType][currentStatusId];

                //since Incident can have custom enums we need to check here if no rules were set then its not resolved
                if (selectedWiType == "Incident" && _.isUndefined(changeRulesFilter)) {
                    changeRulesFilter = { field: "Id", operator: "neq", value: app.constants.workItemStatuses.Incident.Closed };
                }

                if (!_.isNull(rootStatusEnumId)) {
                    changeRulesFilter = { field: "Id", operator: "eq", value: rootStatusEnumId };
                }

                //apply allowed status filtering
                treeControl.dataSource.options.serverFiltering = false;
                treeControl.dataSource.filter(changeRulesFilter);

                //reassign dropdown datasource with filtered data so that users will not be able to access restricted status by typing
                $.get("/api/V3/Enum/GetFlatList/", { id: statusEnumId, itemFilter: "" }, function (data) {
                    var comboDataSource = new kendo.data.DataSource();
                    comboDataSource.data(data);
                    comboDataSource.filter(changeRulesFilter);
                    if (comboDataSource.view().length > 0) {
                        dropDownControl.setDataSource(comboDataSource.view());
                    }
                });
            };

            /**
             * Get Send Email Change Status Settings
             */
            var getSendEmailChangeStatusSettings = function (viewModel) {
                switch (vm.type) {
                    case "ServiceRequest":
                        viewModel.changeStatusSetting.statusTypeId = app.constants.workItemStatuses.ServiceRequest.Id;
                        viewModel.changeStatusSetting.rootStatusEnumId = session.consoleSetting.SendEmailServiceRootStatusEnum;
                        viewModel.changeStatusSetting.defaultStatusId = session.consoleSetting.SendEmailServiceDefaultStatusEnum;
                        viewModel.changeStatusSetting.enableChangeStatus = session.consoleSetting.SendEmailServiceAllowAnalystToChangeStatus;
                        break;
                    case "ChangeRequest":
                        viewModel.changeStatusSetting.statusTypeId = app.constants.workItemStatuses.ChangeRequest.Id;
                        viewModel.changeStatusSetting.rootStatusEnumId = session.consoleSetting.SendEmailChangeRootStatusEnum;
                        viewModel.changeStatusSetting.defaultStatusId = session.consoleSetting.SendEmailChangeDefaultStatusEnum;
                        viewModel.changeStatusSetting.enableChangeStatus = session.consoleSetting.SendEmailChangeAllowAnalystToChangeStatus;
                        break;
                    case "Problem":
                        viewModel.changeStatusSetting.statusTypeId = app.constants.workItemStatuses.Problem.Id;
                        viewModel.changeStatusSetting.rootStatusEnumId = session.consoleSetting.SendEmailProblemRootStatusEnum;
                        viewModel.changeStatusSetting.defaultStatusId = session.consoleSetting.SendEmailProblemDefaultStatusEnum;
                        viewModel.changeStatusSetting.enableChangeStatus = session.consoleSetting.SendEmailProblemAllowAnalystToChangeStatus;
                        break;
                    case "ReleaseRecord":
                        viewModel.changeStatusSetting.statusTypeId = app.constants.workItemStatuses.ReleaseRecord.Id;
                        viewModel.changeStatusSetting.rootStatusEnumId = session.consoleSetting.SendEmailReleaseRootStatusEnum;
                        viewModel.changeStatusSetting.defaultStatusId = session.consoleSetting.SendEmailReleaseDefaultStatusEnum;
                        viewModel.changeStatusSetting.enableChangeStatus = session.consoleSetting.SendEmailReleaseAllowAnalystToChangeStatus;
                        break;
                    case "Incident":
                    default:
                        viewModel.changeStatusSetting.statusTypeId = app.constants.workItemStatuses.Incident.Id;
                        viewModel.changeStatusSetting.rootStatusEnumId = session.consoleSetting.SendEmailIncidentRootStatusEnum;
                        viewModel.changeStatusSetting.defaultStatusId = session.consoleSetting.SendEmailIncidentDefaultStatusEnum;
                        viewModel.changeStatusSetting.enableChangeStatus = session.consoleSetting.SendEmailIncidentAllowAnalystToChangeStatus;
                        break;
                }
            }
        },
    }

    return definition;

});
