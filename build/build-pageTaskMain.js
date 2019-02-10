({
  mainConfigFile: 'config-build-task.js',
  include: [
    'CustomSpace/Scripts/page/pageTaskMain',
  ],
//excludeShallow: [
//  'text',
//  'CustomSpace/Scripts/page/pageTaskBuilder',
//],
  out: '../Scripts/page/pageTaskMain-built.min.js',
//optimize: 'uglify2',
//generateSourceMaps: true,
  sourceMapDir: '/CustomSpace/Scripts/page/',
//onModuleBundleComplete: null,
})
