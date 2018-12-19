app.custom.formTasks.add('ServiceRequest', null, function (formObj, viewModel) {
    formObj.boundReady(function () {
        $("#actionLogisPrivate").trigger("click")
        $(".link[data-bind*=sendEmail]").on("click", function () {
            $("#IsAddToLog").trigger("click").closest("div").hide();
        });
    });
});

app.custom.formTasks.add('Incident', null, function (formObj, viewModel) {
    formObj.boundReady(function () {
        $("#actionLogisPrivate").trigger("click")
        $(".link[data-bind*=sendEmail]").on("click", function () {
            $("#IsAddToLog").trigger("click").closest("div").hide();
            $("#ChangeStatusToPending").closest("div").hide();
        });
    });
});