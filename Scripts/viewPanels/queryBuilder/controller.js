/**
Query builder
**/
define(function (require) {
    var tpl = require("text!viewPanels/queryBuilder/view.html");
    var gridBuilder = require('grids/gridBuilder');
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //gather node model information 
            var configuration = queryBuilderStandardConfigurationDefinitions[node.Definition.content.configurationName];
            if (!configuration) {
                throw "Invalid configuration name: " + node.Definition.content.configurationName;
            }

            var schemaDef = configuration.schemaDef;
            //setup some viewpanel level variables.
            var commonFields = schemaDef.commonFields || [];
            var query = node.Definition.content.query;
            var navigationNodeId = node.Definition.content.navigationNodeId;
            var queryName = localizationHelper.localize(vm.header.title, vm.header.title);
            if (!navigationNodeId) { //no query name except for saved queries.
                queryName = "";
            }
            //build up the section definitions from the node schema.
            var sectionDefs = [];

            //create schema defs with localized displayNames, and ordered fields
            for (var i = 0; i < schemaDef.sections.length; i++) {
                var sectionDef = schemaDef.sections[i];
                sectionDef.displayName = localizationHelper.localize(sectionDef.displayKey);
                sectionDef.fields = _.chain(sectionDef.fields.concat(commonFields))
                                              .map(function (field) {
                                                  field.displayName = localizationHelper.localize(field.displayKey);
                                                  return field;
                                              })
                                              .sortBy("displayName")
                                              .value();
                sectionDefs.push(sectionDef);
            }

            //Controller methods for managing query structure.
            var createCriteria = function (parentGroup) {
                var criteria = kendo.observable({
                    field: { type: "" },
                    operator: "",
                    value: {},
                    type: "criteria",
                    groupId: parentGroup.uid,
                    sectionId: parentGroup.sectionId,
                    sectionTypeName: parentGroup.sectionTypeName,
                    fields: getSectionSchemaFields(parentGroup.sectionTypeName),
                    validOperators: [],
                    showCriteriaControl: true
                });

                //default to first item on the list
                criteria.set("field", criteria.fields[0]);

                //default operator to the first valid one
                criteria.set("validOperators", viewModel.fieldTypes[criteria.field.fieldType].validOperators);
                criteria.set("operator", criteria.validOperators[0].name);
                return criteria;
            }

            var createCriteriaGroup = function (parentGroup) {
                var group = kendo.observable({
                    // field: {},
                    groupOperator: "And",
                    // value: i++,
                    items: [],
                    type: "criteriaGroup",
                    sectionId: parentGroup.sectionId,
                    sectionTypeName: parentGroup.name || parentGroup.sectionTypeName
                });
                
                group.items.push(createCriteria(group));
                return group;
            }

            var createCriteriaSection = function (sectionDef) {
                sectionDef.sectionId = app.lib.newGUID();
                
                var criteriaSection = {
                    sectionTypeName: sectionDef.name,
                    displayName: sectionDef.displayName,
                    classId: sectionDef.classId,
                    criteriaRoot: createCriteriaGroup(sectionDef),
                    sectionId: sectionDef.sectionId
                }
                return criteriaSection;
            }

            var getSectionSchemaFields = function (sectionTypeName) {
                //get all the fields for the criteria's containing section
                var section = _.filter(sectionDefs, function (sec) { return (sec.sectionTypeName == sectionTypeName || sec.name == sectionTypeName); })[0];
                return section.fields;
            }
            
            //helper method to find the criteriaGroup that contains the given criteria within it's items array,
            //this is necessary because at the point where we are removing items, we do not have a reference to the containing array
            var findContainingCriteria = function (criteria, topLevelGroup) {
                if (topLevelGroup == criteria) {
                    return topLevelGroup;
                }

                if (topLevelGroup.items && topLevelGroup.items.length > 0) {
                    if (topLevelGroup.items.indexOf(criteria) >= 0) {
                        return topLevelGroup;
                    } else {
                        for (var i = 0; i < topLevelGroup.items.length; i++) {
                            var foundCriteria = findContainingCriteria(criteria, topLevelGroup.items[i])
                            if (foundCriteria) {
                                return foundCriteria;
                            }
                        }
                    }
                } else {
                    return null;
                }
            }

            var findContainingSection = function (criteria, sections) {
                var section = _.filter(sections, function(sec) { return sec.sectionId == criteria.sectionId; })[0];
                return section;
            }

            //Valid operators
            var ops = {
                empty: { name: "", display: "", canHaveValue: true },
                eq: { name: "eq", display: "=", canHaveValue: true },
                ne: { name: "ne", display: "<>", canHaveValue: true },
                contains: { name: "contains", display: localizationHelper.localize("Contains"), canHaveValue: true },
                startsWith: { name: "startsWith", display: localizationHelper.localize("Startswith"), canHaveValue: true },
                endsWith: { name: "endsWith", display: localizationHelper.localize("Endswith"), canHaveValue: true },
                gt: { name: "gt", display: ">", canHaveValue: true },
                lt: { name: "lt", display: "<", canHaveValue: true },
                gte: { name: "gte", display: ">=", canHaveValue: true },
                lte: { name: "lte", display: "<=", canHaveValue: true },
                between: { name: "between", display: localizationHelper.localize("Between"), canHaveValue: true },
                isnull: { name: "isnull", display: localizationHelper.localize("IsNull"), canHaveValue: false },
                isnotnull: { name: "isnotnull", display: localizationHelper.localize("IsNotNull"), canHaveValue: false },
                isme: { name: "isme", display: localizationHelper.localize("IsLoggedInUser"), canHaveValue: false },
                isnotme: { name: "isnotme", display: localizationHelper.localize("IsNotLoggedInUser"), canHaveValue: false },
            };

            var viewModel = kendo.observable({
                query: query || [],
                queryName: queryName,
                queryNameValid: function() {
                    var pat = new RegExp("^[a-zA-Z0-9\(\) !@#$.%]+$");
                    var match = pat.test(this.get("queryName"));
                    return match;
                },
                queryNameInValid: function() {
                    return !this.queryNameValid();
                },
                selectedSection: {},
                sectionDefs: sectionDefs,
                gridVm: configuration.gridDefaultConfig,
                isSavedQuery: _.isUndefined(navigationNodeId) ? false : true,
                persistGridState: _.isUndefined(navigationNodeId) ? false : true,
                editMode: false,
                renderGrid: false,
                validActions: {
                    search: true,
                    save: navigationNodeId != undefined, //if the navigation node id is undefined, we cannot save this. Only save as.
                    saveAs: true,
                    "delete": navigationNodeId != undefined, //if the navigation node id is undefined, we cannot delete this.
                    clearQuery: true
                },
                fieldTypes: {
                    //hash for field type to operator lookup.
                    "string": { validOperators: [ops.eq, ops.ne, ops.contains, ops.startsWith, ops.endsWith, ops.isnull, ops.isnotnull] },
                    "date": { validOperators: [ops.eq, ops.ne, ops.gt, ops.lt, ops.gte, ops.lte, ops.between, ops.isnull, ops.isnotnull] },
                    "enum": { validOperators: [ops.eq, ops.ne] },
                    "user": { validOperators: [ops.eq, ops.ne, ops.isnull, ops.isnotnull, ops.isme, ops.isnotme] },
                    "affectedconfigitem": { validOperators: [ops.eq, ops.ne] },
                    "relatedconfigitem": { validOperators: [ops.eq, ops.ne] },
                    "bool": { validOperators: [ops.eq] },
                    "double": { validOperators: [ops.eq, ops.ne, ops.gt, ops.lt, ops.gte, ops.lte, ops.isnull, ops.isnotnull] },
                },
                getSectionSchemaFields: function(criteria) {
                    //get all the fields for the criteria's containing section
                    var section = findContainingSection(criteria, this.query);
                    if (section && section.sectionTypeName) {
                        var section = _.chain(this.sectionDefs)
                            .filter(function(w) { return w.name == section.sectionTypeName })
                            .value()[0];
                        return section.fields;
                    }
                },
                isFirstSection: function (e) {
                    var query = this.get("query");
                    if (query.length > 0) {
                        return (e == query[0]) || (e == query[1]);
                    }
                },
                paddingLeft: function(e) {
                    // HACK: need a class binder so we don't have to do garbage like this
                    return (e.value.get('userValue') || {}).Id ? '14px' : '0';
                },
                createCriteria: function(e) {
                    //create and append a criteria element to the selected group.
                    var criteriaGroup = e.data;
                    if (criteriaGroup) {
                        var parentGroup = (criteriaGroup.items.length > 0) ? criteriaGroup.items[0] : criteriaGroup;
                        var newCriteria = createCriteria(parentGroup);
                        criteriaGroup.items.push(newCriteria);
                    }
                },
                createCriteriaGroup: function(e) {
                    //Create the criteria in the specified group, or append it to the root.
                    var parent = e.data || this.criteriaRoot;
                    var newGroup = createCriteriaGroup(parent.items[0]);
                    parent.items.push(newGroup);
                },
                addCriteriaSection: function(e) {
                    //adds a criteria group to the query.
                    if (this.selectedSection && this.selectedSection.name) {
                        var newSection = createCriteriaSection(this.selectedSection);
                        this.query.push(newSection);
                    }
                },
                removeCriteria: function(e) {
                    //removes the selected criteria/group from it's parent
                    var criteria = e.data;
                    var section = findContainingSection(criteria, this.query);

                    var parent = findContainingCriteria(criteria, section.criteriaRoot);
                    if (section && parent == criteria) { //this is the topMost Group in the section
                        this.removeSection({ data: section });
                    }
                    if (parent) {
                        var index = parent.items.indexOf(criteria);
                        if (index >= 0) {
                            parent.items.splice(index, 1);
                        }
                    }
                },
                removeSection: function(e) {
                    var section = e.data;
                    var index = this.query.indexOf(section);
                    if (index >= 0) {
                        this.query.splice(index, 1);
                    }
                },
                onFieldChanged: function(e) {
                    //when the field changes, set the operater to the first operator in the list if the 
                    //current operator is not valid in the list.
                    var criteria = e.data;

                    criteria.set("showCriteriaControl", true);
                    criteria.set("validOperators", this.fieldTypes[criteria.field.fieldType].validOperators);
                    criteria.set("operator", criteria.validOperators[0].name);
                },
                saveQuery: function (e) {
                    var viewPanel = node;
                    viewPanel.Definition.content.query = this.query;
                    viewPanel.Definition.content.navigationNodeId = navigationNodeId || "";
                    var savedSearch = {
                        displayStringText: this.queryName,
                        navigationNodeId: navigationNodeId, //the navigationNodeId needs to be in two places because it only comes back to us  in the Definition.content, but the service looks here for it.
                        viewPanel: viewPanel,
                    };

                    $.ajax({
                        url: "/Search/UpsertSearch",
                        dataType: "json",
                        type: "POST",
                        data: { searchValue: this.stringifyQueryModel(savedSearch) },
                        success: function(result) {
                            if (result.success) {
                                app.clearNodeStorage();
                                app.clearViewPanelStorage();
                                window.location = "/View/" + result.data;
                            }
                        }
                    });
                },
                saveQueryAs: function(e) {
                    var viewPanel = node;
                    viewPanel.Definition.content.query = this.query;
                    viewPanel.Definition.content.navigationNodeId = undefined;
                    viewPanel.Id = undefined;
                    var savedSearch = {
                        displayStringText: this.queryName,
                        navigationNodeId: undefined, //the navigationNodeId needs to be in two places because it only comes back to us  in the Definition.content, but the service looks here for it.
                        viewPanel: viewPanel,
                    };

                    $.ajax({
                        url: "/Search/UpsertSearch",
                        dataType: "json",
                        type: "POST",
                        data: { searchValue: this.stringifyQueryModel(savedSearch) },
                        success: function(result) {
                            if (result.success) {
                                app.clearNodeStorage();
                                app.clearViewPanelStorage();
                                window.location = "/View/" + result.data;
                            }
                        }
                    });
                },
                deleteQuery: function(e) {
                    var viewPanel = node
                    viewPanel.Definition.content.query = this.query;
                    viewPanel.Definition.content.navigationNodeId = navigationNodeId || "";
                    var savedSearch = {
                        displayStringText: this.queryName,
                        navigationNodeId: navigationNodeId, //the navigationNodeId needs to be in two places because it only comes back to us  in the Definition.content, but the service looks here for it.
                        viewPanel: viewPanel,
                    };

                    $.ajax({
                        url: "/Search/DeleteSearch",
                        dataType: "json",
                        type: "POST",
                        data: { searchValue: this.stringifyQueryModel(savedSearch) },
                        success: function(result) {
                            if (result.success) {
                                app.clearNodeStorage();
                                app.clearViewPanelStorage();
                                window.location = "/View/0316e159-2806-43b2-9018-b695f7bc1088";
                            }
                        }
                    });
                },
                searchOnEnter: function(e) {
                    try {
                        if (e.charCode == 13) {
                            e.originalEvent.srcElement.blur();
                            this.executeSearch(e);
                        }
                    } catch (ex) {

                    }
                },
                executeSearch: function(e) {
                    viewModel.set("renderGrid", true);
                    viewModel.set("gridVm", viewModel.getGridVm());
                },
                getGridVm: function() {
                    var gridVm = configuration.gridDefaultConfig;
                    gridVm.isSavedQuery = viewModel.isSavedQuery;
                    gridVm.persistGridState = viewModel.persistGridState;
                    if (viewModel.isSavedQuery) {
                        gridVm.gridId = navigationNodeId;
                        viewModel.updateSavedQueryModel(); //update the saved query model to replace the "me" token/operator with the current user's id
                    } else {
                        gridVm.gridId = "wiSearchGridContainer";
                    }
                    
                    gridVm.grid.dataSourceOptions = {
                        transport: {
                            read: {
                                url: "/search/GetAdHocResults",
                                dataType: "json",
                                type: "post",
                                data: {
                                    filterCriteria: viewModel.stringifyQueryModel(viewModel.query),
                                    dataTable: "WorkItem",
                                },
                            }
                        }
                    }
                    return gridVm;
                },
                clearQuery: function(e) {
                    var vm = this;
                    vm.set("query", []);
                    vm.set("renderGrid", false);
                    vm.set("gridVm", vm.getGridVm());
                    configuration.initialize(vm, true);
                },
                stringifyQueryModel: function(model) {
                    return kendo.stringify(model, function (key, value) {
                        //ignore these fieldNames:
                        //todo: pull this out so it is more easily accessible and reusable.
                        var ignoreFieldArray = ["userDetailDataSource", "validOperators", "fields"];
                        var ignoreFields = {};

                        $(ignoreFieldArray).each(function(i, v) {
                            ignoreFields[v] = true;
                        });

                        if (ignoreFields[key]) {
                            return undefined;
                        }

                        return value;
                    });
                },
                onOperatorChanged: function(e) {
                    var criteria = e.data;
                    var operator = criteria.get("operator");

                    //if operator is the "me" or "null" option, hide criteria control section
                    if (operator == "isme" || operator == "isnotme" ||
                        operator == "isnull" || operator == "isnotnull") {
                        criteria.set("showCriteriaControl", false);
                    } else {
                        criteria.set("showCriteriaControl", true);
                    }

                    //if operator is the "me" option, set the value to the current user
                    if (operator == "isme" || operator == "isnotme") {
                        criteria.value.set("userValue", { Id: session.user.Id, Name: session.user.Name });
                    }
                },
                updateSavedQueryModel: function () {
                    
                    _.each(viewModel.query, function(item) {
                        if (!_.isUndefined(item["criteriaRoot"]) && !_.isNull(item["criteriaRoot"])) {
                            if (!_.isUndefined(item["criteriaRoot"].items) && !_.isNull(item["criteriaRoot"].items)) {
                                _.each(item["criteriaRoot"].items, function(criteriaItem) {
                                    //if operator is the "me" option, set the value to the current user
                                    if (criteriaItem.operator == "isme" || criteriaItem.operator == "isnotme") {
                                        criteriaItem.value.set("userValue", { Id: session.user.Id, Name: session.user.Name });
                                    }
                                   
                                    //set offset value to 0 when undefined/null
                                    if (!_.isUndefined(criteriaItem.value) && _.isUndefined(criteriaItem.value.numericValue)) {
                                        criteriaItem.value.numericValue = 0;
                                    }

                                    //if relative date, update date/time accordingly
                                    if (!_.isUndefined(criteriaItem.value) && !_.isUndefined(criteriaItem.value.isRelative) && criteriaItem.value.isRelative == true) {
                                        var relativeType = criteriaItem.value.relativeDateValue;
                                        var offsetValue = criteriaItem.value.numericValue;
                                        var relativeDateTime = viewModel.getRelativeDate(relativeType, offsetValue);
                                        criteriaItem.value.set("dateValue", kendo.toString(new Date(relativeDateTime.setHours(0, 0, 0, 0)), 'g'));
                                        
                                        //for between date range, calculate relative end date value
                                        if (criteriaItem.operator == "between") {
                                            var relativeEndType = criteriaItem.value.relativeEndDateValue;
                                            var offsetEndValue = criteriaItem.value.numericEndValue;
                                            var relativeEndDateTime = viewModel.getRelativeDate(relativeEndType, offsetEndValue);
                                            criteriaItem.value.set("endValue", kendo.toString(new Date(relativeEndDateTime.setHours(0, 0, 0, 0)), 'g'));
                                        }
                                    }
                                });
                            }
                        }
                    });
                },
                getRelativeDate: function(relativeType, offsetValue) {
                    var relativeDate = new Date();
                    var currentDate = new Date();
                    var quarter = Math.round((currentDate.getMonth() - 1) / 3 + 1);

                    switch (relativeType) {
                        case "tomorrow":
                        case "daysfromnow":
                            relativeDate.setDate(currentDate.getDate() + offsetValue);
                            break;
                        case "yesterday":
                        case "daysago":
                            relativeDate.setDate(currentDate.getDate() - offsetValue);
                            break;
                        case "monthsfromnow":
                            relativeDate.setMonth(currentDate.getMonth() + offsetValue);
                            break;
                        case "monthsago":
                            relativeDate.setMonth(currentDate.getMonth() - offsetValue);
                            break;
                        case "yearsfromnow":
                            relativeDate.setFullYear(currentDate.getFullYear() + offsetValue);
                            break;
                        case "yearsago":
                            relativeDate.setFullYear(currentDate.getFullYear() - offsetValue);
                            break;
                        case "firstdayofmonth":
                            relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                            break;
                        case "lastdayofmonth":
                            relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                            break;
                        case "firstdayofyear":
                            relativeDate = new Date(currentDate.getFullYear(), 0, 1);
                            break;
                        case "lastdayofyear":
                            relativeDate = new Date(currentDate.getFullYear(), 11, 31);
                            break;
                        case "firstdayofquarter":
                            relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 2) - 1), 1);
                            break;
                        case "lastdayofquarter":
                            relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 1) + 1), 0);
                            break;
                        default:
                            break;
                    }
                    return relativeDate;
                },
                updateCriteriaGroup: function(criteria, section) {
                    if (criteria.items && criteria.items.length > 0) {
                        _.each(criteria.items, function(item) {
                            if (item.items) {
                                viewModel.updateCriteriaGroup(item, section);
                            } else {
                                viewModel.updateCriteria(item, section);
                            }
                        });
                    } else {
                        viewModel.updateCriteria(criteria, section);
                    }

                },
                updateCriteria: function(criteria, section) {
                    if (_.isUndefined(criteria.fields)) {
                        criteria.set("fields", getSectionSchemaFields(section.sectionTypeName));
                    }
                    if (_.isUndefined(criteria.validOperators)) {
                        criteria.set("validOperators", viewModel.fieldTypes[criteria.field.fieldType].validOperators);
                        viewModel.onOperatorChanged({ data: criteria });
                    }

                    //fix for old/saved enumValues who still follows the Id/Text format
                    if (!_.isUndefined(criteria.value.enumValue)) {
                        if (_.isUndefined(criteria.value.enumValue.Name)) {
                            criteria.value.enumValue.Name = criteria.value.enumValue.Text;
                        }
                    }
                },
                updateCriteriaSection: function() {
                    _.each(this.query, function(section) {
                        if (_.isUndefined(section.sectionId)) {
                            section.sectionId = app.lib.newGUID();
                        }
                        _.each(section.criteriaRoot.items, function(criteria) {
                            if (_.isUndefined(criteria.sectionId)) {
                                criteria.set("sectionId", section.sectionId);
                            }
                            if (_.isUndefined(criteria.sectionTypeName)) {
                                criteria.set("sectionTypeName", section.sectionTypeName);
                            }
                            viewModel.updateCriteriaGroup(criteria, section);
                        });
                    });
                }
            });

            if (configuration.initialize) {
                configuration.initialize(viewModel);
            }

            var view = new kendo.View(built(), { wrap: false, model: kendo.observable(viewModel) });
            callback(view.render());
        }
    }
    return definition;
});

//BUG 19251: kendo combobox and dropdownlist needs to be re rendered for them to work in IE
function updateModel(e) {
    if (e.sender) {
        var widget = e.sender;
        setTimeout(function () {
            $(widget.element.parent()).hide(0, function () {
                $(this).show();
            });
            $(".rule-container").hide(0, function () {
                $(this).show();
            });
        }, 1000);
    }
};

var queryBuilderStandardConfigurationDefinitions = {
    workItemConfig: {
        initialize: function (viewModel, isClear) {
            ///this will initialize a default query if one does not exist, and will add criteria for title, and description if the searchtext query parameter exists
            if (!viewModel.query || viewModel.query.length == 0) {
                var urlQueryParams = app.lib.getQueryParams(location.search);
                viewModel.set("selectedSection", viewModel.sectionDefs[0]); //get the first non-null section def value.
                viewModel.addCriteriaSection();
                
                if (urlQueryParams.searchtext && !isClear) {
                    var searchText = decodeURIComponent(urlQueryParams.searchtext);
                    viewModel.query[0].criteriaRoot.groupOperator = "Or";
                    //replace the root items model with 2 fields to query the title or description.
                    viewModel.query[0].criteriaRoot.set("items",
                    [
                        {
                            "field": {
                                "name": "title",
                                "displayKey": "Title",
                                "dataType": "string",
                                "fieldType": "string",
                                "templateValue": "",
                                "displayName": "Title"
                            },
                            "operator": "contains",
                            "value": { "stringValue": searchText },
                            "type": "criteria"
                        },
                        {
                            "field": {
                                "name": "description",
                                "displayKey": "Description",
                                "dataType": "string",
                                "fieldType": "string",
                                "templateValue": "",
                                "displayName": "Description"
                            },
                            "operator": "contains",
                            "value": { "stringValue": searchText },
                            "type": "criteria"
                        }
                    ]);

                    viewModel.updateCriteriaSection(); //update criteria section based on hearder search query
                    viewModel.executeSearch(); //execute the search if the user passed searchtext querystring parameter.
                    viewModel.set("editMode", true);
                } else {
                    viewModel.set("editMode", true); //if this is a request for a default query, then editmode should be true. Anything else will leave it as false.
                }
            } else {
                viewModel.updateCriteriaSection(); //update criteria section based on saved-search query
                viewModel.executeSearch(); //execute search if a non-default query was present.
            }

            //we need to hide buttons and edit if this view is not the child of "MY SEARCHES"  => 512cadbb-998b-4f10-b7ef-37f3b0f6e698
            //AND is the "WORK ITEM SEARCH" view  => 0316e159-2806-43b2-9018-b695f7bc1088
            //AND is not an admin
            app.lib.getNavNode(function (node) {
                if (!_.isNull(node)) {
                    if (node.ParentId != "512cadbb-998b-4f10-b7ef-37f3b0f6e698" && //MY SEARCHES
                        node.Id != "0316e159-2806-43b2-9018-b695f7bc1088" && //WORK ITEM SEARCH
                        !session.user.IsAdmin) {
                        viewModel.set('validActions', {
                            search: false,
                            save: false,
                            saveAs: false,
                            "delete": false,
                            clearQuery: false
                        });
                    }
                }
            });
        },
        "schemaDef": {
            "commonFields": [
                { "name": "WorkItem.WorkItemId", "displayKey": "ID", "fieldType": "string", "templateValue": "" },
                { "name": "Title", "displayKey": "Title", "fieldType": "string", "templateValue": "" },
                { "name": "Description", "displayKey": "Description", "fieldType": "string", "templateValue": "" },
                { "name": "AssignedUserId", "displayKey": "AssignedTo", "fieldType": "user", "templateValue": "" },
                { "name": "Created", "displayKey": "CreatedDate", "fieldType": "date", "templateValue": "" },
                { "name": "ContactMethod", "displayKey": "ContactMethod", "fieldType": "string", "templateValue": "" },
                { "name": "DisplayName", "displayKey": "DisplayName", "fieldType": "string", "templateValue": "" },
                { "name": "ActualDowntimeEndDate", "displayKey": "ActualDowntimeEndDate", "fieldType": "date", "templateValue": "" },
                { "name": "ActualDowntimeStartDate", "displayKey": "ActualDowntimeStartDate", "fieldType": "date", "templateValue": "" },
                { "name": "ActualEndDate", "displayKey": "ActualEndDate", "fieldType": "date", "templateValue": "" },
                { "name": "ActualStartDate", "displayKey": "ActualStartDate", "fieldType": "date", "templateValue": "" },
                { "name": "FirstAssignedDate", "displayKey": "FirstAssignedDate", "fieldType": "date", "templateValue": "" },
                { "name": "FirstResponseDate", "displayKey": "FirstResponseDate", "fieldType": "date", "templateValue": "" },
                { "name": "RequiredByDate", "displayKey": "RequiredByDate", "fieldType": "date", "templateValue": "" },
                { "name": "ScheduledDowntimeEndDate", "displayKey": "ScheduledDowntimeEndDate", "fieldType": "date", "templateValue": "" },
                { "name": "ScheduledDowntimeStartDate", "displayKey": "ScheduledDowntimeStartDate", "fieldType": "date", "templateValue": "" },
                { "name": "ScheduledEndDate", "displayKey": "ScheduledEndDate", "fieldType": "date", "templateValue": "" },
                { "name": "ScheduledStartDate", "displayKey": "ScheduledStartDate", "fieldType": "date", "templateValue": "" },
                { "name": "ActualCost", "displayKey": "ActualCost", "fieldType": "double", "templateValue": "" },
                { "name": "EffortCompleted", "displayKey": "EffortCompleted", "fieldType": "double", "templateValue": "" },
                { "name": "PlannedCost", "displayKey": "PlannedCost", "fieldType": "double", "templateValue": "" },
                { "name": "EffortEstimate", "displayKey": "EffortEstimate", "fieldType": "double", "templateValue": "" },
                { "name": "IsDowntime", "displayKey": "IsDowntime", "fieldType": "bool", "templateValue": "" },
                { "name": "IsParent", "displayKey": "IsParent", "fieldType": "bool", "templateValue": "" },
                { "name": "LastModified", "displayKey": "LastModified", "fieldType": "date", "templateValue": "" },
                { "name": "ClosedDate", "displayKey": "ClosedDate", "fieldType": "date", "templateValue": "" },
                { "name": "IsUseWatchList", "displayKey": "UseWatchList", "fieldType": "bool", "templateValue": "" }

            ],
            "sections": [
                {
                    "displayKey": "AllWorkItems",
                    "name": "ALL",
                    "classId": "",
                    "fields": []
                },
                {
                    "displayKey": "Incidents",
                    "name": "IR",
                    "classId": "A604B942-4C7B-2FB2-28DC-61DC6F465C68",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "89b34802-671e-e422-5e38-7dae9a413ef8"
                        },
                        {
                            "name": "sourceId",
                            "displayKey": "Source",
                            "fieldType": "enum",
                            "templateValue": "5d59071e-69b3-7ef4-6dee-aacc5b36d898"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "1f77f0ce-9e43-340f-1fd5-b11cc36c9cba"
                        },
                        {
                            "name": "tierId",
                            "displayKey": "SupportGroup",
                            "fieldType": "enum",
                            "templateValue": "c3264527-a501-029f-6872-31300080b3bf"
                        },
                        {
                            "name": "AffectedUserId",
                            "displayKey": "AffectedUser",
                            "fieldType": "user",
                            "templateValue": ""
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "AffectedItem",
                            "fieldType": "affectedconfigitem",
                            "templateValue": ""
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "RelatedItem",
                            "fieldType": "relatedconfigitem",
                            "templateValue": ""
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "double",
                            "templateValue": ""
                        },
                        {
                            "name": "Impact",
                            "displayKey": "Impact",
                            "fieldType": "enum",
                            "templateValue": "11756265-f18e-e090-eed2-3aa923a4c872"
                        },
                        {
                            "name": "ResolvedDate",
                            "displayKey": "ResolvedDate",
                            "fieldType": "date",
                            "templateValue": ""
                        },
                        {
                            "name": "Urgency",
                            "displayKey": "Urgency",
                            "fieldType": "enum",
                            "templateValue": "04b28bfb-8898-9af3-009b-979e58837852"
                        },
                        {
                            "name": "SoonestSLOBreachTime",
                            "displayKey": "SLOBreachDate",
                            "fieldType": "date",
                            "templateValue": ""
                        },
                        {
                            "name": "SoonestSLOWarningTime",
                            "displayKey": "SLOWarnDate",
                            "fieldType": "date",
                            "templateValue": ""
                        }
                    ]
                },
                {
                    "displayKey": "ServiceRequests",
                    "name": "SR",
                    "classId": "04B69835-6343-4DE2-4B19-6BE08C612989",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "4e0ab24a-0b46-efe6-c7d2-5704d95824c7"
                        },
                        {
                            "name": "sourceId",
                            "displayKey": "Source",
                            "fieldType": "enum",
                            "templateValue": "848211a2-393a-6ec5-9c97-8e1e0cfebba2"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "3880594c-dc54-9307-93e4-45a18bb0e9e1"
                        },
                        {
                            "name": "tierId",
                            "displayKey": "SupportGroup",
                            "fieldType": "enum",
                            "templateValue": "23c243f6-9365-d46f-dff2-03826e24d228"
                        },
                        {
                            "name": "affectedUserId",
                            "displayKey": "AffectedUser",
                            "fieldType": "user",
                            "templateValue": ""
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "AffectedItem",
                            "fieldType": "affectedconfigitem",
                            "templateValue": ""
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "RelatedItem",
                            "fieldType": "relatedconfigitem",
                            "templateValue": ""
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "enum",
                            "templateValue": "d55e65ea-fae9-f7db-0937-843bfb1367c0"
                        },
                        {
                            "name": "CompletedDate",
                            "displayKey": "CompletedDate",
                            "fieldType": "date",
                            "templateValue": ""
                        },
                        {
                            "name": "Urgency",
                            "displayKey": "Urgency",
                            "fieldType": "enum",
                            "templateValue": "eb35f771-8b0a-41aa-18fb-0432dfd957c4"
                        },
                        {
                             "name": "SoonestSLOBreachTime",
                             "displayKey": "SLOBreachDate",
                             "fieldType": "date",
                             "templateValue": ""
                        },
                        {
                            "name": "SoonestSLOWarningTime",
                            "displayKey": "SLOWarnDate",
                            "fieldType": "date",
                            "templateValue": ""
                        }
                    ]

                },
                {
                    "displayKey": "ChangeRequests",
                    "name": "CR",
                    "classId": "E6C9CF6E-D7FE-1B5D-216C-C3F5D2C7670C",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "0bf0a71b-9e9e-f719-0271-c9a4ff352600"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "28f88c04-d11d-78c0-a237-fa9abd6C6478"
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "AffectedItem",
                            "fieldType": "affectedconfigitem",
                            "templateValue": "na"
                        },
                        {
                            "name": "ConfigurationItemId",
                            "displayKey": "RelatedItem",
                            "fieldType": "relatedconfigitem",
                            "templateValue": ""
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "enum",
                            "templateValue": "b40092af-f163-af28-6150-bb0ffa677660"
                        },
                        {
                            "name": "Impact",
                            "displayKey": "Impact",
                            "fieldType": "enum",
                            "templateValue": "44edd2ff-6280-afb7-3a0d-d6e8a711d894"
                        }
                    ]
                },
                {
                    "displayKey": "ManualActivities",
                    "name": "MA",
                    "classId": "7AC62BD4-8FCE-A150-3B40-16A39A61383D",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "57db4880-000e-20bb-2f9d-fe4e8aca3cf6"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "0d1c5836-644e-bfe4-5adf-cfe40fc08dfa"
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "enum",
                            "templateValue": "65a34474-f43d-d880-7eb0-bad49efa7cf1"
                        }
                    ]
                },
                {
                    "displayKey": "ReviewActivities",
                    "name": "RA",
                    "classId": "BFD90AAA-80DD-0FBB-6EAF-65D92C1D8E36",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "57db4880-000e-20bb-2f9d-fe4e8aca3cf6"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "0d1c5836-644e-bfe4-5adf-cfe40fc08dfa"
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "enum",
                            "templateValue": "65a34474-f43d-d880-7eb0-bad49efa7cf1"
                        }
                        
                    ]
                },
                {
                    "displayKey": "Problem",
                    "name": "PR",
                    "classId": "422AFC88-5EFF-F4C5-F8F6-E01038CDE67F",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "56c99a7d-6ac7-ab3c-e6c0-bbf5fe76a65c"
                        },
                        {
                            "name": "sourceId",
                            "displayKey": "Source",
                            "fieldType": "enum",
                            "templateValue": "91c21d12-7e66-3e02-cc44-824f6b131547"
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "double",
                            "templateValue": ""
                        },
                        {
                            "name": "Impact",
                            "displayKey": "Impact",
                            "fieldType": "enum",
                            "templateValue": "11756265-f18e-e090-eed2-3aa923a4c872"
                        },
                        {
                            "name": "Urgency",
                            "displayKey": "Urgency",
                            "fieldType": "enum",
                            "templateValue": "04b28bfb-8898-9af3-009b-979e58837852"
                        },
                        {
                            "name": "categoryId",
                            "displayKey": "Classification",
                            "fieldType": "enum",
                            "templateValue": "9b2c7fa1-6a48-9592-4116-3f7385b068ac"
                        }
                    ]
                },
                {
                    "displayKey": "ReleaseRecord",
                    "name": "RR",
                    "classId": "D02DC3B6-D709-46F8-CB72-452FA5E082B8",
                    "fields": [
                        {
                            "name": "statusId",
                            "displayKey": "Status",
                            "fieldType": "enum",
                            "templateValue": "8909ce55-a87f-2d7e-eb64-aba670596696"
                        },
                        {
                            "name": "PriorityId",
                            "displayKey": "Priority",
                            "fieldType": "enum",
                            "templateValue": "a384feeb-0ff6-3971-faac-9710c250b802"
                        },
                        {
                            "name": "Impact",
                            "displayKey": "Impact",
                            "fieldType": "enum",
                            "templateValue": "510E6308-9637-DAC7-5814-92465703270A"
                        }
                    ]
                }
            ]
        },
        "gridDefaultConfig": {
            fromQueryBuilder: true,
            isAnalyst: session.user.Analyst,
            gridJsonDataForCountdown: {},
            tempProperties: {},
            grid: {
                GridType: "QueryBuilderGrid",
                columns: [
                    { "DataType": "numeric", "field": "NumericId", "hidden": true, "attributes": { "class": "grid-highlight-column" } },
                    {
                        DataType: "String", field: "Icon", width: 50, filterable: false,
                        attributes: { "class": "icon-column grid-highlight-column" },
                        template: "\u003cimg class=\u0027gridicon\u0027 src=\u0027/Content/Images/Icons/WorkTypeIcons/#:data.Icon#\u0027 alt=\u0027#:data.Icon#\u0027 /\u003e"
                    },
                    { "DataType": "string", "field": "Id", "title": "Id", "width": 80, "attributes": { "class": "grid-highlight-column" } },
                    { "DataType": "string", "field": "Title", "width": 350, "attributes": { "class": "grid-highlight-column" } },
                    { "DataType": "string", "field": "Status", "width": 100 },
                    { "DataType": "string", "field": "AssignedUser", "analystOnly": true, "width": 150 },
                    { "DataType": "string", "field": "Priority", "width": 90 },
                    { "DataType": "string", "field": "Category", "width": 110 },
                    { "DataType": "string", "field": "AffectedUser", "width": 150 },
                    { "DataType": "string", "field": "Tier", "title": "SupportGroup", "width": 150 },
                    { "DataType": "datetime", "field": "LastModified", "width": 100 },
                    { "DataType": "datetime", "field": "Created", "width": 100 },
                    { "DataType": "DateTime", "field": "ScheduledStartDate", "width": 100, "hidden": true },
                    { "DataType": "DateTime", "field": "ScheduledEndDate", "width": 100, "hidden": true },
                    { "DataType": "string", "field": "BaseId", "hidden": true },
                    { "DataType": "string", "field": "ParentWorkItemId", "hidden": true },
                    { "DataType": "string", "field": "ParentWorkItemType", "hidden": true }
                ],
                options: {
                },
                dataSourceOptions: {
                    schema: {
                        data: "Data",
                        total: "Total",
                        model: {
                            "id": "WorkItemId"
                        }
                    }
                }
            },
        }
    },
};

