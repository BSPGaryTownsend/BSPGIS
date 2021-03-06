﻿/*global define,location */
/*jslint sloppy:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define({
    //Default configuration settings for the application. This is where you'll define things like a bing maps key,
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
    "appid": "",
    "webmap": "a0eb9793a5ca4bec981bd15313a8e516",
    "oauthappid": null, //"AFTKRmv16wj14N3z",
    //Group templates must support a group url parameter. This will contain the id of the group.
    //group: "",
    //Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
    //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
    "proxyurl": "/proxy/proxy.ashx",
    "bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
    //Defaults to arcgis.com. Set this value to your portal or organization host name.
    "sharinghost": location.protocol + "//" + "www.arcgis.com",
    //When true the template will query arcgis.com for default settings for helper services, units etc. If you
    //want to use custom settings for units or any of the helper services set queryForOrg to false then enter
    //default values for any items you need using the helper services and units properties.
    "queryForOrg": true,
    //If you need localization set the localize value to true to get the localized strings
    //from the javascript/nls/resource files.
    //Note that we've included a placeholder nls folder and a resource file with one error string
    //to show how to setup the strings file.
    "localize": true,
    "units": null,
    //Theme defines the background color of the title area and tool dialog 
    //Color defines the text color for the title and details. Note that 
    //both these values must be specified as hex colors. 
    "theme": "#00add8",
    "color": "#fff",
    //Specify the tool icon color for the tools on the toolbar and the menu icon.
    // Valid values are white and black.
    "icons": "white",
    "logo": null, 
    //Set of tools that will be added to the toolbar 
    "tools": [
        {"name": "legend", "enabled": false}, 
        {"name": "bookmarks", "enabled": true},
        {"name": "layers", "enabled": false}, 
        {"name": "basemap", "enabled": false}, 
        {"name": "overview", "enabled": false},
        {"name": "measure", "enabled": false}, 
        {"name": "edit", "enabled": false, "toolbar": false}, 
        {"name": "print", "enabled": false, "legend": true, "layouts":false, "format":"pdf"}, 
        { "name": "details", "enabled": true },
        { "name": "infopanel", "enabled": true },
        {"name": "share", "enabled": false}
    ], 
    //Set the active tool on the toolbar. Note home and locate can't be the active tool. 
    "activeTool": "infopanel",
    //Add the geocoding tool next to the title bar
    "search": true,
    //Add the home extent button to the toolbar 
    "home": true,
    //Add the geolocation button on the toolbar. Only displayed if browser supports geolocation
    "locate": false,
    //Specify a title for the application. If not provided the web map title is used. 
    "title": null, 
    //This option demonstrates how to handle additional custom url parameters. For example
    //if you want users to be able to specify lat/lon coordinates that define the map's center or
    //specify an alternate basemap via a url parameter.
    "urlItems": [
        "extent,color" 
    ],
    //Replace these with your own bitly key
    "bitlyLogin": "esrimarketing",
    "bitlyKey": "R_52f84981da0e75b23aea2b3b20cbafbc",
    "helperServices": {
        "geometry": {
            "url": null
        },
        "printTask": {
            "url": null
        },
        "elevationSync": {
            "url": null
        },
        "geocode": [{
            "url": null
        }]
    }
});
