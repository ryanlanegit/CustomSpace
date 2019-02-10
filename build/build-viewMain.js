({
  mainConfigFile: 'config-build-main.js',
  include: [
    'viewMain',
  ],
  out: '../Scripts/viewMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/',
})
