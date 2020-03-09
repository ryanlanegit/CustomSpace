({
  mainConfigFile: 'config-build-main.js',
  include: [
    'forms/configItemMain',
  ],
  out: '../Scripts/forms/configItemMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
})
