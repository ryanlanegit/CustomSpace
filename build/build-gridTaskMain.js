({
  mainConfigFile: 'config-build-task.js',
  include: [
    'CustomSpace/Scripts/grids/gridTaskMain',
  ],
//excludeShallow: [
//  'text',
//  'CustomSpace/Scripts/grids/gridTaskBuilder',
//],
  out: '../Scripts/grids/gridTaskMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/grids/',
//onModuleBundleComplete: null,
})
