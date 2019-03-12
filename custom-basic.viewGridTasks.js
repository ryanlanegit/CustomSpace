/* global $, _, app, console, performance, session, store, window */
/* eslint "no-console": [ "error", { "allow": [ "log", "warn", "error"] } ] */

/*
 * Custom Script utilties and dynamically loading modules.
 * Minimal Configuration For Custom Grid Tasks
 */

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
};

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

// Enable Debug Mode to match enabled state from session storage.
if (app.storage.custom.get('DEBUG_ENABLED')) {
  app.custom.utils.setDebugMode(true);
}

if (window.location.pathname.indexOf('/View/') > -1) {
  // Load Custom Grid Tasks
  app.custom.utils.getCachedScript('/CustomSpace/Scripts/grids/gridTaskMain-built.min.js');
  app.custom.utils.getCachedScript('/CustomSpace/custom.viewGridTasks.js');
}
