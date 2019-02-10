({
  mainConfigFile: 'config-build-main.js',
  include: [
    'forms/profileMain',
  ],
  out: '../Scripts/forms/profileMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/forms/',
})
