/**
fileAttachmentsDragDrop
**/

define(function (require) {
    var tpl = require("text!CustomSpace/Scripts/forms/predefined/externalFileAttachmentsDragDrop/view.html");
   
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }

            //get file content for images
            if (!_.isUndefined(vm.FileAttachment) && vm.FileAttachment.length > 0) {
                _.each(vm.FileAttachment, function (file) {
                    if (file.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: "/CustomSpace/ExternalFileAttachment/GetFileContent/",
                            data: { id: file.BaseId }
                        }).then(function (data) {
                            file.Content.data = data;
                        });
                    }
                });
            }

            var properties = {
                Required: node.Required,
                BaseId: vm.BaseId,
                AcceptExtension: _.isUndefined(node.AcceptExtension) ? "" : vm.AcceptExtension,
                ClassName: vm.Clas
            };
            $.extend(true, properties, node);

            var template = $(built(properties));

            var viewModel = new kendo.observable({
                isDesktop: !app.isMobile(),
                isMobile: app.isMobile(),
                isEnabled: true,
                isVisible: true,
                onSelect: function (e) {
                    template.find(".k-file-error").remove();
                    $.each(e.files, function (index, value) {
                        if (!_.isUndefined(node.AcceptExtension)
                            && node.AcceptExtension != ""
                            && !(node.AcceptExtension.toLowerCase().indexOf(value.extension.toLowerCase()) > -1)) {
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.ErrorDescription,
                                message: localization.FileExtensionInvalid + node.AcceptExtension,
                                icon: "fa fa-exclamation"
                            });
                            e.preventDefault();
                        }
                    });
                },
                onUploadSuccess: function (e) {
                    var vmFiles = !_.isUndefined(vm.FileAttachment) ? vm.FileAttachment : [];
                    var response = e.response;

                    if (e.operation == "upload") {
                        for (var i = 0; i < e.files.length; i++) {
                            var file = e.files[i].rawFile;
                            if (file) {
                                if (!_.isUndefined(response.FileAttachment)) {
                                    var f = _.filter(vm.FileAttachment,
                                        function(el) {
                                            return el.Content.data === response.FileAttachment.Content.data && el.BaseId === response.FileAttachment.BaseId;
                                        });
                                    if(f.length === 0)
                                        vm.FileAttachment.push(response.FileAttachment); //save to viewModel
                                } else if (!_.isUndefined(response.success) && response.success == false) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.ErrorDescription,
                                        message: response.message,
                                        icon: "fa fa-exclamation"
                                    });
                                }
                            }
                        }
                    }
                },
                onUploadError: function (e) {
                    var err = $.parseJSON(e.XMLHttpRequest.responseText);
                    $.map(e.files, function (file) {
                        console.warn("Could not upload " + file.name);
                    });
                },
                onRemove: function (e) {
                    $.get("/CustomSpace/ExternalFileAttachment/RemoveFileUpload/", { BaseId: vm.BaseId, fieldName: node.PropertyName }, function (data) {
                        template.find(".k-file").parent().remove();
                        //template.find("img").hide();
                        template.find("#div" + node.PropertyName).hide();
                        vm[node.PropertyName] = null;
                    });
                },
                onOpenFile: function (el) {

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
                        var downloadUrl = app.config.rootURL + "CustomSpace/ExternalFileAttachment/ViewFile/";
                        var listView = template.find(".fileattachment-list").data("kendoListView");
                        var item = el.closest("[role='option']");
                        var dataItem = listView.dataSource.getByUid(item.data("uid"));
                        
                        
                        if (dataItem.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && !el.hasClass("download")) {
                            dialog.kendoDialog({
                                modal: true,
                                title: dataItem.DisplayName,
                                content: "<div class='file-img-container'><img src=\"data:image/png;base64," + dataItem.Content.data + "\" onerror=\"this.onerror = null; this.src = '/Content/Images/Icons/FileUpload/document.svg';\" alt=\"" + dataItem.DisplayName + "\" /></div>",
                                animation: {
                                    open: {
                                        effects: "fade:in"
                                    }
                                }
                            });
                            $('.k-window.k-widget').addClass('acivity-popup-window');
                            dialog.data("kendoDialog").open();
                            dialog.parent().css("position", "fixed");

                            //close preview window on overlay click
                            $('.k-overlay').on("click", function () {
                                dialog.data("kendoDialog").close();
                            });

                        } else {
                            if (dataItem.Content.data && !dataItem.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
                                var blob = new Blob([dataItem.Content.data]);
                                var url = window.URL.createObjectURL(blob);
                                var fileName = dataItem.DisplayName;

                                if (navigator.msSaveOrOpenBlob) {
                                    navigator.msSaveOrOpenBlob(blob, fileName);
                                    return;
                                } else if (window.navigator.msSaveBlob) { // for IE browser
                                    window.navigator.msSaveBlob(blob, fileName);
                                    return;
                                }

                                var a = document.createElement("a");
                                document.body.appendChild(a);
                                a.style = "display: none";

                                a.href = url;
                                a.download = fileName;
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } else if (dataItem.BaseId) {
                                if (dataItem.BaseId != null) {
                                    location.href = downloadUrl + dataItem.BaseId;
                                }
                            }
                        }
                    }
                }
            });

            _.defer(function () {
                kendo.bind(template, viewModel);
                template.find(".fileattachment-list").kendoListView({
                    dataSource: vm.FileAttachment,
                    template: kendo.template($("#fileTemplate").html()),
                    selectable: "single",
                    //change: viewModel.onOpenFile,
                    dataBound: function () {
                        template.find(".custom-click").on("click", function () {
                            viewModel.onOpenFile($(this));
                        });

                        if (!app.isMobile()) {
                            //Remove view image icon if not in mobile.
                            template.find("a[view-image]").parent().hide();

                            template.find(".thumbnail-img img").on("click", function () {
                                viewModel.onOpenFile($(this));
                            });
                        }
                        
                    }
                });

                $("#files").kendoUpload({
                    async: {
                        saveUrl: "/CustomSpace/ExternalFileAttachment/UploadAttachment/" + vm.BaseId + "?className=" + vm.ClassName,
                        removeUrl: "remove",
                        autoUpload: true
                    },
                    success:  viewModel.onUploadSuccess,
                    error: viewModel.onUploadError,
                    showFileList: false,
                    dropZone: ".drop-zone-element"
                });

                $(".browse-file").off('click').on('click', function () {
                    $("#files").trigger("click");
                });

               
            });
            callback(template);
        }
    }

    return definition;

});