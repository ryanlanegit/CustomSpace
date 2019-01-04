{
    "Id": "vp-YearOverYear",
    "TypeId": "chart",
    "Definition": {
        "content": {
            "title": "",
            "queryId": "fae43ae8-898a-f89c-b60e-5fa53546ee5f",
			"series": [
                {
                    "field": "YTD",
                    "name": "Year-To-Date",
                    "type": "bar",
                    "stack": false,
					"labels": {
						"visible": false
					}
                },
                {
                    "field": "PrevYTD",
                    "name": "Previous Year-To-Date",
                    "type": "bar",
                    "stack": false,
					"labels": {
						"visible": false
					}
                }
            ],
            "categoryAxis": {
                "field": "DisplayName",
                "labels": {
                    "visible": true,
					"rotation": {
                        "angle": "auto"
                    },
                    "template": "#= (Date.parse((value) ? value.toString().replace(/\\s+/, '') : value) && parseFloat((value) ? value.toString().replace(/\\s+/, '') : value) && /^\\d+$/.test((value) ? value.toString().replace(/\\s+/, '') : value) == false) ? kendo.toString(new Date(value),'MMM d') : value #"
                }
            },
            "valueAxis": {
                "labels": {
                    "visible": true,
                    "format": "{0}"
                }
            },
            "seriesColors": ["#6EB8E1", "#327BA9", "#37454E", "#2ECC71", "#C0392B", "#8E44AD"]
        }
    }
}
