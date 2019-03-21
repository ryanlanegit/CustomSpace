/* global require */
require.config({
  baseUrl: '../../Scripts',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace',
    'Scripts': '../Scripts',
  },
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  sourceRoot: '/Scripts/',
  preserveLicenseComments: false,
});
