({
    baseUrl: "../Scripts", // "../../Scripts" => CiresonPortal/Scripts, "../Scripts" => CiresonPortal/CustomSpace/Scripts
    paths: {
        // "requireLib": "../../Scripts/require",
        "text": "../../Scripts/require/text",
        "CustomSpace": "../"
    },
    include: [
        // "requireLib",
        "CustomSpace/Scripts/path/to/module/template"
    ],
    excludeShallow: [
        // "CustomSpace/Scripts/path/to/module/path/to/submodule/controller.js",
        // "CustomSpace/Scripts/path/to/module/path/to/submodule/view.html"
    ],
    // namespace: "moduleNamespace",
    out: "../Scripts/path/to/module/template-built.min.js",
    findNestedDependencies: true,
    optimize: "uglify2", // none, uglify, uglify2
    generateSourceMaps: true,
    preserveLicenseComments: false
})