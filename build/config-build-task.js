/* global console, module, require */
/* eslint "no-console": [ "error", { "allow": [ "log", "warn", "error"] } ] */
require.config({
  baseUrl: '../Scripts',
  paths: {
    'requireLib': '../../Scripts/require',
    'text': '../../Scripts/require/text',
    'CustomSpace': '../../CustomSpace',
    'Scripts': '../../Scripts',
  },
  stubModules: [
    'text',
  ],
  excludeShallow: [
    'text',
  ],
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  sourceRoot: '/CustomSpace/Scripts/',
  preserveLicenseComments: false,
  /**
   *
   */
  onModuleBundleComplete: function (data) {
    'use strict';
    console.log('AMD Cleaning File: ' + data.path);
    var fs = module.require('fs'),
        // AMDClean Module from https://github.com/gfranko/amdclean
        amdclean = module.require('./amdclean'),
        inputFile = data.path,
        inputSourceMap = inputFile + '.map',
        sourceMapContents = fs.readFileSync(inputSourceMap, 'utf8'),
        cleaned = amdclean.clean({
          filePath: inputFile,
          sourceMap: sourceMapContents,
          wrap: false,
          esprima: {
              loc: true,
          },
          escodegen: {
            sourceMap: true,
            sourceMapWithCode: true,
          },
        });
    fs.writeFileSync(inputFile, cleaned.code);
    fs.writeFileSync(inputSourceMap, cleaned.map);
  },
});
