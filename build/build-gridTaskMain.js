({
    baseUrl: "../Scripts",
    paths: {
        "text": "../../Scripts/require/text",
        "CustomSpace": "../../CustomSpace"
    },
    include: [
        "CustomSpace/Scripts/grids/gridTaskMain"
    ],
    excludeShallow: [
    //    "CustomSpace/Scripts/grids/gridTaskBuilder"
    ],
    out: "../Scripts/grids/gridTaskMain-built.min.js",
    findNestedDependencies: true,
    optimize: "uglify2", // none, uglify, uglify2
    generateSourceMaps: true,
    pathToSourceMaps: "/CustomSpace/Scripts/grids/",
    preserveLicenseComments: false
})