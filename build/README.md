# Build

## build.bat

Batch file to optimize Cireson modules, CustomSpace modules and CustomSpace CSS with r.js using build config files to determine level of RequireJS optimization and output file locations.
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

### Relative path resolution rules

In general, if it is a path, it is relative to the build.js file used to hold the build options, or if just using command line arguments, relative to the current working directory. Example of properties that are file paths: appDir, dir, mainConfigFile, out, wrap.startFile, wrap.endFile.

For **baseUrl**, it is relative to **appDir**. If no appDir, then baseUrl is relative to the build.js file, or if just using command line arguments, the current working directory.

For **paths** and **packages**, they are relative to **baseUrl**, just as they are for require.js.

For properties that are module IDs, they should be module IDs, and not file paths. Examples are **name**, **include**, **exclude**, **excludeShallow**, **deps**.

### Full Documentation

Full documentation for ReqyureJS can be found at [https://requirejs.org/docs/optimization.html](https://requirejs.org/docs/optimization.html).

## Template Build Config

### build-template.js

#### baseUrl
#### paths
#### include
#### excludeShallow
#### out
#### findNestedDependencies
#### optimize
#### generateSourceMaps
#### preserveLicenseComments

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
