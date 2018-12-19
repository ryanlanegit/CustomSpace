# CustomSpace

CustomSpace Directory Contained Within a Cireson Portal Installation

## IIS Customizations

### IIS Redirects

The current redirects that redirect out of the box requests to our customized scripts.

PSPath                                                                       | Location              | destination                                                       | exactDestination | httpResponseStatus
---------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------- | ---------------- | ------------------
MACHINE/WEBROOT/APPHOST/CiresonPortal/customspace                            | custom.css            | /CustomSpace/custom.min.css                                       | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts                                | viewMain.js           | /CustomSpace/Scripts/viewMain-built.min.js                        | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/app/templates/activity         | generic-activity.html | /CustomSpace/Scripts/app/templates/activity/generic-activity.html | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/app/templates/activity         | manual-activity.html  | /CustomSpace/Scripts/app/templates/activity/manual-activity.html  | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/app/templates/activity         | review-activity.html  | /CustomSpace/Scripts/app/templates/activity/review-activity.html  | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms                          | wiMain.js             | /CustomSpace/Scripts/forms/wiMain-built.min.js                    | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms                          | profileMain.js        | /CustomSpace/Scripts/forms/profileMain-built.min.js               | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms                          | wiActivityMain.js     | /CustomSpace/Scripts/forms/wiActivityMain-built.min.js            | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms/predefined/affecteditems | controller.js         | /CustomSpace/Scripts/forms/predefined/affectedItems/controller.js | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms/predefined/history       | view.html             | /CustomSpace/Scripts/forms/predefined/history/view.html           | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms/predefined/history       | controller.js         | /CustomSpace/Scripts/forms/predefined/history/controller.js       | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms/predefined/relateditems  | controller.js         | /CustomSpace/Scripts/forms/predefined/relatedItems/controller.js  | False            | Permanent         
MACHINE/WEBROOT/APPHOST/CiresonPortal/scripts/forms/tasks/sendemail          | controller.js         | /CustomSpace/Scripts/forms/tasks/sendEmail/controller.js          | False            | Permanent         

## Custom Plugins

### [History](Scripts/forms/predefined/history)

### [Grid Task Builder](Scripts/grids)

### [Request Offering Task Builder](Scripts/serviceCatalog)

### [Work Item Task Builder](Scripts/forms)
