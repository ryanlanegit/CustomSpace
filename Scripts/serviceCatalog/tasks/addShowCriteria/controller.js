/*global $, _, angular, app, console, define */

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

        function processOnAngularReady(targetElm, func) {
          if (typeof func === 'function') {
            if (typeof angular === 'undefined') {
              // Wait for angular framework to be ready
              app.events.subscribe('angular.Ready', function processROTask(event) {
                'use strict';
                // Wait for Request Offering child scope to be ready
                angular.element(targetElm).ready(function () {
                  'use strict';
                  var angularElm = angular.element(targetElm),
                      $scope = angularElm.scope();
                  func(angularElm, $scope);
                });
                  // Unsubscribe from further angular.Ready events
                app.events.unsubscribe(event.type, processROTask);
              });
            } else {
              // Wait for Request Offering child scope to be ready
              angular.element(targetElm).ready(function () {
                'use strict';
                var angularElm = angular.element(targetElm),
                    $scope = angularElm.scope();
                func(angularElm, $scope);
              });
            }
          }
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
          vm.waitForAngular(targetElm, function () {
            'use strict';
            var angularElm = angular.element(targetElm),
                $scope = angularElm.scope(),
                $injector = angularElm.injector();

            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              console.log('recompileAngularElm', {
                '$injector': $injector,
                '$scope': $scope,
                'angularElm': angularElm,
              });
            }
            if (typeof $injector !== 'undefined') {
              $injector.invoke(['$compile', function ($compile) {
                $compile(angularElm)($scope);
                // $scope.$digest();
              }]);
            }
          });
        }

        // Get Function Name
        function getfnCallName(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_NAME = /^\s*([^\(\s]*)/g,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
              fnText = fnString.replace(STRIP_COMMENTS, ''),
              fnName = fnText.match(FN_NAME)[0];
          return fnText.match(FN_NAME)[0];
        }

        // Get Function Call Params
        function getfnCallArgList(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m,
              FN_ARG_SPLIT = /,/,
              FN_ARG = /^\s*(_?)(.+?)\1\s*$/,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
              fnText = fnString.replace(STRIP_COMMENTS, ''),
              argList = [],
              argDecl = fnText.match(FN_ARGS);
          _.each(argDecl[1].split(FN_ARG_SPLIT), function(arg){
            arg.replace(FN_ARG, function(all, underscore, name){
              argList.push(name);
            });
          });
          return argList;
        }

        // Get Function Definition Params
        function getfnDefinitionArgList(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
              FN_ARG_SPLIT = /,/,
              FN_ARG = /^\s*(_?)(.+?)\1\s*$/,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
              fnText = fnString.replace(STRIP_COMMENTS, ''), // Remove Comments from string
              argList = [],
              argDecl = fnText.match(FN_ARGS);
          _.each(argDecl[1].split(FN_ARG_SPLIT), function(arg){
            arg.replace(FN_ARG, function(all, underscore, name){
              argList.push(name);
            });
          });
          return argList;
        }

        function patchCriteriafn($scope, criteriaOptions, promptElmNGShow) {
          if (criteriaOptions.hasOwnProperty('ng-show')) {
            var fnName = getfnCallName(promptElmNGShow);
            if ($scope.$parent.hasOwnProperty(fnName)) {
              var fnDefinition = $scope.$parent[fnName],
                  fnCallArgList = getfnCallArgList(promptElmNGShow),
                  fnDefinitionArgList = getfnDefinitionArgList(fnDefinition),
                  propName;
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                console.log(fnName, {
                  fnCall: promptElmNGShow,
                  fnName: fnName,
                  fnDefinition: fnDefinition,
                  fnDefinitionArgList: fnDefinitionArgList,
                  fnCallArgList: fnCallArgList,
                });
              }

              for (propName in criteriaOptions['ng-show']) {
                if (criteriaOptions['ng-show'].hasOwnProperty(propName)) {
                  var propValue = criteriaOptions['ng-show'][propName],
                      argIndex = fnDefinitionArgList.indexOf(propName);
                  if (argIndex !== -1) {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                      console.log('Found function argument', {
                        propname: propName,
                        oldValue: fnCallArgList[argIndex],
                        newValue: propValue,
                      });
                    }
                    fnCallArgList[argIndex] = propValue;
                  } else {
                    console.log('Unable to find function argument "' + propName + '".');
                  }
                }
              }

              promptElmNGShow = fnName + '(' + fnCallArgList.join(', ') + ')';
            } else {
              console.log('Unable to find function "' + fnName + '" in scope.');
            }
          }
          return promptElmNGShow;
        }

        /* Initialization code */
        function initROTask() {
          var defaultOptions = {
            next: 1,
            operator: '||',
            group: 'continue',
          };
          options = $.extend({}, defaultOptions, options);
          processNext(promptElm, options.next, function (targetElm) {
            vm.waitForAngular(targetElm, function ($element, $scope) {
              var criteriaArray = [],
                  criteriaGroupStack = [],
                  currentCriteriaGroup = criteriaArray,
                  promptElmNGShow = $(promptElm).attr('ng-show'),
                  targetElmNGShow = $(targetElm).attr('ng-show'),
                  roTaskElms = $(promptElm).nextUntil(targetElm, '.task-container'),
                  flattenedCriteria = '';

              criteriaGroupStack.push(currentCriteriaGroup);
              // Do not add criteria if ng-show for task-container is empty or blank
              if (promptElmNGShow !== null && promptElmNGShow.length !== 0 && promptElmNGShow !== " ") {
                if (options.hasOwnProperty('ng-show')) {
                    promptElmNGShow = patchCriteriafn($scope, options, promptElmNGShow);
                }
                // Do not add initial operator is ng-show for target question is empty or blank
                if (targetElmNGShow !== null && targetElmNGShow.length !== 0 && targetElmNGShow !== " ") {
                  currentCriteriaGroup.push(targetElmNGShow, options.operator);
                }
                switch (options.group) {
                case 'start':
                  currentCriteriaGroup.push([promptElmNGShow]);
                  currentCriteriaGroup = currentCriteriaGroup.slice(-1)[0];
                  criteriaGroupStack.push(currentCriteriaGroup);
                  break;
                default:
                  currentCriteriaGroup.push(promptElmNGShow);
                  break;
                }
              }

              // Process all task-containers for potential criteria
              _.each(roTaskElms, function (roTaskElm) {
                  roTaskElm = $(roTaskElm);
                  var parsedProperties = JSON.parse(roTaskElm.text()),
                      roTaskElmNGShow = roTaskElm.attr('ng-show'),
                      propName,
                      criteriaOptions = {},
                      criteriaPropertyName = roTask.Task + '.criteria';
                  if (typeof parsedProperties[criteriaPropertyName] !== 'undefined') {
                    $.extend(criteriaOptions, defaultOptions, parsedProperties[criteriaPropertyName]);
                    currentCriteriaGroup.push(criteriaOptions.operator);
                    // Return true if ng-show for task-container is empty or blank (Always Display)
                    if (roTaskElmNGShow === null || roTaskElmNGShow.length === 0 || roTaskElmNGShow === " ") {
                      roTaskElmNGShow = 'true';
                    } else if (criteriaOptions.hasOwnProperty('ng-show')) {
                      roTaskElmNGShow = patchCriteriafn($scope, criteriaOptions, roTaskElmNGShow);
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
                flattenedCriteria = flattenCriteria(criteriaArray);
                $(targetElm).attr('ng-show', flattenedCriteria);
                $(targetElm).attr('ng-original-show', flattenedCriteria);
                recompileAngularElm(targetElm);
              }
            });
          });
        }

        initROTask();
      },
    };

  return definition;
});
