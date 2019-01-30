/*global $, _, app, console, define */

/**
Add Show Criteria
**/

define(function () {
  'use strict';
  var roTask = {
      Task: 'addShowCriteria',
      Type: 'RequestOffering',
      Label: 'Add Show Criteria',
      Access: true,
      Configs: {},
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

        function processNext(promptElm, next, func) {
          var targetElms = $(promptElm).nextAll(':not(.task-container)').slice(0, next);
          _.each(targetElms, func);
        }

        function flattenCriteria(criteria) {
          if (typeof criteria === 'object') {
            var criteriaArray = [],
                i;
            if (criteria.length <= 1) {
              return criteria.toString();
            } else {
              for (i = 0; i < criteria.length; ++i) {
                criteriaArray.push(flattenCriteria(criteria[i]));
              }
              return ('(' + criteriaArray.join(' ') + ')');
            }
          } else {
            return criteria.toString();
          }
        }

        function recompileAngularElm(targetElm) {
          // Check if angular framework is ready
          if (typeof angular === 'undefined') {
            // Wait for angular framework to be ready
            app.events.subscribe('angular.Ready', function processROTask(event) {
              'use strict';
              // Wait for Request Offering child scope to be ready
              angular.element($(targetElm)).ready(function () {
                'use strict';
                var angularElm = angular.element(targetElm),
                    $scope = angularElm.scope(),
                    $injector = angularElm.injector();

                console.log('recompileAngularElm', {
                  '$injector': $injector,
                  '$scope': $scope,
                  'angularElm': angularElm,
                });
                if (typeof $injector !== 'undefined') {
                  $injector.invoke(['$compile', function ($compile) {
                    $compile(angularElm)($scope);
                    $scope.$digest();
                  }]);
                }
              });
                // Unsubscribe from further angular.Ready events
              app.events.unsubscribe(event.type, processROTask);
            });
          } else {
            // Wait for Request Offering child scope to be ready
            angular.element($(targetElm)).ready(function () {
              'use strict';
              var angularElm = angular.element(targetElm),
                  $scope = angularElm.scope(),
                  $injector = angularElm.injector();

              console.log('recompileAngularElm', {
                '$injector': $injector,
                '$scope': $scope,
                'angularElm': angularElm,
              });
              if (typeof $injector !== 'undefined') {
                $injector.invoke(['$compile', function ($compile) {
                  $compile(angularElm)($scope);
                  $scope.$digest();
                }]);
              }
            });
          }
        }

        /* Initialization code */
        function initROTask() {
          var defaultOptions = {
            next: 1,
            operator: '||',
            group: 'start',
          };
          options = $.extend({}, defaultOptions, options);

          processNext(promptElm, options.next, function (targetElm) {
            var criteriaArray = [],
                criteriaGroupStack = [],
                currentCriteriaGroup = criteriaArray,
                prompElmNGShow = $(promptElm).attr('ng-show'),
                targetElmNGShow = $(targetElm).attr('ng-show'),
                roTaskElms = $(promptElm).nextUntil(targetElm, '.task-container');

            criteriaGroupStack.push(currentCriteriaGroup);
            // Do not add criteria if ng-show for task-container is empty or blank
            if (prompElmNGShow !== null && prompElmNGShow.length !== 0 && prompElmNGShow !== " ") {
              // Do not add initial operator is ng-show for target question is empty of blank
              if (targetElmNGShow !== null && targetElmNGShow.length !== 0 && targetElmNGShow !== " ") {
                currentCriteriaGroup.push(targetElmNGShow);
                currentCriteriaGroup.push(options.operator);
              }
              switch (options.group) {
              case 'start':
                currentCriteriaGroup.push([prompElmNGShow]);
                currentCriteriaGroup = currentCriteriaGroup.slice(-1)[0];
                criteriaGroupStack.push(currentCriteriaGroup);
                break;
              default:
                currentCriteriaGroup.push(prompElmNGShow);
                break;
              }
            }

            // Process all task-containers for potential criteria
            _.each(roTaskElms, function (roTaskElm) {
                roTaskElm = $(roTaskElm);
                var parsedProperties = JSON.parse(roTaskElm.text()),
                    roTaskElmNGShow = roTaskElm.attr('ng-show'),
                    propName,
                    criteriaOptions = {};
                if (typeof parsedProperties['criteria'] !== 'undefined') {
                  $.extend(criteriaOptions, defaultOptions, parsedProperties['criteria']);                  
                  currentCriteriaGroup.push(criteriaOptions.operator);
                  // Return true if ng-show for task-container is empty or blank (Always Display)
                  if (roTaskElmNGShow !== null && roTaskElmNGShow.length !== 0 && roTaskElmNGShow !== " ") {
                    roTaskElmNGShow = 'true';
                  }
                  
                  switch (criteriaOptions.group) {
                  case 'start':
                    currentCriteriaGroup.push([roTaskElmNGShow]);
                    currentCriteriaGroup = currentCriteriaGroup.slice(-1)[0];
                    criteriaGroupStack.push(currentCriteriaGroup);
                    break;
                  case 'continue':
                    currentCriteriaGroup.push(roTaskElmNGShow);
                    break;
                  case 'end':
                    currentCriteriaGroup.push(roTaskElmNGShow);
                    criteriaGroupStack.pop();
                    currentCriteriaGroup = criteriaGroupStack.slice(-1)[0];
                    break;
                  }
                }
            });

            if (flattenCriteria(criteriaArray) !== targetElmNGShow) {
              $(targetElm).attr('ng-show', flattenCriteria(criteriaArray));
              recompileAngularElm(targetElm);
            }
          });
        }

        initROTask();
      },
    };

  return definition;
});
