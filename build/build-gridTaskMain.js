({
  baseUrl: '../Scripts',
  paths: {
    'text': '../../Scripts/require/text',
    'CustomSpace': '../../CustomSpace'
  },
  stubModules: [
    'text'
  ],
  include: [
    'CustomSpace/Scripts/grids/gridTaskMain'
  ],
  excludeShallow: [
    'text'
  //  'CustomSpace/Scripts/grids/gridTaskBuilder'
  ],
  out: '../Scripts/grids/gridTaskMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  pathToSourceMaps: '/CustomSpace/Scripts/grids/',
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
          'filePath': inputFile
        });
    fs.writeFileSync(inputFile, cleanedCode);
  }
})
