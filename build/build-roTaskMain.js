({
    baseUrl: "../Scripts",
    paths: {
        "requireLib": "../../Scripts/require",
        "text": "../../Scripts/require/text",
        "CustomSpace": "../"
    },
    include: [
        "requireLib",
        "CustomSpace/Scripts/serviceCatalog/roTaskMain"
    ],
    excludeShallow: [
        // "CustomSpace/Scripts/serviceCatalog/roTaskBuilder"
    ],
    namespace: "roTaskMain",
    out: "../Scripts/serviceCatalog/roTaskMain-built.min.js",
    findNestedDependencies: true,
    optimize: "uglify2", // none, uglify, uglify2
    generateSourceMaps: true,
    pathToSourceMaps: "/CustomSpace/Scripts/serviceCatalog/",
    preserveLicenseComments: false
})