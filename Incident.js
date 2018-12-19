/*global session */
{
  "Default": {
    "tabList": [
      {
        "name": "General",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "IncidentInformation",
                "rows": [
                  {
                    "columnFieldList": [
                      {
                        "DataType": "UserPicker",
                        "PropertyDisplayName": "AffectedUser",
                        "PropertyName": "RequestedWorkItem"
                      },
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Alternatecontactmethod",
                        "PropertyName": "ContactMethod",
                        "ColSpan": 2,
                        "MinLength": 0,
                        "MaxLength": 256
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Title",
                        "PropertyName": "Title",
                        "Required": true,
                        "MinLength": 0,
                        "MaxLength": 200
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "LongString",
                        "PropertyDisplayName": "Description",
                        "PropertyName": "Description",
                        "MinLength": 0,
                        "MaxLength": 4000
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "Classification",
                        "PropertyName": "Classification",
                        "EnumId": "1f77f0ce-9e43-340f-1fd5-b11cc36c9cba",
                        "Required": false,
                        "ColSpan": 8
                      },
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Jira ID",
                        "PropertyName": "Jira_Id",
                        "MinLength": 0,
                        "MaxLength": 100,
                        "ColSpan": 2
                      },
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "Source",
                        "PropertyName": "Source",
                        "EnumId": "5d59071e-69b3-7ef4-6dee-aacc5b36d898",
                        "Disabled": true,
                        "ColSpan": 2
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "Impact",
                        "PropertyName": "Impact",
                        "EnumId": "11756265-f18e-e090-eed2-3aa923a4c872",
                        "Required": true,
                        "ColSpan": 5
                      },
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "Urgency",
                        "PropertyName": "Urgency",
                        "EnumId": "04b28bfb-8898-9af3-009b-979e58837852",
                        "Required": true,
                        "ColSpan": 5
                      },
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Priority",
                        "PropertyName": "Priority",
                        "Disabled": true,
                        "ColSpan": 2
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "SupportGroup",
                        "PropertyName": "TierQueue",
                        "EnumId": "c3264527-a501-029f-6872-31300080b3bf",
                        "Required": true
                      },
                      {
                        "DataType": "UserPicker",
                        "PropertyDisplayName": "AssignedTo",
                        "PropertyName": "AssignedWorkItem",
                        "FilterByAnalyst": true
                      },
                      {
                        "DataType": "UserPicker",
                        "PropertyDisplayName": "PrimaryOwner",
                        "PropertyName": "RelatesToIncident",
                        "FilterByAnalyst": true
                      },
                      {
                        "DataType": "DateTime",
                        "PropertyDisplayName": "Expected Completion Date",
                        "PropertyName": "ExpectedCompletionDate"
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "Boolean",
                        "PropertyDisplayName": "Escalated",
                        "PropertyName": "Escalated",
                        "Required": false,
                        "Inline": true
                      }
                    ]
                  }
                ]
              },
              {
                "name": "UserInput",
                "type": "userInput"
              },
              {
                "name": "ActionLog",
                "type": "actionLog"
              }
            ]
          }
        ]
      },
      {
        "name": "Activities",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "Activities",
                "type": "activities"
              }
            ]
          }
        ]
      },
      {
        "name": "RelatedItems",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "RelatedConfigurationItems",
                "type": "relatedItems"
              },
              {
                "name": "AffectedConfigurationItems",
                "type": "affectedItems"
              },
              {
                "name": "ChildWorkIems",
                "type": "childWorkItems"
              },
              {
                "name": "FileAttachments",
                "type": "fileAttachments"
              },
              {
                "name": "WorkItems",
                "type": "multipleObjectPicker",
                "PropertyName": "RelatesToWorkItem",
                "ClassId": "f59821e2-0364-ed2c-19e3-752efbb1ece9",
                "PropertyToDisplay": {
                  "Id": "Id",
                  "Title": "Title",
                  "Status": "Status",
                  "LastModified": "LastModified"
                },
                "SelectableRow": true,
                "SelectProperty": "Id"
              },
              {
                "name": "WatchList",
                "type": "multipleObjectPicker",
                "PropertyName": "WatchList",
                "ClassId": "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                "PropertyToDisplay": {
                  "FirstName": "FirstName",
                  "LastName": "LastName",
                  "Title": "Title",
                  "UserName": "Username",
                  "Domain": "Domain",
                  "Company": "Company"
                },
                "Visible": session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
              }
            ]
          }
        ]
      },
      {
        "name": "Resolution",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "Resolution",
                "rows": [
                  {
                    "columnFieldList": [
                      {
                        "DataType": "DateTime",
                        "PropertyDisplayName": "Resolveddate",
                        "PropertyName": "ResolvedDate",
                        "Disabled": true
                      },
                      {
                        "DataType": "UserPicker",
                        "PropertyDisplayName": "ResolvedByUser",
                        "PropertyName": "RelatesToTroubleTicket",
                        "Disabled": true
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "Enum",
                        "PropertyDisplayName": "ResolutionCategory",
                        "PropertyName": "ResolutionCategory",
                        "EnumId": "72674491-02cb-1d90-a48f-1b269eb83602",
                        "Disabled": true
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "LongString",
                        "PropertyDisplayName": "ResolutionDescription",
                        "PropertyName": "ResolutionDescription",
                        "MinLength": 0,
                        "MaxLength": 4000,
                        "Rows": 5,
                        "Disabled": true
                      }
                    ]
                  }
                ]
              },
              {
                "name": "TimeWorked",
                "type": "billableTime"
              }
            ]
          }
        ]
      },
      {
        "name": "History",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "History",
                "type": "history"
              }
            ]
          }
        ]
      }
    ]
  },
  "DefaultEndUser": {
    "tabList": [
      {
        "name": "General",
        "content": [
          {
            "customFieldGroupList": [
              {
                "name": "IncidentInformation",
                "rows": [
                  {
                    "columnFieldList": [
                      {
                        "DataType": "UserPicker",
                        "PropertyDisplayName": "AffectedUser",
                        "PropertyName": "RequestedWorkItem",
                        "Disabled": true
                      },
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Alternatecontactmethod",
                        "PropertyName": "ContactMethod",
                        "ColSpan": 2,
                        "MinLength": 0,
                        "MaxLength": 256
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "String",
                        "PropertyDisplayName": "Title",
                        "PropertyName": "Title",
                        "Required": true,
                        "MinLength": 0,
                        "MaxLength": 200,
                        "Disabled": true
                      }
                    ]
                  },
                  {
                    "columnFieldList": [
                      {
                        "DataType": "LongString",
                        "PropertyDisplayName": "Description",
                        "PropertyName": "Description",
                        "MinLength": 0,
                        "MaxLength": 4000,
                        "Disabled": true
                      }
                    ]
                  }
                ]
              },
              {
                "name": "ActionLog",
                "type": "actionLog"
              },
              {
                "name": "FileAttachments",
                "type": "fileAttachments"
              }
            ]
          }
        ]
      }
    ]
  }
}