/*global console, module */
({
  baseUrl: '../../Scripts',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace',
  },
  stubModules: [
    'text',
  ],
  include: [
    'CustomSpace/Scripts/forms/wiTaskMain',
  ],
  excludeShallow: [
    'text',
    // 'CustomSpace/Scripts/forms/tasks/resolveIncident/controller'
  ],
  out: '../Scripts/forms/wiTaskMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  pathToSourceMaps: '/CustomSpace/Scripts/forms/',
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
