
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

## Template Build Config

**build-template.js** is a basic RequireJS build config that can be used for optimizing out of the box Cireson Portal modules as well as custom made modules. 

### baseUrl

RequireJS will use **baseUrl** to resolve the paths for any module names. The **baseUrl** should be relative to **appDir**.  No appDir is provided in the template so baseUrl is relative to the build.js file, or if just using command line arguments or [built.bat](#build), the current working directory (see [Relative path resolution rules](#relative-path-resolution-rules)).  

We typically use one of two different relative paths for baseUrl depending on if we are relying on dependencies to CiresonPortal/Scripts or CiresonPortal/CustomSpace/Scripts:
```javascript
baseUrl: "../../Scripts", // => CiresonPortal/Scripts
baseUrl: "../Scripts", // => CiresonPortal/CustomSpace/Scripts
```

### paths

RequireJS will adjust any require or define **paths** relative to the [**baseUrl**](#baseurl).  We typically only use two values to load the RequireJS/AMD loader plugin [text](https://github.com/requirejs/text) for loading text resources (e.g. view.html for a module) and to specify where the CustomSpace directory is located.
```javascript
paths: {
    // "requireLib": "../../Scripts/require",
    "text": "../../Scripts/require/text",
    "CustomSpace": "../"
},
```
**Note** If the module requires a separate instance of the RequireJS library on demand then the "requireLib" value should be uncommented (see [On Demand RequireJS Library Requirements](#on-demand-requirejs-library-requirements))
### include
A list of RequireJS modules to load, relative to [**baseUrl**](#baseurl) or  [**paths**](#paths) if a match is found.
```javascript
include: [
    // "requireLib",
    "CustomSpace/Scripts/path/to/module/template"
],
```
**Note** If the module to load requires a separate instance of the RequireJS library on demand then "requireLib" should be uncommented (see [On Demand RequireJS Library Requirements](#on-demand-requirejs-library-requirements))

### excludeShallow

Per the RequireJS docs on [excludeShallow](https://requirejs.org/docs/optimization.html#shallow), by optimizing all the modules in your project into one file, except the one you are currently developing, you can reload your project quickly in the browser, but still give you the option of fine grained debugging in a module.  We typically use this to decrease the number of times we need to run [build.bat](#built) by excluding a particular module's controller.js file, view.html file or both depending  on what we're actively modifying.
```javascript
excludeShallow: [ 
    // "CustomSpace/Scripts/path/to/module/path/to/submodule/controller",
    // "text!CustomSpace/Scripts/path/to/module/path/to/submodule/view.html"
],
```

### out

```javascript
out: "../Scripts/path/to/module/template-built.min.js",
```

### findNestedDependencies

```javascript
findNestedDependencies: true,
```

### optimize

```javascript
optimize: "uglify2", // none, uglify, uglify2
```

### generateSourceMaps

```javascript
generateSourceMaps: true,
```


### preserveLicenseComments

```javascript
preserveLicenseComments: false
```


### On Demand RequireJS Library Requirements
If the module requires a separate instance of the RequireJS library on demand then the following requirements must be met in the build config:
* **paths** value for "requireLib" 
* **include** "requireLib"
* **namespace** "moduleNamespace"
```javascript
baseUrl: "../../Scripts", // => CiresonPortal/Scripts
paths: {
    "requireLib": "../../Scripts/require",
    "text": "require/text",
    "CustomSpace": "../CustomSpace"
},
include: [
    "requireLib",
    "CustomSpace/Scripts/path/to/module/template"
],
namespace: "moduleNamespace",
```

## Curent Build Configs

### Optimizing Cireson Modules

#### build-viewMain.js

#### build-wiActivityMain.js

#### build-wiMain.js

#### build-wiTaskMain.js

### Optimizing CustomSpace Modules

#### build-gridTaskMain.js

#### build-profileMain.js

#### build-roTaskMain.js

### Optimizing CustomSpace CSS

#### build-customCSS.js
