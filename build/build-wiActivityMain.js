({
  mainConfigFile: 'config-build-main.js',
  include: [
    'forms/wiActivityMain',
  ],
  out: '../Scripts/forms/wiActivityMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
})
