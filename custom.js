/* global $, _, app, console, localizationHelper, performance, session, store, transformRO, window */
/* eslint "no-console": [ "error", { "allow": [ "log", "warn", "error"] } ] */

/*
 * Custom Script utilties and dynamically loading modules.
 */

// #region Utility functions

/**
 * Custom Script Utilities
 * @namespace utils
 * @property {string} debugCSSPath - The default path of the Debug CSS file.
 * @property {object} formTasks - Custom functions for app.custom.formTasks.
 */
app.custom.utils = {
  debugCSSPath: '/CustomSpace/Content/Styles/custom.debug.css',
  /**
   * Enable or Disable Debug mode for custom scripts.
   *
   * @param {boolean} enabled - Level of logging [1/2/3] => [Log, Warning, Error]
   * @returns {object} app.custom.utils for chaining.
   */
  setDebugMode: function setDebugMode(enabled) {
    'use strict';
    app.custom.utils.log('setDebugMode', {enabled: enabled, this: this});
    app.storage.custom.set('DEBUG_ENABLED', enabled);

    var debugEvents = [
          'window.hashChange',
          'sessionStorageReady',
          'dynamicPageReady',
          'queryBuilderGridReady',
          'sessionUserData.Ready',
          'gridTasks.Ready',
          'roTasks.Ready',
          'pageTasks.Ready',
          'wiTasks.Ready',
        ],
        flattenedDebugEvents = debugEvents.join(' ');

    /**
     * Debug events subcriber to log when events are triggered.
     *
     * @param {object} event - Event object.
     * @param {object} data - Event data.
     */
    function debugEventSubscriber(event, data) {
      app.custom.utils.log('EVENT ' + event.type + '.' + event.namespace, {
        event: event,
        data: data,
      });
    }

    app.events.unsubscribe(flattenedDebugEvents, debugEventSubscriber);
    if (enabled) {
      app.custom.utils.getCSS(app.custom.utils.debugCSSPath);
      app.events.subscribe(flattenedDebugEvents, debugEventSubscriber);
    } else {
      app.custom.utils.removeCSS(app.custom.utils.debugCSSPath);
    }

    return this;
  },

  /**
   * Log content to console.
   *
   * @param {number} [level=1] - Level of logging [1/2/3] => [Log, Warning, Error]
   * @param {...object} content - Log contents
   * @returns {object} app.custom.utils for chaining.
   */
  log: function log(level, content) {
    'use strict';
    var args = _.toArray(arguments);
    if (arguments.length > 1 && typeof arguments[0] === 'number') {
      args.splice(0, 1);
    }
    if (typeof performance.now === 'function') {
      args.splice(1, 0, performance.now());
    }

    switch((typeof level === 'number') ? level : 1) {
    case 1:
      console.log.apply(this, args);
      break;
    case 2:
      console.warn.apply(this, args);
      break;
    case 3:
      console.error.apply(this, args);
      break;
    default:
      console.log.apply(this, args);
    }

    return this;
  },

  /**
   * Load a JavaScript file with cache enabled from the provided url.
   *
   * @param {string} url - URL of JavaScript file to load.
   * @param {object} [options] - Optional additional Ajax options.
   * @returns {jqXHR} jQuery Ajax object.
   */
  getCachedScript: function getCachedScript(url, options) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('getCachedScript', url);
    }
    options = $.extend(options || {}, {
      dataType: 'script',
      cache: true,
      url: url,
    });

    return $.ajax(options);
  },

  /**
   * Load a CSS file from the provided url.
   *
   * @param {string} url - URL of file to load.
   */
  getCSS: function getCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('getCSS', url);
    }
    return $('<link>', {
      type: 'text/css',
      rel: 'stylesheet',
      href: url,
    }).appendTo('head');
  },

  /**
   * Unload a CSS file based on the provided url.
   *
   * @param {string} url - URL of file to unload.
   * @returns {object} app.custom.utils for chaining.
   */
  removeCSS: function removeCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('removeCSS', url);
    }

    if (!_.isEmpty(url)) {
      $('link').filter('[href*="' + url + '"]').remove();
    }

    return this;
  },

  formTasks: {
    /**
    * Bind calback to Page Form ready event for provided Work Item types.
    *
    * @param {object} types - Work Item types array or Options object.
    * @param {string} [label] - Task Label.
    * @param {function} [func] - Task callback function.
    */
    add: function add(types, label, func) {
      'use strict';
      if (!_.isUndefined(app.storage.custom) && app.storage.custom.get('DEBUG_ENABLED')) {
        app.custom.utils.log('formTasksUtils:add', {
          types: types,
          label: label,
          func: func,
        });
      }
      var options = {
        label: null,
      };
      if (arguments.length > 1) {
        $.extend(options, {
          types: types,
          label: label,
          func: func,
        });
      } else {
        if (typeof types === 'object') {
          $.extend(options, types);
        } else {
          if (!_.isUndefined(app.storage.utils)) {
            app.custom.utils.log(2, 'formTasksUtils:add', 'Warning! Invalid arguments supplied.');
          }
          return app.custom.formTasks.tasks;
        }
      }

      /**
      * Bind calback to Page Form ready event.
      *
      * @param {object} formObj - Page Form Object.
      */
      function bindCallback(formObj) {
        formObj.boundReady(function () {
          options.func(formObj);
        });
      }

      _.each(options.types, function (type) {
        app.custom.formTasks.add(type, options.label, bindCallback);
      });

      return app.custom.formTasks.tasks;
    },
  },
};

// #endregion Utility functions

/**
 * Custom Session Storage
 * @example
 * // Enable Debug Mode via Console/Script/Plugin
 * app.storage.custom.set('DEBUG_ENABLED', true);
 * @example
 * // Disable Debug Mode via Console/Script/Plugin
 * app.storage.custom.set('DEBUG_ENABLED', false);
 */
app.storage.custom = store.namespace('custom');

// Customizations
(function () {
  'use strict';

  // Enable Debug Mode to match enabled state from session storage.
  if (app.storage.custom.get('DEBUG_ENABLED')) {
    app.custom.utils.setDebugMode(true);
  }

  // Set Header Search Defaults
  if (
    window.location.href.indexOf('ServiceCatalog') > -1 ||
    window.location.href.indexOf('94ecd540-714b-49dc-82d1-0b34bf11888f') > -1 ||
    window.location.href.indexOf('02efdc70-55c7-4ba8-9804-ca01631c1a54') > -1
  ) {
    $(function () {
      /**
       * Set NavBar Search dropdown selection and placeholder.
       *
       * @param {string} [searchParamVal=WorkItem] - Search type.
       * @param {string} [searchConceptHTML=localization.WorkItems] - Display text of selected type.
       * @param {string} [searchInputPlaceholder=localization.SearchWorkItem] - Placeholder text in Search input field.
       */
      function headerSearchSetType(searchParamVal, searchConceptHTML, searchInputPlaceholder) {
        searchParamVal = searchParamVal || 'WorkItem';
        searchConceptHTML = searchConceptHTML || localizationHelper.localize('WorkItems', 'Work Items');
        searchInputPlaceholder = searchInputPlaceholder || localizationHelper.localize('SearchWorkItem', 'Search Work Item');

        var searchParam = $('input#search_param'),
            searchConcept = $('span#search_concept'),
            searchInput = $('input').filter('[name="searchText"]');

        searchParam.val(searchParamVal);
        searchConcept.html(searchConceptHTML);
        searchInput.attr('placeholder', searchInputPlaceholder);
      }
      $(headerSearchSetType);
    });
  }

  /**
  * Load ROToolbox community scripts.
  * @see {@link https://github.com/doyle-johnpaul/ROToolbox|ROToolbox}
  */
  function loadROToolbox() {
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('loadROToolbox');
    }
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/custom.ROToolbox.js').done(function () {
      app.lib.mask.apply('Applying Request Offering Template');
      transformRO();
      app.lib.mask.remove();
    });
  }

  // Request Offering Customizations
  if (window.location.pathname.indexOf('ServiceCatalog/RequestOffering') > -1) {
    // Load Custom Request Offering Tasks
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/roTaskMain-built.min.js');
    // Load ROToolbox for specific Request Offering.
    if (window.location.pathname.indexOf('175a6ac3-e3de-1384-269f-5d91fc0e3087') > -1) {
      if (app.isSessionStored()) {
        loadROToolbox();
      } else {
        // Subscribe loadROToolbox to sessionStorageReady event once.
        $(app.events).one('sessionStorageReady', loadROToolbox);
      }
    }
    return;
  }

  // Work Item Customizations
  if (
    (window.location.pathname.indexOf('/Incident/') > -1 || window.location.pathname.indexOf('/ServiceRequest/') > -1) &&
    (window.location.pathname.indexOf('/Edit/') > -1 || window.location.pathname.indexOf('/New/') > -1)
  ) {
    // Load Custom Work Item Tasks
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/forms/wiTaskMain-built.min.js');
    // Load Custom Work Item Grid Tasks
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
    app.custom.utils.getCachedScript('/CustomSpace/custom.wiGridTasks.js');
    // Mark 'Is Private' as true in Action Log.
    app.custom.utils.formTasks.add({
      types: [
        'Incident',
      //'Problem',
      //'ChangeRequest',
        'ServiceRequest',
      ],
      /**
       * Mark 'Is Private' as true in Action Log.
       */
      func: function setCommentIsPrivate() {
        var actionLogGridData = $('.k-grid').filter('[data-control-grid="actionLogGrid"]').data('kendoGrid'),
            actionLogVm;
        if (!_.isUndefined(actionLogGridData)) {
          actionLogVm = actionLogGridData.dataSource.transport.data.parent();
          if (!_.isUndefined(actionLogVm)) {
            actionLogVm.set('isPrivate', true);
          }
        }
      },
    });
    return;
  }

  // Page Customizations
  if (window.location.pathname.indexOf('/Page/') > -1) {
    // Load Custom Page Tasks
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/page/pageTaskMain-built.min.js');
    return;
  }

  // View Customizations
  if (window.location.pathname.indexOf('/View/') > -1) {
    // Load View Grid Tasks
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
    app.custom.utils.getCachedScript('/CustomSpace/custom.viewGridTasks.js');
    return;
  }
}());
