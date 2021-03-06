/* global console, module */
({
  mainConfigFile: 'config-build-main.js',
  stubModules: [
    'text',
  ],
  include: [
    'CustomSpace/Scripts/forms/wiTaskMain',
  ],
  excludeShallow: [
    'text',
// 'CustomSpace/Scripts/forms/tasks/resolveIncident/controller',
  ],
  out: '../Scripts/forms/wiTaskMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
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
})
