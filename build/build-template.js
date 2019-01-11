({
  baseUrl: '../Scripts', // => CiresonPortal/CustomSpace/Scripts
  paths: {
    // 'requireLib': '../../Scripts/require',
    'text': '../../require/text',
    'CustomSpace': '../CustomSpace'
  },
  include: [
    // 'requireLib',
    'CustomSpace/Scripts/path/to/module/template'
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
  // pathToSourceMaps: '/path/to/sourceMap/',
  preserveLicenseComments: false
})