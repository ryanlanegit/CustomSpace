/*global console, module */
({
  baseUrl: '../Scripts',
  paths: {
    'text': '../../Scripts/require/text',
    'CustomSpace': '../../CustomSpace',
  },
  stubModules: [
    'text',
  ],
  include: [
    'CustomSpace/Scripts/grids/gridTaskMain',
  ],
  excludeShallow: [
    'text',
  //  'CustomSpace/Scripts/grids/gridTaskBuilder',
  ],
  out: '../Scripts/grids/gridTaskMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/grids/',
  sourceRoot: '/CustomSpace/Scripts/',
  preserveLicenseComments: false,
  onModuleBundleComplete: function (data) {
    'use strict';
    console.log('AMD Cleaning File: ' + data.path);
    var fs = module.require('fs'),
        // AMDClean Module from https://github.com/gfranko/amdclean
        amdclean = module.require('amdclean'),
        inputFile = data.path,
        inputSourceMap = inputFile + '.map',
        sourceMapContents = fs.readFileSync(inputSourceMap, 'utf8').replace(/[\r\n]+/g, ''),
        cleaned = amdclean.clean({
          filePath: inputFile,
          sourceMap: sourceMapContents,
          wrap: false,
          esprima: {
              loc: true,
              source: 'gridTaskMain.js',
          },
          escodegen: {
            sourceMap: true,
            sourceMapWithCode: true,
          },
        });
    fs.writeFileSync(inputFile, cleaned.code);
    fs.writeFileSync(inputSourceMap, cleaned.map);
  },
})
