({
    baseUrl: "../Scripts",
    paths: {
        "text": "../../Scripts/require/text",
        "CustomSpace": "../../CustomSpace"
    },
    include: [
        "CustomSpace/Scripts/page/pageTaskMain"
    ],
    excludeShallow: [
    //  "CustomSpace/Scripts/page/pageTaskBuilder"
    ],
    out: "../Scripts/page/pageTaskMain-built.min.js",
    findNestedDependencies: true,
    optimize: "uglify2", // none, uglify, uglify2
    generateSourceMaps: true,
    preserveLicenseComments: false
})