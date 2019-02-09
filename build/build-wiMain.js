({
  baseUrl: '../../Scripts',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace',
  },
  include: [
    'forms/wiMain',
  ],
  excludeShallow: [
    // 'CustomSpace/Scripts/forms/predefined/history/controller',
    // 'text!CustomSpace/Scripts/forms/predefined/history/view.html'
  ],
  out: '../Scripts/forms/wiMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
  sourceRoot: '/Scripts/',
  preserveLicenseComments: false,
})
