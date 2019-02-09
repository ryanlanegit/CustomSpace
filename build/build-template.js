({
  baseUrl: '../Scripts', // => CiresonPortal/CustomSpace/Scripts
  paths: {
    // 'requireLib': '../../Scripts/require',
    'text': '../../require/text',
    'CustomSpace': '../CustomSpace',
  },
  stubModules: [
    'text',
  ],
  include: [
    // 'requireLib',
    'CustomSpace/Scripts/path/to/module/template',
  ],
  excludeShallow: [
    // 'CustomSpace/Scripts/path/to/module/path/to/submodule/controller',
    // 'text!CustomSpace/Scripts/path/to/module/path/to/submodule/view.html'
  ],
  // namespace: 'moduleNamespace',
  out: '../Scripts/path/to/module/template-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  // sourceMapDir: '/path/to/sourceMap/',
  // sourceRoot: '/path/to/baseUrl/',
  preserveLicenseComments: false,
  /*
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
  },
  */
})
