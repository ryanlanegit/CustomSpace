({
  mainConfigFile: 'config-build-task.js',
  include: [
    'CustomSpace/Scripts/serviceCatalog/roTaskMain',
  ],
//excludeShallow: [
//  'text',
//  'CustomSpace/Scripts/serviceCatalog/roTaskBuilder'
//],
//namespace: 'roTaskMain',
  out: '../Scripts/serviceCatalog/roTaskMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/serviceCatalog/',
})
