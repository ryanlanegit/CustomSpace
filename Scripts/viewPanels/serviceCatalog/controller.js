/**
serviceCatalog
**/
define(function (require) {
    var tpl = require("text!CustomSpace/Scripts/viewPanels/serviceCatalog/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            var built = _.template(tpl);
            var templateFrag = $(built(node));

            //add html and templates to the dom
            callback(templateFrag);

            //create a layout location
            layout = new kendo.Layout("servicecatalog-template");
            layout.render($('#service-catalog'));

            //setup the catalog data source
            var items = new kendo.data.DataSource({
                schema: {
                    data: "Data",
                    model: { id: "CategoryId" }
                },
                transport: { read: { url: "/ServiceCatalog/GetServiceCatalogWithSOGroup", dataType: "json" } }
            });

            //setup the catalog viem model
            var scModel = kendo.observable({
                homeBC: false,
                scLabel: localization.AllRequests,
                favRO: false,
                topRO: false,
                topKA: false,
                favROLoaded: false,
                topROLoaded: false,
                topKALoaded: false,
                topsVisible: false,
                catalogVisible: false,
                taxonomyVisible: !session.forceSearch,
                loadingVisible: !session.forceSearch,
                forceSearch: session.forceSearch,
                dataSource: items,
                currentView: 'page',
                navs: new kendo.data.DataSource({   //setup the left nav data source
                    schema: {
                        data: "Data",
                        model: { id: "CategoryId" }
                    },
                    transport: { read: { url: "/ServiceCatalog/GetServiceCatalogWithCatGroup", dataType: "json", cache: false } }
                }),
                folded: new kendo.data.DataSource({   //setup mini catalog data source
                    schema: {
                        data: "Data",
                        model: { id: "CategoryId" }
                    },
                    transport: { read: { url: "/ServiceCatalog/GetServiceCatalogWithCatGroup", dataType: "json", cache: false } }
                }),
                favROs: new kendo.data.DataSource({ //setup fav RO data source
                    schema: {
                        data: "Data",
                        model: { id: "Id" }
                    },
                    transport: { read: { url: "/ServiceCatalog/GetFavoriteRequestOffering", dataType: "json", cache: false } }
                }),
                topROs: new kendo.data.DataSource({ //setup Top RO data source
                    schema: {
                        data: "Data",
                        model: { id: "Id" }
                    },
                    transport: { read: { url: "/ServiceCatalog/GetTopRequestOffering", dataType: "json", cache: false } }
                }),
                topKAs: new kendo.data.DataSource({ //setup the top KA data source
                    schema: {
                        model: { id: "ArticleId" }
                    },
                    transport: { read: { url: "/api/v3/Article/GetTopArticlesByPopularity", data: { count: 10 }, dataType: "json", cache: false } }
                }),
                openRequestOffering: function (e) {
                    e.preventDefault();

                    var elm = $(e.target);

                    var roId = elm.data('request');
                    var serId;
                    if (elm.is("[data-service]")) {
                        serId = elm.data('service');//crawl up and get service request id
                    } else {
                        serId = elm.closest('[data-service]').data('service');//crawl up and get service request id
                    }
                    
                    var roLink = elm.data('request-url');
                    var roLinkType = elm.data('request-target-type');
                    
                    //if direct link for ro is present, use it
                    if (!_.isUndefined(roLink) && !_.isNull(roLink) && roLink != "") {
                        window.open(roLink, roLinkType);
                    } else {
                        window.location = "/SC/ServiceCatalog/RequestOffering/" + roId + "," + serId;
                    }
                },
                showCatalog: function() {
                    if (this.get("topKALoaded") && this.get("topROLoaded") && this.get("favROLoaded")) {
                        this.set("topsVisible", true);
                        this.set("catalogVisible", true);
                        this.set("loadingVisible", false);

                        //look for anchor/location link
                        if (app.lib.getQueryParams() && !session.forceSearch) {
                            var queryParams = app.lib.getQueryParams();
                            if (_.isString(queryParams['so'])) {
                                scModel.showSingleService(queryParams['so']);
                            }
                            if (_.isString(queryParams['cat'])) {
                                scModel.showSingleCategory(queryParams['cat']);
                                $('a[data-category="' + queryParams['cat'] + '"]').click()
                            }
                        }
                    }
                },
                forceSearchViewSC: function () {
                    scModel.hideOverlay();
                    scModel.set('taxonomyVisible', true);
                    scModel.showCatalog();
                },
                toggleFavorite: function (e) {
                    e.stopPropagation(); //cpntainer has click event, don't want that fired here.
                    e.preventDefault();
                    //get elmement and some data
                    var elm = $(e.target);
                    var roId = elm.data('request');

                    $.ajax({
                        type: 'POST',
                        cache: false,
                        url: '/SC/ServiceCatalog/ToggleFavorite',
                        data: { requestOfferingId: roId, imageElementId: "" }
                    }).done(function (data) {
                        //console.log(data);
                        if (data[0] === "True") {
                            //update local datasource so the stars act normal.. [BUG1718]
                            updateLocalDataItem();
                            //flip flop the star classes
                            elm.toggleClass('fa-star-o');
                            elm.toggleClass('fa-star');
                        }
                        scModel.favROs.read();
                    });

                    function updateLocalDataItem() {
                        roId = elm.data('request');

                        //check parent ds
                        _.each(scModel.dataSource.data(), function (cat) {
                            _.each(cat.requestofferings, function (ro) {
                                if (ro.RequestOfferingId == roId) {
                                    ro.IsFavorite = !ro.IsFavorite;
                                    scModel.dataSource.sync();
                                }
                            });
                        });

                        //check top RO ds
                        _.each(scModel.topROs.data(), function (ro) {
                            if (ro.Id == roId) {
                                ro.IsFavorite = !ro.IsFavorite;
                                scModel.topROs.sync();
                            }
                        });
                    };
                },
                showSingleService: function (e) {
                    scModel.emptyOverlay();

                    //allow passing in of servie id
                    var serviceOfferingId = e;
                    if (_.isObject(e)) {
                        serviceOfferingId = $(e.target).data('service');
                    }

                    var categoryId = $(e.target).closest('ul').siblings('a').data('category');
                    scModel.setNavFocus(categoryId, serviceOfferingId);

                    items.filter({ field: "ServiceOfferingId", operator: "equals", value: serviceOfferingId });
                    var singleSoOverlay = new kendo.View('cat-template', { model: scModel });
                    layout.showIn("#catalog-area-overlay", singleSoOverlay);
                    scModel.showOverlay();
                },
                removeNavFocus: function() {
                    //remove old focus
                    _.each($('.so-link'), function (link) {
                        $(link).removeClass('text-black');
                    });
                    _.each($('.cat-link'), function (link) {
                        $(link).removeClass('text-black');
                    });

                },
                setNavFocus: function (catId, serviceId) {
                    scModel.removeNavFocus();
                    if (!_.isNull(catId)) {
                        $('.sc-nav-list').find('a[data-category="' + catId + '"]').addClass('text-black');
                    }
                    if (!_.isNull(serviceId)) {
                        $('.sc-nav-list').find('a[data-service="' + serviceId + '"]').addClass('text-black');
                    }
                },
                showSingleCategory: function (e) {
                    //this allows us to pass id via arrguments
                    var catId = e;
                    if (_.isObject(e)) {
                        catId = $(e.target).data('category');
                    }
                    scModel.setNavFocus(catId, null);
                    scModel.folded.filter({ field: "CategoryId", operator: "equals", value: catId });
                    var singleCat = new kendo.View('<div data-template="cat-mini-template-single" data-bind="source: folded"></div>', { model: scModel });
                    scModel.emptyOverlay();
                    layout.showIn("#catalog-area-overlay", singleCat);
                    scModel.showOverlay();
                },
                showSearchResultsInOverlay: function (data) {
                    scModel.emptyOverlay();

                    var overlayVm = kendo.observable({
                        roResults: [],
                        favResults: [],
                        kaResults: [],
                        searchText: data.searchString || "",
                        totalResults: 0,
                        sectionTitle: "",
                        scope: data.scope,
                        rawResults: data.results,
                        returnToPage: function () {
                            scModel.hideOverlay();
                            app.events.publish('serviceCatalogBackToSearch');
                        },
                        openRequestOffering: scModel.openRequestOffering,
                        toggleFavorite: scModel.toggleFavorite,
                        forceSearch: scModel.forceSearch,
                        forceSearchViewSC: scModel.forceSearchViewSC
                    });

                    overlayVm.hasSearchText = data.searchString ? true : false;
                    _.each(overlayVm.rawResults, function (result) {
                        var cleanedResult;
                        if (result.Type == "Favorite" || result.Type == "RequestOffering") {
                            cleanedResult = {
                                RequestOfferingTitle: result.Title,
                                RequestOfferingId: result.Id,
                                ServiceOfferingId: result.ServiceOfferingId,
                                IsFavorite: result.IsFavorite,
                                RequestOfferingDescription: result.Description,
                                RequestOfferingLinkUrl: result.RequestOfferingLinkUrl,
                                RequestOfferingLinkTargetType: result.RequestOfferingLinkTargetType
                            }
                            if (result.Type == "Favorite") {
                                overlayVm.favResults.push(cleanedResult);
                            }
                            if (result.Type == "RequestOffering") {
                                overlayVm.roResults.push(cleanedResult);
                            }
                        }
                        if (result.Type == "KnowledgeArticle") {
                            cleanedResult = {
                                Id: result.Id,
                                Title: result.Title,
                                Description: result.Description
                            }
                            overlayVm.kaResults.push(cleanedResult);
                        }
                    });

                    switch (overlayVm.scope) {
                        case "AllResults":
                            showRoSearchResults();
                            showFavSearchResults();
                            showKaSearchResults();
                            break;
                        case "RequestOffering":
                            showRoSearchResults();
                            break;
                        case "Favorite":
                            showFavSearchResults();
                            break;
                        case "KnowledgeArticle":
                            showKaSearchResults();
                            break;
                        default:
                            return;
                    }

                    var viewTemplate =
                        '<h4 class="strong">' +
                            '<a class="cursor-pointer" data-bind="click: returnToPage"><i class="fa fa-chevron-left"></i> <span data-bind="localize: SearchButton"></span></a>' +
                            ' / ' +
                            '<span data-bind="text: searchText"></span> <span class="normal">(<span data-bind="text: totalResults"></span>)</span>' +
                            '</h4>';
                    var breadcrumbView = new kendo.View(viewTemplate, { model: overlayVm });
                    layout.showIn("#breadcrumb-results-wrapper", breadcrumbView);

                    //don't really like this but a guys gotta do what a guys gotta do
                    var footerView = new kendo.View('<button class="btn btn-primary k-button" data-bind="localize: BrowseServiceCatalogButton, visible: forceSearch, click: forceSearchViewSC"></button>', { model: overlayVm });
                    layout.showIn("#footer-results-wrapper", footerView );

                    scModel.showOverlay();

                    function showRoSearchResults() {
                        if (overlayVm.roResults.length > 0) {
                            overlayVm.totalResults += overlayVm.roResults.length;
                            overlayVm.sectionTitle = localizationHelper.localize("MatchingRequestOfferings");
                            var roResults = new kendo.View('<h4 data-bind="text: sectionTitle"></h4><div data-template="ro-template" data-bind="source: roResults"></div>', { model: overlayVm });
                            layout.showIn("#ro-results-wrapper", roResults);
                        }
                    }
                    function showFavSearchResults() {
                        if (overlayVm.favResults.length > 0) {
                            overlayVm.totalResults += overlayVm.favResults.length;
                            overlayVm.sectionTitle = localizationHelper.localize("MatchingFavorites");
                            var favResults = new kendo.View('<h4 data-bind="text: sectionTitle"></h4><div data-template="ro-template" data-bind="source: favResults"></div>', { model: overlayVm });
                            layout.showIn("#fav-results-wrapper", favResults);
                        }
                    }
                    function showKaSearchResults() {
                        if (overlayVm.kaResults.length > 0) {
                            overlayVm.totalResults += overlayVm.kaResults.length;
                            overlayVm.sectionTitle = localizationHelper.localize("RelatedKnowledgeArticles");
                            var kaResults = new kendo.View('<h4 data-bind="text: sectionTitle"></h4><div data-template="ka-results-template" data-bind="source: kaResults"></div>', { model: overlayVm });
                            layout.showIn("#ka-results-wrapper", kaResults);
                        }
                    }
                },
                showHome: function (e) {
                    scModel.removeNavFocus();
                    scModel.hideOverlay();
                    e.preventDefault();
                    scModel.folded.filter({});
                    items.filter({});
                    var resetCatalog = new kendo.View('<div data-template="cat-mini-template-all" data-bind="source: folded"></div>', { model: scModel });

                    scModel.set("topsVisible", true);
                    scModel.set('homeBC', false);
                    scModel.set('scLabel', localization.AllRequests);

                    layout.showIn("#catalog-area", resetCatalog);
                },
                showFullCatalog: function (e) {
                    scModel.removeNavFocus();
                    scModel.hideOverlay();
                    e.preventDefault();
                    scModel.folded.filter({});
                    items.filter({});
                    var resetCatalog = new kendo.View('<div data-template="cat-mini-template-all" data-bind="source: folded"></div>', { model: scModel });

                    scModel.set("topsVisible", false);
                    scModel.set('homeBC', true);
                    scModel.set('scLabel', localization.ServiceCatalog);

                    layout.showIn("#catalog-area", resetCatalog);
                },
                hideOverlay: function() {
                    scModel.currentView = 'page';
                    $('.overlay').hide({
                        easing: "easeInOutExpo",
                        duration: 500
                    });
                    $('#servicecat-content').show({
                        easing: "easeInOutExpo",
                        duration: 750
                    });
                },
                showOverlay: function() {
                    $('#servicecat-content').hide({
                        easing: "easeInOutExpo",
                        duration: 500
                    });
                    $('.overlay').show({
                        easing: "linear",
                        duration: 750
                    });

                },
                emptyOverlay: function() {
                    scModel.currentView = 'overlay';
                    _.each($('.search-results-container').find('div'), function (divEle) {
                        $(divEle).empty();
                    });
                }
            });

            //subscribe to events from the search
            app.events.subscribe("serviceCatalogFilterFromSearch", function (e, eventData) {
                scModel.showSearchResultsInOverlay(eventData);
            });

            //show catalog when hidden by force search
            app.events.subscribe("serviceCatalogShowCatalog", function (e, elm) {
                scModel.forceSearchViewSC();
            });


            //add the nav
            var scContent = new kendo.View("base-nav-template", { model: scModel });
            layout.showIn("#servicecat-nav", scContent);

            //add top/favs to the layout
            var catalog = new kendo.View('catalog-template', { model: scModel });
            layout.showIn("#servicecat-content", catalog);

            //ad catalog to layout, establish this zone
            var catalog = new kendo.View('<div data-template="cat-mini-template-all" data-bind="source: folded"></div>', { model: scModel });
            //wait to show catalog until the ajax request comeback
            //now lets display the catalog
            layout.showIn("#catalog-area", catalog);


            //bind to top/fav data load to see if we should display
            scModel.favROs.bind("change", function (e) {
                var data = this.data();
                if (data.length > 0) {
                    scModel.set("favRO", true);
                }
                //set load for view reasons
                scModel.set("favROLoaded", true);
                if (!session.forceSearch) {
                    scModel.showCatalog();
                }
            });

            scModel.topROs.bind("change", function (e) {
                var data = this.data();
                if (data.length > 0) {
                    scModel.set("topRO", true);
                }
                //set load for view reasons
                scModel.set("topROLoaded", true);
                if (!session.forceSearch) {
                    scModel.showCatalog();
                }
            });


            scModel.topKAs.bind("change", function (e) {
                var data = this.data();
                if (data.length > 0) {
                    scModel.set("topKA", true);
                }
                //set load for view reasons
                scModel.set("topKALoaded", true);
                if (!session.forceSearch) {
                    scModel.showCatalog();
                }
            });
        }
    }

    return definition;

});
