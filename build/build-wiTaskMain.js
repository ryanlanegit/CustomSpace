({
  baseUrl: '../../Scripts',
  paths: {
    'text': 'require/text',
    'CustomSpace': '../CustomSpace'
  },
  include: [
    'CustomSpace/Scripts/forms/wiTaskMain'
  ],
  excludeShallow: [
    // 'CustomSpace/Scripts/forms/tasks/resolveIncident/controller'
  ],
  out: '../Scripts/forms/wiTaskMain-built.min.js',
  findNestedDependencies: true,
  optimize: 'uglify2', // none, uglify, uglify2
  generateSourceMaps: true,
  pathToSourceMaps: '/CustomSpace/Scripts/forms/',
  preserveLicenseComments: false
})