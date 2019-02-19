/* global $, _, app, console, localization, performance, session, store, transformRO, window */
/* eslint "no-console": [ "error", { "allow": [ "log", "trace"] } ] */


/**
Custom
**/

/*
  Custom Utilities
*/
app.custom.utils = {
  setDebugMode: function setDebugMode(enabled) {
    'use strict';
    app.custom.utils.log('setDebugMode', {enabled: enabled, this: this});
    app.storage.custom.set('DEBUG_ENABLED', enabled);
    if (enabled) {
      app.custom.utils.getCSS('/CustomSpace/Content/Styles/custom.debug.css');
    } else {
      app.custom.utils.removeCSS('/CustomSpace/Content/Styles/custom.debug.css');
    }
  },

  log: function log(trace, content) {
    'use strict';
    var args = arguments;
    if (arguments.length > 1 && typeof arguments[0] === 'boolean') {
      args = Array.prototype.slice.call(arguments, 1);
      if (trace) {
        console.trace();
      }
    }
    Array.prototype.splice.call(arguments, 1, 0, performance.now());
    console.log.apply(this, arguments);
  },

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

  getCSS: function getCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('getCSS', performance.now(), url);
    }
    return $('<link>', {
      type: 'text/css',
      rel: 'stylesheet',
      href: url,
    }).appendTo('head');
  },

  removeCSS: function removeCSS(url) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('removeCSS', url);
    }

    if (url !== null && url.length > 0 && url !== ' ') {
      $('link[href*="' + url + '"]').remove();
    }
  },

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

  stringFormat: function stringFormat(format) {
    'use strict';
    format = format.toString();
    if (arguments.length > 1) {
      var args = (typeof arguments[1] === 'string' || typeof arguments[1] === 'number') ? Array.prototype.slice.call(arguments, 1) : arguments[1],
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

/*
  Custom Session Debugging
*/
app.storage.custom = store.namespace('custom');

// app.storage.custom.set('DEBUG_ENABLED', true); // Enable DEBUG Mode via Console/Script/Plugin
// app.storage.custom.set('DEBUG_ENABLED', false); // Disable DEBUG Mode via Console/Script/Plugin
if (app.storage.custom.get('DEBUG_ENABLED')) {
  app.custom.utils.log('DEBUG Mode Enabled');
  // Load Debug CSS File
  app.custom.utils.getCSS('/CustomSpace/Content/Styles/custom.debug.css');

  // Debug subscribtion to out of the box and custom events
  (function () {
    'use strict';
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
    ];

    app.events.subscribe(debugEvents.join(' '), function debugEventSubscriber(e, data) {
      app.custom.utils.log('EVENT ' + e.type + '.' + e.namespace, {
        event: e,
        data: data,
      });
    });
  }());
}

if (window.location.pathname.indexOf('ServiceCatalog/RequestOffering') > -1) {
  /*
    Custom Request Offering Tasks
  */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/roTaskMain-built.min.js');

  function loadROToolbox(event) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      app.custom.utils.log('loadROToolbox', arguments);
    }
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/serviceCatalog/custom.ROToolbox.js').done(function () {
      app.lib.mask.apply('Applying Request Offering Template');
      transformRO();
      app.lib.mask.remove();
    });
    if (typeof event !== 'undefined') {
      // Unsubscribe from further sessionStorage events
      app.events.unsubscribe(event.type, loadROToolbox);
    }
  }

  if (app.isSessionStored()) {
    loadROToolbox();
  } else {
    app.events.subscribe('sessionStorageReady', loadROToolbox);
  }
} else if (window.location.pathname.indexOf('/Edit/') > -1 || window.location.pathname.indexOf('/New/') > -1) {
  if (window.location.pathname.indexOf('Incident') > -1 || window.location.pathname.indexOf('ServiceRequest') > -1) {
    // app.events.subscribe('wiTasks.Ready', function () { 'use strict'; window.location.reload(); });

    /*
      Custom Work Item Tasks
    */
    app.custom.utils.getCachedScript('/CustomSpace/Scripts/forms/wiTaskMain-built.min.js');

    /*
      Check Is Private In Action Log By Default
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
    Custom Page Tasks
  */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/page/pageTaskMain-built.min.js');
} else if (window.location.pathname.indexOf('/View/') > -1) {
  /*
    Custom Grid Tasks
  */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
  app.custom.utils.getCachedScript('/CustomSpace/custom.gridTasks.js');
}

/*
  Set Header Search Defaults
*/
if (
  (window.location.href.indexOf('ServiceCatalog') > -1) ||
  (window.location.href.indexOf('94ecd540-714b-49dc-82d1-0b34bf11888f') > -1) ||
  (window.location.href.indexOf('02efdc70-55c7-4ba8-9804-ca01631c1a54') > -1)
) {
  $(function () {
    'use strict';
    $(function () {
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
