({
  baseUrl: '../../Scripts',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace',
  },
  include: [
    'forms/wiActivityMain',
  ],
  out: '../Scripts/forms/wiActivityMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
  sourceRoot: '/Scripts/',
  preserveLicenseComments: false,
})
