({
  mainConfigFile: 'config-build-main.js',
  include: [
    'forms/wiMain',
  ],
//excludeShallow: [
//  'CustomSpace/Scripts/forms/predefined/history/controller',
//  'text!CustomSpace/Scripts/forms/predefined/history/view.html'
//],
  out: '../Scripts/forms/wiMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
})
