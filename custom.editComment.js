/* global $, _, app */

/*
 * Dynamically add 'Edit' button to last comment in Action Log grid.
 */

 (function () {
   'use strict';
  /**
   * Dynamically add 'Edit' button to last comment in Action Log grid.
   */
  function addEditComment() {
    var commentBoxEditor = $('#commentBoxEditor').data('kendoEditor'),
        actionLogVm = commentBoxEditor.element.get(0).kendoBindingTarget.source,
        actionLogAddButtonElm = $('.action-log-add-button'),
        actionLogGridElm = $('[data-control-grid="actionLogGrid"]'),
        editButtomTemplate = '<i class="fa fa-pencil editComment pull-right" title="Edit"></i>',
        previousCommentText = '';

    actionLogAddButtonElm.on('click', function() {
      if ($('.editComment').length === 0) {
        var editButtonElm = $(editButtomTemplate),
            containerCellElm = actionLogGridElm.find('.k-master-row:eq(0) td:last');
        containerCellElm.append(editButtonElm);
    		editButtonElm.on('click', function() {
    			var actionLogComment = actionLogVm.actionLogSource[0];
    			commentBoxEditor.value(actionLogComment.Description);
          actionLogVm.set('isPrivate', actionLogComment.IsPrivate);
    			actionLogVm.actionLogSource.shift();
          previousCommentText = actionLogComment.Description;

          commentBoxEditor.trigger('keyup', {
            currentTarget: commentBoxEditor.body,
          });
          commentBoxEditor.trigger('change');
    		});
      }
  	});
  }

  /**
   * Initialize Dynamic 'Edit' Button Script
   *
   * @param {object} formObj - Page Form Object.
   *
   */
  function initEditComment(formObj) {
    formObj.boundReady(function(){
      addEditComment();
    });
  }

  var supportedTypes = [
    'Incident',
    'Problem',
    'ChangeRequest',
    'ServiceRequest',
  ];
  _.each(supportedTypes, function (type) {
    app.custom.formTasks.add(type, null, initEditComment);
  });
}());
