/* global $, _, app, console, localization, performance, session, store, transformRO, window */
/* eslint "no-console": [ "error", { "allow": [ "log", "warn", "error"] } ] */

/*
 * Custom Script utilties and dynamically loading modules.
 */

/**
 * Custom Script Utilities
 * @namespace utils
 * @property {string} utils.debugCSSPath - The default path of the Debug CSS file.
 */
app.custom.utils = {
  debugCSSPath: '/CustomSpace/Content/Styles/custom.debug.css',
  /**
   * Enable or Disable Debug mode for custom scripts.
   *
   * @param {boolean} enabled - Level of logging [1/2/3] => [Log, Warning, Error]
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
          'evalAsync.Ready',
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
  },

  /**
   * Log content to console.
   *
   * @param {number} [level=1] - Level of logging [1/2/3] => [Log, Warning, Error]
   * @param {...object} content - Log contents
   */
  log: function log(level, content) {
    'use strict';
    var args = arguments,
        outLevel = (typeof level === 'number') ? level : 1;
    if (arguments.length > 1 && typeof arguments[0] === 'number') {
      args = Array.prototype.slice.call(arguments, 1);
    }
    Array.prototype.splice.call(args, 1, 0, performance.now());

    switch(outLevel) {
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
   */
  removeCSS: function removeCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('removeCSS', url);
    }

    if (url !== null && url.length > 0 && url !== ' ') {
      $('link[href*="' + url + '"]').remove();
    }
  },

  /**
   * Validate if a given string is a valid GUID.
   *
   * @example
   * // returns true
   * isValidGUID('12604183-1B96-908C-DADE-B46EB8CDF4F9');
   *
   * @param {object|string} content - GUID string to validate.
   * @returns {boolean} Provided string is a valid GUID.
   */
  isValidGUID: function isValidGUID(content) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('isValidGUID', content);
    }
    content = content.toString();
    var rx_one = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi,
      rx_braces = /(^{|}$)/gi;
    return rx_one.test(
      content
        .replace(rx_braces, '')
    );
  },

  /**
   * Validate if a given string is a valid GUID.
   * @see {@link https://github.com/douglascrockford/JSON-js/blob/master/json2.js|JSON-js}
   * @example
   * // returns true
   * isValidJSON('{"bindHash": {"param" : "request"}}');
   *
   * @param {object|string} content - JSON string to validate.
   * @returns {boolean} Provided string is a valid JSON string.
   */
  isValidJSON: function isValidJSON(content) {
    // Regex Check For Valid JSON based on https://github.com/douglascrockford/JSON-js/blob/master/json2.js
    'use strict';
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g;

    return rx_one.test(
      content
        .replace(rx_two, '@')
        .replace(rx_three, ']')
        .replace(rx_four, '')
    );
  },

  /**
   * Format a string expression with
   *
   * @example
   * // returns '1: String'
   * stringFormat('{0}: {1}', '1', 'String');
   * @example
   * // returns '2: Array'
   * stringFormat('{0}: {1}', ['2', 'Array']);
   * @example
   * // returns '3: Object'
   * stringFormat('{key1}: {key2}', {key1: '3', key2: 'Object'});
   *
   * @param {string} format - String expression with placeholders.
   * @param {...string|string[]|object} content - Placeholder values.
   * @returns {string} Formatted string.
   */
  stringFormat: function stringFormat(format, content) {
    'use strict';
    format = format.toString();
    if (arguments.length > 1) {
      var args = (typeof content === 'string' || typeof content === 'number') ? Array.prototype.slice.call(arguments, 1) : content,
        key;
      for (key in args) {
        if (args.hasOwnProperty(key)) {
          format = format.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
        }
      }
    }
    return format;
  },
};

/**
 * Custom Session Storage
 */
app.storage.custom = store.namespace('custom');
// app.storage.custom.set('DEBUG_ENABLED', true); // Enable DEBUG Mode via Console/Script/Plugin
// app.storage.custom.set('DEBUG_ENABLED', false); // Disable DEBUG Mode via Console/Script/Plugin

// Enable Debug Mode to match enabled state from session storage.
if (app.storage.custom.get('DEBUG_ENABLED')) {
  app.custom.utils.setDebugMode(true);
}

if (window.location.pathname.indexOf('ServiceCatalog/RequestOffering') > -1) {
  /*
   * Load Custom Request Offering Tasks
   */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/roTaskMain-built.min.js');

  /**
   * Load ROToolbox community scripts.
   * @see {@link https://github.com/doyle-johnpaul/ROToolbox|ROToolbox}
   */
  function loadROToolbox() {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('loadROToolbox');
    }
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/custom.ROToolbox.js').done(function () {
      app.lib.mask.apply('Applying Request Offering Template');
      transformRO();
      app.lib.mask.remove();
    });
  }

  if (app.isSessionStored()) {
    loadROToolbox();
  } else {
    // Subscribe loadROToolbox to sessionStorageReady event once.
    $(app.events).one('sessionStorageReady', loadROToolbox);
  }
} else if (window.location.pathname.indexOf('/Edit/') > -1 || window.location.pathname.indexOf('/New/') > -1) {
  if (window.location.pathname.indexOf('Incident') > -1 || window.location.pathname.indexOf('ServiceRequest') > -1) {
    // app.events.subscribe('wiTasks.Ready', function () { 'use strict'; window.location.reload(); });

    /*
     *  Load Custom Work Item Tasks
     */
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/forms/wiTaskMain-built.min.js');

    /*
     * Check Is Private In Action Log By Default
     */
    app.custom.formTasks.add('ServiceRequest', null, function (formObj) {
      'use strict';
      formObj.boundReady(function () {
        $('#actionLogisPrivate').trigger('click');
        $('.link[data-bind*=sendEmail]').on('click', function () {
          $('#IsAddToLog').trigger('click').closest('div').hide();
        });
      });
    });

    app.custom.formTasks.add('Incident', null, function (formObj) {
      'use strict';
      formObj.boundReady(function () {
        $('#actionLogisPrivate').trigger('click');
        $('.link[data-bind*=sendEmail]').on('click', function () {
          $('#IsAddToLog').trigger('click').closest('div').hide();
          $('#ChangeStatusToPending').closest('div').hide();
        });
      });
    });
  }
} else if (window.location.pathname.indexOf('/Page/') > -1) {
  /*
   * Load Custom Page Tasks
   */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/page/pageTaskMain-built.min.js');
} else if (window.location.pathname.indexOf('/View/') > -1) {
  /*
   *  Load Custom Grid Tasks
   */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
  app.custom.utils.getCachedScript('/CustomSpace/custom.gridTasks.js');
}

/*
 * Set Header Search Defaults
 */
if (
  (window.location.href.indexOf('ServiceCatalog') > -1) ||
  (window.location.href.indexOf('94ecd540-714b-49dc-82d1-0b34bf11888f') > -1) ||
  (window.location.href.indexOf('02efdc70-55c7-4ba8-9804-ca01631c1a54') > -1)
) {
  $(function () {
    'use strict';
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
        searchConceptHTML = searchConceptHTML || localization.WorkItems;
        searchInputPlaceholder = searchInputPlaceholder || localization.SearchWorkItem;

        var searchParam = $('input#search_param'),
            searchConcept = $('span#search_concept'),
            searchInput = $('input[name="searchText"]');

        searchParam.val(searchParamVal);
        searchConcept.html(searchConceptHTML);
        searchInput.attr('placeholder', searchInputPlaceholder);
      }

      headerSearchSetType();
    });
  });
}
