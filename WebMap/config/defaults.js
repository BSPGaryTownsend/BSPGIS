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
    "webmap": "753dcfe7d5ee4984a281da14cef54366", //"4ab11e3ebab04de6b04c42bbc102d3c0",
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
    "localize": false,
    "units": null,
    
    // **************************** //
    // ** UI SPECIFIC PARAMETERS ** //
    "cycleColors": 0,
    "color": "#00add8",
    "colors": ["#0071ab", "#27a4d2", "#886197", "#8a2581", "#fc0055", "#c50143", "#db0111", "#ec5b02", "#efa602", "#dab900", "#80ab00", "#548901", "#049686", "#097096"],
    "logo" : "images/MapHeader.png",
    "title": "",
    // **************************** //
    
    // **************************** //
    // ** LOCAL PERSPECTIVE PARAMETERS **//
    "showDemographics": false,
    "demographicsLabel": "Demographics",
    //"demographicsURL": "http://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Percent_Under_18/MapServer/1",
    //"demographicsFields": "TOTPOP_CY,POPL18_CY,POP65U_CY",
    //"demographicsAliases": "2012 Total Population,2012 Population Under 18 Years,2012 Population Over 65 Years",
    "demographicsURL": "http://services.arcgis.com/80hk79qB8z45zcHi/ArcGIS/rest/services/US_Block_Group_Points/FeatureServer/0",
    "demographicsFields": "POP2010,MALES,FEMALES,HSE_UNITS",
    "demographicsAliases": "2010 Total Population,Male Population,Female Population,Housing Units",
    "showLifestyle": false,
    "lifestyleLabel": "Lifestyle",
    "lifestyleURL": "http://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Tapestry/MapServer/1",
    "showWeather": true,
    "weatherLabel": "Weather",
    "weatherURL": "http://api.worldweatheronline.com/free/v1/weather.ashx?format=json&num_of_days=3&extra=localObsTime&key=2ef535c81462d3e361b110fcf0bcd62430fd05f7", // URL to free weather API information with your access token
    //"weatherLayerURL_Tiled" : "https://gisserver.accuweather.com/ESRITileServices2/tileRequest/AccuTileServices/LatestUSHiResRadar/N1dvRW9KUjNNK2tYWFp4Y1h6M2lCa2ZTRW5wMWJzeXdaamxIY3ZkRmcxVCs1YXdPaE1MckpBPT0=/MapServer/tile/{level}/{row}/{col}",
    //"weatherLayerURL_WMS": "http://geo.weather.gc.ca/geomet/?lang=E&service=WMS&request=GetCapabilities", // URL for WMS weather layer.
    "weatherUnits": "C", // options: F or C
    "showDirections": false,
    "directionsLabel": "Directions",
    "directionsURL": null,
    "distanceUnits": "kilometers", // options: miles or kilometers
    "defaultZoomLevel": 14,
    "showSites": true,
    "sitesLabel": "BSP Sites",
    "sitesURL": "http://services.arcgis.com/pgFCLzxld5dtMQ6u/ArcGIS/rest/services/Enriched_Sites/FeatureServer/0",
    // **************************** //
    
    //This option demonstrates how to handle additional custom url parameters. For example
    //if you want users to be able to specify lat/lon coordinates that define the map's center or
    //specify an alternate basemap via a url parameter.
    "urlItems": [
        "extent",
        "color",
        "cycleColors",
        "showDirections"
    ],
    "helperServices": {
        "geometry": {
            "url": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
        },
        "printTask": {
            "url": null
        },
        "routeTask": {
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
