/*global $, _, app, console, localization, performance, session, store, transformRO, window */

/**
Custom
Minimal Configuration For Custom Grid Tasks
**/

/*
  Custom Utilities
*/
app.custom.utils = {
  setDebugMode: function setDebugMode(enabled) {
    'use strict';
    console.log('setDebugMode', {enabled: enabled, this: this});
    app.storage.custom.set('DEBUG_ENABLED', enabled);
    if (enabled) {
      app.custom.utils.getCSS('/CustomSpace/Content/Styles/custom.debug.css');
    } else {
      app.custom.utils.removeCSS('/CustomSpace/Content/Styles/custom.debug.css');
    }
  },

  getCachedScript: function getCachedScript(url, options) {
    'use strict';
    if (app.storage.custom.get('DEBUG_ENABLED')) {
      console.log('getCachedScript', performance.now(), url);
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
      console.log('getCSS', performance.now(), url);
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
      console.log('removeCSS', url);
    }

    if (url !== null && url.length > 0 && url !== ' ') {
      $('link[href*="' + url + '"]').remove();
    }
  },
};

/*
  Custom Session Debugging
*/
app.storage.custom = store.namespace('custom');

// app.storage.custom.set('DEBUG_ENABLED', true); // Enable DEBUG Mode via Console/Script/Plugin
// app.storage.custom.set('DEBUG_ENABLED', false); // Disable DEBUG Mode via Console/Script/Plugin
if (app.storage.custom.get('DEBUG_ENABLED')) {
  console.log('DEBUG Mode Enabled', performance.now());
  // Load Debug CSS File
  app.custom.utils.getCSS('/CustomSpace/Content/Styles/custom.debug.css');

  // Debug subscribtion to out of the box and custom events
  (function () {
    'use strict';
    var debugEvents = [
      'sessionStorageReady',
      'dynamicPageReady',
      'gridTasks.Ready',
    ];

    app.events.subscribe(debugEvents.join(' '), function debugEventSubscriber(e, data) {
      console.log('EVENT ' + e.type + '.' + e.namespace, performance.now(), {
        event: e,
        data: data,
      });
    });
  }());
}

if (window.location.pathname.indexOf('/View/') > -1) {
  /*
    Custom Grid Tasks
  */
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
  app.custom.utils.getCachedScript('/CustomSpace/custom.gridTasks.js');
}
