({
    baseUrl: "../../Scripts",
    paths: {
        "text": "require/text",
        "CustomSpace": "../CustomSpace"
    },
    include: [
        "../CustomSpace/Scripts/widgets/historyDropDownTree.js",
        "forms/wiMain"
    ],
    out: "../Scripts/forms/wiMain-built.min.js",
    findNestedDependencies: true,
    optimize: "uglify2", // none, uglify, uglify2
    generateSourceMaps: true,
    preserveLicenseComments: false
})