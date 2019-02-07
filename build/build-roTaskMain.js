/*global console, module */
({
  baseUrl: '../Scripts',
  paths: {
    'requireLib': '../../Scripts/require',
    'text': '../../Scripts/require/text',
    'CustomSpace': '../',
  },
  stubModules: [
    'text',
  ],
  include: [
    'requireLib',
    'CustomSpace/Scripts/serviceCatalog/roTaskMain',
  ],
  excludeShallow: [
    // 'CustomSpace/Scripts/serviceCatalog/roTaskBuilder'
  ],
  namespace: 'roTaskMain',
  out: '../Scripts/serviceCatalog/roTaskMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  pathToSourceMaps: '/CustomSpace/Scripts/serviceCatalog/',
  preserveLicenseComments: false,
  onModuleBundleComplete: function (data) {
    'use strict';
    console.log('AMD Cleaning File:' + data.path);
    var fs = module.require('fs'),
      // AMDClean Module from https://github.com/gfranko/amdclean
        amdclean = module.require('amdclean'),
        inputFile = data.path,
        outputFile = './build/clean.js',
        cleanedCode = amdclean.clean({
          'filePath': inputFile,
        });
    fs.writeFileSync(inputFile, cleanedCode);
  },
})
