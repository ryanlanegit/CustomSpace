/* global $, _, app, define, kendo, pageForm */

/**
 *
 */
function createStagesView (viewModel) {
  'use strict';
  /**
   *
   */
  function getStagesViewModel () {
    var stagesVm = new kendo.Observable({

    });

    return stagesVm;
  }

  /**
   *
   */
  function buildStageListItems(activityList) {
    var html = '',
        listTemplate =
          '<li style="width: <%= width %>%" class="<%= state %>">' +
            '<a style="width:calc(100% - 32px);">' +
              //'<span><%= key %></span>' +
              '<span class="label label-info label-heading" style="font-weight: 400; width: auto; height: auto; margin-top: -2px;" id="statusname">' +
                '<i class="fa fa-<%= statusIcon %> fa-lg"></i>' +
              '</span>' +
              '<p style="text-align: left; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" title="<%= title %>">' +
                '<i class="ci <%= icon %> fa-lg"></i>' +
                ' <%= shortTitle %>' +
              '</p>' +
            '</a>' +
          '</li>',
        builtListItem = _.template(listTemplate),
        listItemWidth = 100 / activityList.length,
        activityStatusList = {
          Cancelled: '',
          Completed: '',
          Failed: '',
          InProgress: '',

        },
        inProgressStatusIds = _.chain(app.constants.workItemStatuses)
          .pluck('InProgress')
          .compact()
          .value(),
        inProgressStatusIds = _.chain(app.constants.workItemStatuses)
          .pluck('Completed')
          .compact()
          .value();

    _.each(activityList, function (listItem, index) {
      html += builtListItem({
        width: listItemWidth,
        state: (inProgressStatusIds.indexOf(listItem.Status.Id) !== -1) ? 'active' : '',
        key: index + 1,
        title: listItem.Title,
        shortTitle: listItem.Title, // (listItem.Title.indexOf(' - ') !== -1) ? listItem.Title.split(' - ').slice(1).join(' - ') : listItem.Title,
        icon: 'ci-' + listItem.FullClassName.replace(' ', '-').toLowerCase(),
        status: listItem.Status.Name,
        statusIcon: (inProgressStatusIds.indexOf(listItem.Status.Id) !== -1) ? 'check' : 'share',
      });
    });

    return html;
  }

  /**
   *
   */
  function init() {
    var stageList = [];

    if (!_.isEmpty(viewModel.Activity)) {
      var stagesTemplate =
          ﻿'<div id="stagesController" data-role="stagesController">' +
            '<div class="row">' +
              '<div id="TheForm" class="col-md-12" style="line-height: 1.5;">' +
                '<div id="stagesView" class="page form-wizard">' +
                  '<ul class="form-wizard-levels" data-template="propertyStagesTemplate" data-bind="source: Activity"></ul>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<script type="text/x-kendo-template" id="propertyStagesTemplate">' +
            '# var icon = "",' +
                  'state = "";' +
              'switch (Status.Id) {' +
              'case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83": ' + // ActivityStatusEnum.Active - In Progress
                'icon = "fa-play";' +
                'state = "active";' +
                'break;' +
              'case "89465302-2a23-d2b6-6906-74f03d9b7b41": ' + // ActivityStatusEnum.Cancelled - Cancelled
                'icon = "fa-times";' +
                'break;' +
              'case "9de908a1-d8f1-477e-c6a2-62697042b8d9": ' + // ActivityStatusEnum.Completed - Completed
                'icon = "fa-check";' +
                'break;' +
              'case "144bcd52-a710-2778-2a6e-c62e0c8aae74": ' + // ActivityStatusEnum.Failed - Failed
                'icon = "fa-times";' +
                'break;' +
              'case "d544258f-24da-1cf3-c230-b057aaa66bed": ' + // ActivityStatusEnum.OnHold - On Hold
                'icon = "fa-pause";' +
                'break;' +
              'case "50c667cf-84e5-97f8-f6f8-d8acd99f181c": ' + // ActivityStatusEnum.Ready - Pending
                'icon = "fa-spinner";' +
                'break;' +
              'case "baa948b5-cc6a-57d7-4b56-d2012721b2e5": ' + // ActivityStatusEnum.Rerun - Rerun
                'icon = "fa-reply-all";' +
                'break;' +
              'case "eaec5899-b13c-d107-3e1a-955da6bf9fa7": ' + // ActivityStatusEnum.Skipped - Skipped
                'icon = "fa-share";' +
                'break;' +
              '} #' +
            '<li style="width: 20%; width: calc(100% / ' + viewModel.Activity.length + '); box-sizing: border-box;" class="#= state #">' +
              '<a style="width: calc(100% - 32px);">' +
                //'<span><%= key %></span>' +
                '<span class="label label-info label-heading #= HeaderCss #" style="font-weight: 400; width: auto; height: auto; margin-top: -2px;" id="statusname">' +
                  '<i data-bind="attr: { title: Status.Name }" class="fa #= icon # fa-lg #= HeaderCss #"></i>' +
                //'<i data-bind="attr: { title: FullClassName }" class="ci #: "ci-" + FullClassName.replace(" ", "-").toLowerCase() # fa-lg #= HeaderCss #"></i>' +
                //'<i class="fa fa-<%= statusIcon %> fa-lg"></i>' +
                '</span>' +
                '<p data-bind="attr: { class: HeaderCss, title: Title }" style="text-align: left; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">' +
                   ' #= Title #' +
                '</p>' +
              '</a>' +
            '</li>' +
          '</script>',
        builtStages = _.template(stagesTemplate),
        stagesElm = $(builtStages()),
        stagesView = new kendo.View(stagesElm, {
          model: viewModel,
          wrap: false,
        });
      //$('.form-panel').prepend(stagesView.render());

      _.defer(function () {
          stagesView.render();
      });
      $('.form-panel').prepend(stagesElm);
    }
    return stageList;
  }

  return init();
}

createStagesView(pageForm.viewModel);
