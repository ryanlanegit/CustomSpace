/* global $, _, angular, app, define */

/**
 * 'Add Show Criteria' Request Offering Task
 * @module addShowCriteriaController
 * @see module:roTaskMain
 * @see module:roTaskBuilder
 */
define([
  'CustomSpace/Scripts/serviceCatalog/roTaskUtils',
],
function (
  roTaskUtils
) {
  'use strict';
  var roTask = {
      Name: 'addShowCriteria',
      Type: 'RequestOffering',
      Label: 'Add Show Criteria',
      Configs: {},
      Access: true,
    },

    /**
     * @exports addShowCriteriaController
     */
    definition = {
      template: null,
      task: roTask,
      /**
       * Build Request Offering Task.
       *
       * @param {Object} vm - View Model of the base roTask plugin.
       * @param {Object} roTaskElm - Source task container element.
       * @param {Object} options - Parsed options from roTaskElm's JSON contents
       */
      build: function build(vm, roTaskElm, options) {
        if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
          app.custom.utils.log('addShowCriteriaController:build', {
            task: roTask,
            roTaskElm: roTaskElm,
            options: options,
          });
        }

        // #region Utility functions

        /**
          * Get function name from provided call string.
          * @example
          * // returns 'compareString'
          * getfnCallName("compareString(prompt1.value,'!=','Test')");
          *
          * @param {(function|string)} fn - Function Call String
          * @returns {string} Function name
         */
        function getfnCallName(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_NAME = /^\s*([^\(\s]*)/g,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
              fnText = fnString.replace(STRIP_COMMENTS, '');
          return fnText.match(FN_NAME)[0];
        }

        /**
         * Get argument list from provided call string.
         * @example
         * // returns ['prompt1.value',"'!='","'Test'"]
         * getfnCallArgList("compareString(prompt1.value,'!=','Test')");
         *
         * @param {(function|string)} fn - Function Call String
         * @returns {string[]} Argument List
         */
        function getfnCallArgList(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m,
              FN_ARG_SPLIT = /,/,
              FN_ARG = /^\s*(_?)(.+?)\1\s*$/,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
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

        /**
         * Get function name from provided definition string or function.
         * @example
         * // returns 'compareString'
         * getfnDefinitionName("function compareString(){...}");
         *
         * @param {(function|string)} fn - Function definition String or Object
         * @returns {string} Function name
         */
        function getfnDefinitionName(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_NAME = /^\s*function\s*([^\(\s]*)/mi,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
              fnText = fnString.replace(STRIP_COMMENTS, '');
          return fnText.match(FN_NAME)[1];
        }

        /**
         * Get param list from provided definition string or function.
         * @example
         * // returns ['param1', 'param2', 'param3']
         * getfnDefinitionArgList("function compareString(param1, param2, param3){...}");
         *
         * @param {(function|string)} fn - Function definition String or Object
         * @returns {string} Function name
         */
        function getfnDefinitionArgList(fn) {
          var fnString = (typeof fn === 'function') ? fn.toString() : fn,
              FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/mi,
              FN_ARG_SPLIT = /,/,
              FN_ARG = /^\s*(_?)(.+?)\1\s*$/,
              STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
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

        /**
         * Remove provided value from source array
         * @example
         * // returns 2 and tests is now [1,3]
         * var tests = [1,2,3];
         * arrayRemove(tests, 2);
         *
         * @param {Object[]} array - Source array to be modified.
         * @param {Object} value - Value to be removed.
         * @returns {Object} Return removed value.
         */
        function arrayRemove(array, value) {
          var index = array.indexOf(value);
          if (index >= 0) {
            array.splice(index, 1);
          }
          return value;
        }

        /**
         * Recursively flatten criteria array into a string
         * @example
         * // returns "(compareString(prompt1.value,'!=','Test') || compareString(prompt2.value,'!=',''))"
         * var testCriteria = [
         *  "compareString(prompt1.value,'!=','Test')",
         *  '||',
         *  "compareString(prompt2.value,'!=','')"
         * ];
         * flattenCriteria(testCriteria);
         *
         * @param {Object} targetElm - Target elmement to be recompiled.
         * @returns {String} Flattened criteria array
         */
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

        // #endregion Utility functions

        /**
         * Update related $$watchers list entries and recompile Angular element.
         *
         * @param {Object} targetElm - Target elmement to be recompiled.
         */
        function recompileAngularElm(targetElm) {
          // Async wait for Angular framework to be ready
          roTaskUtils.waitForAngular(function () {
            var $element = angular.element(targetElm),
                $scope = $element.scope(),
                $injector = $element.injector(),
                $$watchers = $scope.$$watchers,
                targetElmNGOriginalShow = $(targetElm).attr('ng-original-show'),
                relatedElms,
                sortedRelatedElms,
                targetIndex,
                filteredWatchers;

            if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
              app.custom.utils.log('addShowCriteriaController:recompileAngularElm', {
                targetElm: targetElm,
                $element: $element,
                $scope: $scope,
                $injector: $injector,
                $$watchers: $$watchers,
              });
            }

            if (typeof $injector !== 'undefined') {
              // Remove Existing Watchers for Ng-Show
              relatedElms = $('.row').filter('[ng-show="' + targetElmNGOriginalShow + '"], .row[ng-original-show="' + targetElmNGOriginalShow + '"]').filter(':not([addShowCriteria])').add(targetElm);
              sortedRelatedElms = _.sortBy(relatedElms, function (relatedElm) {
                return $(relatedElm).find('input[ng-model]').attr('ng-model');
              }).reverse();
              targetIndex = _.indexOf(sortedRelatedElms, targetElm)*2;
              filteredWatchers = _.filter($$watchers, function (watcher) {
                if (watcher.exp === targetElmNGOriginalShow && typeof watcher.fn === 'function') {
                  var fnName = getfnDefinitionName(watcher.fn);
                  if (fnName === '' || fnName === 'ngShowWatchAction') {
                    return true;
                  }
                }
                return false;
              });

              if (
                typeof filteredWatchers[targetIndex] !== 'undefined' &&
                typeof filteredWatchers[targetIndex+1] !== 'undefined'
              ) {
                arrayRemove($$watchers, filteredWatchers[targetIndex]);
                arrayRemove($$watchers, filteredWatchers[targetIndex+1]);
              } else {
                app.custom.utils.log(3, 'addShowCriteriaController:recompileAngularElm',
                  'Angular App watchers modification failure', {
                  targetElm: targetElm,
                  targetElmNGOriginalShow: targetElmNGOriginalShow,
                  sortedRelatedElms: sortedRelatedElms,
                  filteredWatchers: filteredWatchers,
                  targetIndex: targetIndex,
                  relatedElms: relatedElms,
                  $$watchers: $$watchers,
                });
              }

              // Recompile Angular Element
              $injector.invoke(['$compile', function ($compile) {
                $(targetElm).attr('addShowCriteria', true);
                $compile($element)($scope);
              }]);
            }
          });
        }

        /**
         * Update related $$watchers list entries and recompile Angular element.
         *
         * @param {Object} $scope - Angular scope of target elmement.
         * @param {Object} criteriaOptions - Options object.
         * @param {String} ngShowAttr - Target elmement's ng-show attribute value.
         */
        function patchCriteriafn($scope, criteriaOptions, ngShowAttr) {
          if (criteriaOptions.hasOwnProperty('ng-show')) {
            var fnName = getfnCallName(ngShowAttr);
            if ($scope.$parent.hasOwnProperty(fnName)) {
              var fnDefinition = $scope.$parent[fnName],
                  fnCallArgList = getfnCallArgList(ngShowAttr),
                  fnDefinitionArgList = getfnDefinitionArgList(fnDefinition);
              if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                app.custom.utils.log('addShowCriteriaController:build:patchCriteriafn', {
                  ngShowAttr: ngShowAttr,
                  fnName: fnName,
                  fnDefinition: fnDefinition,
                  fnDefinitionArgList: fnDefinitionArgList,
                  fnCallArgList: fnCallArgList,
                });
              }

              for (var propName in criteriaOptions['ng-show']) {
                if (criteriaOptions['ng-show'].hasOwnProperty(propName)) {
                  var propValue = criteriaOptions['ng-show'][propName],
                      argIndex = fnDefinitionArgList.indexOf(propName);
                  if (argIndex !== -1) {
                    if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
                      app.custom.utils.log('addShowCriteriaController:build:patchCriteriafn', 'Found function argument', {
                        propname: propName,
                        oldValue: fnCallArgList[argIndex],
                        newValue: propValue,
                      });
                    }
                    fnCallArgList[argIndex] = propValue;
                  } else {
                    app.custom.utils.log(2, 'addShowCriteriaController:build:patchCriteriafn', 'Unable to find function argument "' + propName + '".');
                  }
                }
              }

              ngShowAttr = fnName + '(' + fnCallArgList.join(', ') + ')';
            } else {
              app.custom.utils.log(2, 'addShowCriteriaController:build:patchCriteriafn', 'Unable to find function "' + fnName + '" in scope.');
            }
          }
          return ngShowAttr;
        }

        /**
         * Request Offering Task initialization script
         */
        function initROTask() {
          var defaultOptions = {
            next: 1,
            operator: '||',
            group: 'continue',
          };
          options = $.extend({}, defaultOptions, options);
          roTaskUtils.processNext(roTaskElm, options.next, function (targetElm) {
            roTaskUtils.waitForAngular(function () {
              var subTaskElms = $(roTaskElm).nextUntil(targetElm, '.task-container'),
                  $element = angular.element(targetElm),
                  $scope = $element.scope(),
                  criteriaArray = [],
                  criteriaGroupStack = [],
                  currentCriteriaGroup = criteriaArray,
                  roTaskNGShowAttr = $(roTaskElm).attr('ng-show'),
                  targetNGShowAttr = $(targetElm).attr('ng-show'),
                  flattenedCriteria = '';

              criteriaGroupStack.push(currentCriteriaGroup);
              // Do not add criteria if ng-show for task-container is empty or blank
              if (roTaskNGShowAttr) {
                if (options.hasOwnProperty('ng-show')) {
                    roTaskNGShowAttr = patchCriteriafn($scope, options, roTaskNGShowAttr);
                }
                // Do not add initial operator if ng-show for target question is empty or blank
                if (targetNGShowAttr) {
                  currentCriteriaGroup.push(targetNGShowAttr, options.operator);
                }
                switch (options.group) {
                case 'start':
                  currentCriteriaGroup.push([roTaskNGShowAttr]);
                  currentCriteriaGroup = currentCriteriaGroup.slice(-1)[0];
                  criteriaGroupStack.push(currentCriteriaGroup);
                  break;
                default:
                  currentCriteriaGroup.push(roTaskNGShowAttr);
                  break;
                }
              }

              // Process all sub task-containers for potential criteria
              _.each(subTaskElms, function (subTaskElm) {
                  subTaskElm = $(subTaskElm);
                  var parsedProperties = JSON.parse(subTaskElm.text()),
                      subTaskNGShowAttr = subTaskElm.attr('ng-show'),
                      criteriaOptions = {},
                      criteriaPropertyName = roTask.Name + '.criteria';
                  if (typeof parsedProperties[criteriaPropertyName] !== 'undefined') {
                    $.extend(criteriaOptions, defaultOptions, parsedProperties[criteriaPropertyName]);
                    currentCriteriaGroup.push(criteriaOptions.operator);
                    // Return true if ng-show for task-container is empty or blank (Always Display)
                    if (!subTaskNGShowAttr) {
                      subTaskNGShowAttr = 'true';
                    } else if (criteriaOptions.hasOwnProperty('ng-show')) {
                      subTaskNGShowAttr = patchCriteriafn($scope, criteriaOptions, subTaskNGShowAttr);
                    }

                    switch (criteriaOptions.group) {
                    case 'start':
                      currentCriteriaGroup.push([subTaskNGShowAttr]);
                      currentCriteriaGroup = currentCriteriaGroup.slice(-1)[0];
                      criteriaGroupStack.push(currentCriteriaGroup);
                      break;
                    case 'continue':
                      currentCriteriaGroup.push(subTaskNGShowAttr);
                      break;
                    case 'end':
                      currentCriteriaGroup.push(subTaskNGShowAttr);
                      criteriaGroupStack.pop();
                      currentCriteriaGroup = criteriaGroupStack.slice(-1)[0];
                      break;
                    }
                  }
              });

              // Update ng-show and recompile if flattenedCriteria changes value
              flattenedCriteria = flattenCriteria(criteriaArray);
              if (targetNGShowAttr !== flattenedCriteria) {
                $(targetElm).attr('ng-show', flattenedCriteria);
                $(targetElm).attr('ng-original-show', targetNGShowAttr);
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
