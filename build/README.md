

# Build

## build.bat

Batch file to run the r.js Optimizer on optimize Cireson modules, CustomSpace modules and CustomSpace CSS with r.js using build config files to determine level of RequireJS optimization and output file locations.
Must be run in an elevated prompt in order to add or override existing files in the CustomSpace directory.

## r.js

A command line tool for running JavaScript scripts that use the
[Asynchronous Module Definition API (AMD)](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)
for declaring and using JavaScript modules and regular JavaScript script files.

It is part of the [RequireJS project](http://requirejs.org), and works with
the RequireJS implementation of AMD.

r.js is a single script that has two major functions:

* Run AMD-based projects [in Node](http://requirejs.org/docs/node.html) and Nashorn, Rhino and xpcshell.
* Includes the [RequireJS Optimizer](http://requirejs.org/docs/optimization.html)
that combines scripts for optimal browser delivery.

### Node

    r.js main.js

Requires Node 0.4 or later.

r.js allows using Node modules installed via npm. For more info see the
[Use with Node](http://requirejs.org/docs/node.html) docs.

### Optimizer

#### What makes it special

The optimizer is better than using a plain concatenation script because it runs
require.js as part of the optimization, so it knows how to:

* Use [Loader Plugins](http://requirejs.org/docs/plugins.html) to load non-script
dependencies and inline them in built files.
* [Name anonymous modules](http://requirejs.org/docs/api.html#modulename).
If your optimization step does not do this, and you use anonymous modules, you
will get errors running the built code.

#### Relative path resolution rules

In general, if it is a path, it is relative to the build.js file used to hold the build options, or if just using command line arguments, relative to the current working directory. Example of properties that are file paths: appDir, dir, mainConfigFile, out, wrap.startFile, wrap.endFile.

For **baseUrl**, it is relative to **appDir**. If no appDir, then baseUrl is relative to the build.js file, or if just using command line arguments, the current working directory.

For **paths** and **packages**, they are relative to **baseUrl**, just as they are for require.js.

For properties that are module IDs, they should be module IDs, and not file paths. Examples are **name**, **include**, **exclude**, **excludeShallow**, **deps**.

#### Full Documentation

Full documentation for RequireJS Optimization can be found at [https://requirejs.org/docs/optimization.html](https://requirejs.org/docs/optimization.html).

## Current Build Files

### Optimizing Cireson Modules

* [build-viewMain.js](build-viewMain.js)
* [build-wiActivityMain.js](build-wiActivityMain.js)
* [build-wiMain.js](build-wiMain.js)
* [build-profileMain.js](build-profileMain.js)
### Optimizing CustomSpace

#### Modules
* [build-gridTaskMain.js](build-gridTaskMain.js)
* [build-profileMain.js](build-profileMain.js)
* [build-roTaskMain.js](build-roTaskMain.js)
* [build-wiTaskMain.js](build-wiTaskMain.js)

#### CSS
* [build-customCSS.js](build-customCSS.js)

## Template Build File

* [build-template.js](build-template.js)

A basic RequireJS build file that can be used for optimizing out of the box Cireson Portal modules as well as custom made modules in CustomSpace. An official RequireJS build file with extensive documentation on each property can be found at [example.build.js](https://github.com/requirejs/r.js/blob/master/build/example.build.js).

### baseUrl

RequireJS will use **baseUrl** to resolve the paths for any module names. The **baseUrl** should be relative to **appDir**.  No **appDir** is provided in the template so **baseUrl** is relative to the [build-template.js](https://stackedit.io/build-template.js) file, or if just using command line arguments or [built.bat](#build), the current working directory (see [Relative path resolution rules](#relative-path-resolution-rules)).  

We use one of two different relative paths depending on if we are relying on dependencies in CiresonPortal/Scripts or CiresonPortal/CustomSpace/Scripts:
```javascript
baseUrl: "../../Scripts", // => CiresonPortal/Scripts
baseUrl: "../Scripts", // => CiresonPortal/CustomSpace/Scripts
```

### paths

RequireJS will adjust any require or define **paths** relative to the [**baseUrl**](#baseurl). 

We typically use two values to specify the RequireJS/AMD loader plugin [text](https://github.com/requirejs/text) for loading text resources (e.g. view.html) and to specify where the CustomSpace directory is located relative to [**baseUrl**](#baseurl).
```javascript
paths: {
    // "requireLib": "../../Scripts/require",
    "text": "../../Scripts/require/text",
    "CustomSpace": "../"
},
```
**Note** If the module requires a separate instance of the RequireJS library on demand then the "requireLib" value should be uncommented (see [On Demand RequireJS Library Requirements](#on-demand-requirejs-library-requirements))
### include
A list of RequireJS modules to load, relative to [**baseUrl**](#baseurl) or  evaluated via [**paths**](#paths) if a match is found.
```javascript
include: [
    // "requireLib",
    "CustomSpace/Scripts/path/to/module/template"
],
```
**Note** If the module to load requires a separate instance of the RequireJS library on demand then "requireLib" should be uncommented (see [On Demand RequireJS Library Requirements](#on-demand-requirejs-library-requirements)).

### excludeShallow

Per the RequireJS docs on [excludeShallow](https://requirejs.org/docs/optimization.html#shallow), by optimizing all the modules in your project into one file, except the one you are currently developing, you can reload your project quickly in the browser, but still give you the option of fine grained debugging in a module.  We typically use this to decrease the number of times we need to run [build.bat](#built) by excluding a particular module's controller.js file, view.html file or both depending  on what we're actively modifying.
```javascript
excludeShallow: [ 
    // "CustomSpace/Scripts/path/to/module/path/to/submodule/controller",
    // "text!CustomSpace/Scripts/path/to/module/path/to/submodule/view.html"
],
```

### out

File path to the final optimized file output.  Path is relative to the [build-template.js](https://stackedit.io/build-template.js) file, or if just using command line arguments or [built.bat](https://stackedit.io/app#build), the current working directory (see [Relative path resolution rules](https://stackedit.io/app#relative-path-resolution-rules)).

```javascript
out: "../Scripts/path/to/module/template-built.min.js",
```

### findNestedDependencies

Finds require() dependencies inside a require() or define call.  By default this value is false, because those resources should be considered dynamic/runtime calls.  The template sets **findNestedDependencies** to true in order to limit the larger number of dependencies (~100 on average) generated by Cireson Portal modules.
```javascript
findNestedDependencies: true,
```

### namespace

Allows namespacing requirejs, require and define calls to a new name.
This allows stronger assurances of getting a module space that will not interfere with others using a define/require AMD-based module system. The example below will rename define() calls to moduleNamespace.define().  This is typically only used when a custom module requires a separate instance of RequireJS to load dynamic/runtime resources.
```javascript
// namespace: "moduleNamespace",
```
**Note** If the module to load requires a separate instance of the RequireJS library on demand then **namespace** should be uncommented (see [On Demand RequireJS Library Requirements](#on-demand-requirejs-library-requirements)).

### optimize

How to optimize (minify) all the JS files in the build output directory or specified JS file set by [**out**](#out).
Right now only the following values are supported:
* "uglify": (default) uses UglifyJS to minify the code. Before version 2.2, the uglify version was a 1.3.x release. With r.js 2.2, it is now a 2.x uglify release. Only supports ES5 syntax. For ES 2015 or later, use the "none" option instead.
* "uglify2": in version 2.1.2+. Uses UglifyJS2. As of r.js 2.2, this is just an alias for "uglify" now that 2.2 just uses uglify 2.x.
* "none": no minification will be done. Use this setting if you are using ES 2015 or later syntax in your files, since the bundled UglifyJS only understands ES5 and earlier syntax. For ES2015 code, run a compliant minifier as a separate step after running r.js.
```javascript
optimize: "uglify2", // none, uglify, uglify2
```

### generateSourceMaps

If the minifier specified in the [**optimize**](#optimize) option supports generating source maps for the minified code, then generate them. The source maps generated only translate minified JS to non-minified JS, it does not do anything magical for translating minified JS to transpiled source code.
Currently only [**optimize**](#optimize): "uglify2" is supported when running in Node.
The source files will show up in a browser developer tool that supports source maps as ".js.src" files.
```javascript
generateSourceMaps: true,
```

### preserveLicenseComments

By default, comments that have a license in them are preserved in the output when a minifier is used in the [**optimize**](#optimize) option.
However, for a larger built files there could be a lot of comment files that may be better served by having a smaller comment at the top of the file that points to the list of all the licenses.
This option will turn off the auto-preservation, but you will need work out how best to surface the license information.
```javascript
preserveLicenseComments: false
```

### On Demand RequireJS Library Requirements
If the module requires a separate instance of the RequireJS library on demand then the following requirements must be met in the build file:
* Specify Require Library module path via [**paths**](#paths).
* Load Require Library module via [**include**](#include).
* Specify custom [**namespace**](#namespace) for module.