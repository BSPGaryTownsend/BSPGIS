<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="360.aspx.vb" Inherits="WebMap._360" %>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--The viewport meta tag is used to improve the presentation and behavior of the samples 
      on iOS devices-->
    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
    <title>360 Tool</title>
    <link rel="stylesheet" href="http://js.arcgis.com/3.9/js/dojo/dijit/themes/tundra/tundra.css">
    <link rel="stylesheet" href="http://js.arcgis.com/3.9/js/esri/css/esri.css">
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }

        .indent5 {
            margin-bottom: 10px;
            padding-right: 25px;
            text-align: right;
        }

        .pageHeader {
            text-align: center;
            width: 100%;
            padding-top: 30px;
            font-family: Verdana, Geneva, sans-serif;
            font-size: 36pt;
        }

        #borderContainerTwo {
            width: 100%;
            height: 100%;
        }

            #borderContainerTwo ul {
                font-size: 10pt;
                list-style: none outside none;
                margin: 0;
                padding: 5px;
            }

            #borderContainerTwo h2 {
                background-color: #a05c19;
                border-color: black;
                border-radius: 8px;
                border-style: solid;
                border-width: 1px;
                color: white;
                font-size: 12pt;
                margin: 0;
                padding: 2px 2px 2px 10px;
            }

        #mapDiv {
            width: auto;
            height: 100%;
            bottom: 0px;
            right: 0px;
        }

        #messages {
            background-color: #fff;
            box-shadow: 0 0 5px #888;
            font-size: 1.1em;
            max-width: 15em;
            padding: 0.5em;
            position: absolute;
            right: 20px;
            top: 20px;
            z-index: 40;
        }

        .tundra .dijitAccordionTitle {
            background-image: none;
            background-color: #558F9D;
            color: white;
            border-top: 1px solid #AED0D8;
        }

        .tundra .dijitAccordionTitleSelected {
            background-image: none;
            background-color: #2C6F7E;
            color: white;
            border-top: 1px solid #AED0D8;
        }

        .maptoolBar {
            background: none repeat scroll 0 0 #4d4d4f;
            border-bottom: 1px solid #ccc;
            color: white;
            padding: 5px;
            width: auto;
        }

            .maptoolBar .dijitButtonText {
                color: black;
            }
    </style>
    <script src="http://js.arcgis.com/3.9/"></script>
    <script>
        var fLayersData;
        var map;
        var pan = true;
        var token;
        require([
          "esri/map", "esri/layers/FeatureLayer",
          "esri/tasks/query", "esri/geometry/Circle", "esri/geometry/Point",
          "esri/graphic", "esri/InfoTemplate", "esri/symbols/SimpleMarkerSymbol",
          "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/renderers/SimpleRenderer",
          "esri/config", "esri/Color", "esri/layers/OpenStreetMapLayer", "esri/IdentityManager", "dojo/dom", "dojo/_base/lang", "dojo/on", "dojo/number",
          "dojo/parser", "dijit/layout/ContentPane", "dijit/layout/BorderContainer", "dijit/layout/TabContainer",
          "dijit/layout/AccordionContainer", "dijit/layout/AccordionPane", "dijit/registry", "dijit/form/Button", "dijit/form/Select", "dojo/dom-construct",
          "esri/dijit/geoenrichment/Infographic", "esri/tasks/geoenrichment/GeometryStudyArea", "dijit/ProgressBar", "dojo/request/script",
          "dojo/domReady!"
        ], function (
          Map, FeatureLayer,
          Query, Circle, Point,
          Graphic, InfoTemplate, SimpleMarkerSymbol,
          SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer,
          esriConfig, Color, OpenStreetMapLayer, IdentityManager, dom, lang, on, number,
          parser, ContentPane, BorderContainer, TabContainer,
          AccordionContainer, AccordionPane, registry, Button, Select, domConstruct,
          Infographic, GeometryStudyArea, ProgressBar, script
        ) {
            var circleSymb = new SimpleFillSymbol(
                  SimpleFillSymbol.STYLE_NULL,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
                    new Color([105, 105, 105]),
                    2
                  ), new Color([255, 255, 0, 0.25])
                );

            var circle;

            var siteType = new Select({
                onChange: function (e) {
                    populateSites(siteType);
                }
            }, "SiteType");


            parser.parse();
            populateSites();
            var panButton = new Button({
                label: "Pan",
                onClick: function () {
                    pan = !(pan);
                    if (pan) {
                        panButton.set("label", "Pan");
                    } else {
                        panButton.set("label", "Pin");
                    }
                }
            }, "panButtonNode");


            script.get("https://www.arcgis.com/sharing/oauth2/token?client_id=UWNMCTbys2h3RGsb&grant_type=client_credentials&client_secret=99b2b08a1b7c44bd9518716b777b0756&f=pjson&expiration=1440", {
                jsonp: "callback"
            }).then(function (response) {
                token = response.access_token;

                lang.extend(FeatureLayer, { BSPDescription: "" });

                map = new Map("mapDiv", {
                    center: [-114.0288, 51.0669],
                    zoom: 12,
                    slider: false
                });
                var infographics;
                var mapLayers = buildModularLayers();
                for (var ig = 0 ; ig < mapLayers.length; ig++) {
                    var igCount = 0;
                    if (mapLayers[ig].summaryType == "InfoGraphics") {
                        var variableList = [];
                        for (var vl = 0; vl < mapLayers[ig].summaryFields.length; vl++) {
                            variableList.push(mapLayers[ig].summaryFields[vl].field);
                        }
                        infographics = new Infographic({
                            type: "RelatedVariables",
                            variables: variableList,
                            returnGeometry: false
                        }, "infographic");
                    }
                }

                var osmLayer = new OpenStreetMapLayer({
                    id: "osmLayer",
                    visible: true
                });
                map.addLayer(osmLayer);
                for (i = 0; i < mapLayers.length; i++) {
                    map.addLayer(mapLayers[i].featureLayer);
                }

                var site = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/ArcGIS/rest/services/Enriched%20Sites/FeatureServer/0?token=" + token,
                {
                    infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
                    outFields: ["*"]
                });
                var nullSymbol = new SimpleMarkerSymbol().setSize(0);
                var symbolPath = "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M14.757,8h2.42v2.574h-2.42V8z M18.762,23.622H16.1c-1.034,0-1.475-0.44-1.475-1.496v-6.865c0-0.33-0.176-0.484-0.484-0.484h-0.88V12.4h2.662c1.035,0,1.474,0.462,1.474,1.496v6.887c0,0.309,0.176,0.484,0.484,0.484h0.88V23.622z"
                var siteSymbol = new SimpleMarkerSymbol();
                var siteSummaryFields = ["THS011",
                                        "THS014",
                                        "THS018",
                                        "A11TOTPOP",
                                        "ECYTOTPOP",
                                        "P5YTOTPOP",
                                        "ECYTENOWN",
                                        "ECYTENRENT",
                                        "THSNINCAGG",
                                        "THSNEXPAVG",
                                        "THSTOTPOP",
                                        "THSEIRATIO",
                                        "EHYTENOWN",
                                        "EHYTENRENT",
                                        "P5YTENOWN",
                                        "P5YTENRENT"];
                siteSymbol.setPath(symbolPath);
                siteSymbol.setColor(new Color([23, 62, 139, 1]));
                siteSymbol.size = 25;
                siteSymbol.setOutline(null);
                site.setSelectionSymbol(siteSymbol);
                site.setRenderer(new SimpleRenderer(nullSymbol));
                map.addLayer(site);

                var jumpToSite = new Button({
                    onClick: function () {
                        var siteName = registry.byId("Site");
                        var query = new Query();
                        var siteData = [];
                        query.where = "GroupName='" + siteName.value + "'"
                        map.graphics.clear();
                        for (var z = 0; z < map.graphicsLayerIds.length; z++) {
                            var layer = map.getLayer(map.graphicsLayerIds[z])
                            layer.clearSelection();
                        }
                        site.queryFeatures(query, function (e) {
                            var feature;
                            var features = e.features;
                            var objID = [];
                            for (var k = 0; k < siteSummaryFields.length; k++) {
                                for (var l = 0; l < e.fields.length; l++) {
                                    if (e.fields[l].name == siteSummaryFields[k]) {
                                        siteData.push({
                                            name: siteSummaryFields[k],
                                            alias: e.fields[l].alias
                                        });
                                    }
                                }
                            }
                            for (var j = 0; j < features.length; j++) {
                                feature = features[j];
                                objID.push(feature.attributes[site.objectIdField]);

                            }
                            var siteQuery = new Query();
                            siteQuery.objectIds = objID;
                            var siteTitle = 'Site Demographic Data';
                            var contentData = '';
                            site.selectFeatures(siteQuery, FeatureLayer.SELECTION_NEW, function (results) {

                                var siteLocation = results[0].geometry;
                                map.centerAndZoom(siteLocation, 14);
                                switch (results[0].attributes.areaType) {
                                    case "RingBuffer":
                                        var rb = new Circle({
                                            center: siteLocation,
                                            geodesic: true,
                                            radius: 2,
                                            radiusUnit: "esriKilometers"
                                        });
                                        var graphic = new Graphic(rb, circleSymb)
                                        map.graphics.clear;
                                        map.graphics.add(graphic);
                                        break;
                                }
                                for (var m = 0; m < siteData.length; m++) {
                                    contentData += '<h2>';
                                    contentData += siteData[m].alias;
                                    contentData += '</h2>';
                                    contentData += '<div class="indent5">';
                                    contentData += number.format(results[0].attributes[siteData[m].name], {
                                        pattern: "#,##0.##"
                                    });
                                    contentData += '</div>';
                                }
                                remakeAccordion();
                                var summaryInfo = registry.byId("leftAccordion");
                                var newChild = new ContentPane({
                                    title: siteTitle,
                                    content: contentData
                                });
                                summaryInfo.addChild(newChild);
                            });
                        });
                    }
                }, "JumpToSite");




                map.on("click", function (evt) {
                    if (!pan) {
                        circle = new Circle({
                            center: evt.mapPoint,
                            geodesic: true,
                            radius: 2,
                            radiusUnit: "esriKilometers"
                        });
                        var mp = evt.mapPoint;
                        delete mp.type;
                        var studyAreas = {
                            areaType: "RingBuffer",
                            bufferUnits: "esriKilometers",
                            bufferRadii: [2],
                            geometry: mp
                        }
                        var sa = JSON.stringify(studyAreas);

                        map.graphics.clear();
                        for (var z = 0; z < map.graphicsLayerIds.length; z++) {
                            var layer = map.getLayer(map.graphicsLayerIds[z])
                            layer.clearSelection();
                        }
                        var enrichedSites
                        map.infoWindow.hide();
                        var graphic = new Graphic(circle, circleSymb);
                        map.graphics.add(graphic);
                        remakeAccordion();
                        var query = new Query();
                        query.geometry = circle.getExtent();
                        //use a fast bounding box query.

                        for (j = 0; j < mapLayers.length; j++) {
                            switch (mapLayers[j].summaryType) {
                                case "InfoGraphics":
                                    //no info graphics for now.
                                    break;
                                case "GeoEnrichment":
                                    var av = '[';
                                    var sf = mapLayers[j].summaryFields;
                                    for (var x = 0; x < sf.length; x++) {
                                        av += '"' + sf[x].field + '"';
                                        av += ',';
                                    }
                                    av = av.substr(0, av.length - 1);
                                    av += ']';
                                    var activeLayer = mapLayers[j];
                                    var geurl = 'http://geoenrich.arcgis.com/arcgis/rest/services/World/GeoenrichmentServer/Geoenrichment/enrich?';
                                    geurl += 'studyAreas=[' + sa + ']';
                                    geurl += '&analysisVariables=' + av;
                                    geurl += '&forStorage=false&f=json';
                                    geurl += '&token=' + token;
                                    script.get(geurl, {
                                        jsonp: "callback"
                                    }).then(function (response) {
                                        parseGEData(response, activeLayer, sf)
                                    });
                                    break;
                                default:
                                    mapLayers[j].featureLayer.queryFeatures(query, function (e) {
                                        selectInBuffer(e, mapLayers[j], circle);
                                    })
                                    break;
                            }
                        }

                    }
                });
            });

            function remakeAccordion() {
                var summaryInfo = registry.byId("leftAccordion");
                summaryInfo.destroyDescendants();

            }
            function buildGEPanel(data, panelName) {
                var summaryInfo = registry.byId("leftAccordion");
                var panelContent = "";
                for (var i = 0; i < data.length; i++) {
                    panelContent += '<h2>';
                    panelContent += data[i].varAlias;
                    panelContent += '</h2><div class="indent5">';
                    panelContent += data[i].varValue;
                    panelContent += '</div>';
                }


                var newChild = new ContentPane({
                    title: panelName,
                    content: panelContent
                });
                summaryInfo.addChild(newChild);

            }

            function populateSites(st) {
                //var siteType = registry.byId("SiteType");

                dojo.xhrPost({
                    url: "/services/BSPData.asmx/GetSites",
                    handelAs: "json",
                    contentType: "application/json",

                    postData: dojo.toJson({ "status": siteType.value }),
                    load: function (result) {
                        var site = registry.byId("Site");
                        var options = JSON.parse(result);
                        site.destroyDescendants();
                        site.removeOption(site.options);
                        site.addOption(options.d);
                        site.reset();
                    },
                    error: function (err) {
                        console.warn(err);
                    }
                });
            }
            fLayersData = [{
            }];

            function parseGEData(response, activeLayer, sf) {
                var geResults = response.results
                var geData = [];
                for (var y = 0; y < geResults.length; y++) {
                    var fSet = geResults[y].value.FeatureSet;
                    for (var z = 0; z < fSet.length; z++) {
                        for (var a1 = 0; a1 < sf.length; a1++) {
                            var arrName = sf[a1].field.split(".");
                            var varName;
                            if (arrName.length > 1) {
                                varName = arrName[1];
                            }
                            else {
                                varName = arrName[0];
                            }
                            var varAlias = fSet[z].fieldAliases[varName];
                            var fObj = fSet[z].features;
                            for (var objID = 0; objID < fObj.length; objID++) {
                                if (fObj[objID].attributes[varName] != undefined) {
                                    geData.push({
                                        varName: varName,
                                        varAlias: varAlias,
                                        varValue: fObj[objID].attributes[varName]
                                    });
                                }
                            }
                        }
                    }
                }
                buildGEPanel(geData, activeLayer.featureName)
            }
            function buildInfoGraphicPane(activeLayer) {

            }
            function selectInBuffer(response, activeLayer, circle) {
                var feature;
                var fLayer = activeLayer.featureLayer;
                var features = response.features;
                var inBuffer = [];
                //filter out features that are not actually in buffer, since we got all points in the buffer's bounding box
                for (var i = 0; i < features.length; i++) {
                    feature = features[i];
                    if (circle.contains(feature.geometry)) {
                        inBuffer.push(feature.attributes[fLayer.objectIdField]);
                    }
                }
                var summaryInfo = registry.byId("leftAccordion");
                var query = new Query();
                var i = 0;
                query.objectIds = inBuffer;
                //use a fast objectIds selection query
                fLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
                    var childContent = "stuff";
                    var featureData = iterateFeatures(results, activeLayer);
                    var childTitle = fLayer.BSPDescription + "  (" + featureData.featureCount + ")";

                    var newChild = new ContentPane({
                        title: childTitle,
                        content: featureData.content
                    });
                    summaryInfo.addChild(newChild);
                });
            }

            function iterateFeatures(features, currLayer) {
                var intTotal = 0;
                var summaryInfo = {}
                switch (currLayer.summaryType) {
                    case "Detailed":
                        summaryInfo.uncategorized = [];
                        for (var x = 0; x < features.length; x++) {
                            intTotal += 1;
                            var newData = {
                                name: features[x].attributes.NAME,
                                address: features[x].attributes.ADDRESS
                            };

                            var catName = features[x].attributes.TYPE;
                            if (catName != undefined) {
                                if (!summaryInfo.hasOwnProperty(catName)) {
                                    summaryInfo[catName] = [];
                                }
                                summaryInfo[catName].push(newData);
                            } else {
                                summaryInfo.uncategorized.push(newData);
                            }
                        }
                        break;
                    case "Analytics":
                        var fieldList = currLayer.summaryFields;
                        var analysisData = {};
                        for (var x = 0; x < features.length; x++) {
                            intTotal += 1;
                            for (var y = 0; y < fieldList.length; y++) {
                                var fieldName = fieldList[y].field;
                                var summaryType = fieldList[y].summary;
                                if (!summaryInfo.hasOwnProperty(fieldName)) {
                                    summaryInfo[fieldName] = {};
                                }
                                if (!summaryInfo[fieldName].hasOwnProperty(summaryType)) {
                                    summaryInfo[fieldName][summaryType] = {};
                                    summaryInfo[fieldName][summaryType].values = [];
                                }
                                summaryInfo[fieldName][summaryType].values.push(features[x].attributes[fieldName]);
                            }
                        }
                        break;
                    default:
                        break;
                }
                var totalSummary = {
                    content: buildContent(summaryInfo, currLayer.summaryType),
                    featureCount: intTotal,
                    data: analysisData
                };
                return totalSummary;
            }

            function buildContent(featureSummary, contentType) {

                var content = "";
                for (var key in featureSummary) {

                    var categoryName = key;

                    switch (contentType) {
                        case "Detailed":
                            if (featureSummary[key].length > 0) {
                                content += "<h2>" + categoryName + "</h2>";
                                content += "<ul>";
                                var dataArr = featureSummary[categoryName];
                                if (dataArr.length > 0) {

                                    for (i = 0; i < dataArr.length; i++) {
                                        content += "<li> <b>";
                                        content += dataArr[i].name;
                                        content += "</b><br>";
                                        content += dataArr[i].address;
                                        content += "</li>";
                                    }

                                }
                                content += "</ul>";
                            }
                            break;
                        case "Analytics":
                            content += "<h2>" + categoryName + "</h2>";

                            content += "<table style=\"width:100%\">";
                            for (var operationKey in featureSummary[categoryName]) {
                                var x = featureSummary[categoryName][operationKey].values;
                                content += "<tr><td><b>" + operationKey + ":</b></td><td style=\"text-align:right;\">";
                                switch (operationKey) {
                                    case "average":
                                        content += meanAvg(x).toFixed(2);
                                        break;
                                    case "stddev":
                                        content += deviation(x).toFixed(2);
                                        break;
                                    case "min":
                                        content += minVal(x).toFixed(2);
                                        break;
                                    case "max":
                                        content += maxVal(x).toFixed(2);
                                        break;

                                }
                                content += "</td></tr>";
                            }
                            content += "</table>";
                            break;
                    }

                }
                return content;
            }


            function meanAvg(vals) {
                var x = average(vals);
                return x.mean;
            }
            function deviation(vals) {
                var x = average(vals);
                return x.deviation;
            }
            function minVal(vals) {
                var min = null;
                for (var i = 0, len = vals.length; i < len; ++i) {
                    var elem = vals[i];
                    if (min === null || min > elem) min = elem;
                }
                return min;
            }
            function maxVal(vals) {
                var max = null;
                for (var i = 0, len = vals.length; i < len; ++i) {
                    var elem = vals[i];
                    if (max === null || max < elem) max = elem;
                }
                return max;
            }
            //put all modular layers information in here.
            function buildModularLayers() {

                var nullSymbol = new SimpleMarkerSymbol().setSize(0);

                /********************START MODULE********************/
                //Note that an info template has been defined so when 
                //selected features are clicked a popup window will appear displaying the content defined in the info template.
                var commService = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/arcgis/rest/services/CALGIS.CITY_COMMUNITY_SERVICE/FeatureServer/0?token=" + token, {
                    infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
                    outFields: ["FID", "TYPE", "NAME", "ADDRESS", "COMM_CODE"]
                });

                var symbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_CIRCLE,
                  8,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 0.7]),
                    1
                  ),
                  new Color([207, 34, 171, 0.5])
                );
                commService.setSelectionSymbol(symbol);
                commService.BSPDescription = "Community Service";
                commService.setRenderer(new SimpleRenderer(nullSymbol));

                //which ever module is first has to declare this variable.
                var featureLayers = [{
                    featureName: "Calgary Community Services",
                    featureLayer: commService,
                    summaryType: "Detailed",
                    summaryFields: [],
                    fieldMapping: {
                        name: "NAME",
                        address: "ADDRESS",
                        category: "TYPE",
                    },
                    InfoGraphicDiv: null
                }];

                /********************END MODULE********************/

                /********************START MODULE********************/
                var commAmenity = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/arcgis/rest/services/CALGIS.CITY_AMENITY/FeatureServer/0?token=" + token,
                    {
                        infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
                        outFields: ["FID", "TYPE", "NAME", "ADDRESS", "COMM_CODE"]
                    });

                var amenSymbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_DIAMOND,
                  8,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 0.7]),
                    1
                  ),
                  new Color([255, 204, 0, 0.5])
                );
                commAmenity.setSelectionSymbol(amenSymbol);

                //make unselected features invisible
                commAmenity.setRenderer(new SimpleRenderer(nullSymbol));
                commAmenity.BSPDescription = "Community Amenities"

                featureLayers.push({
                    featureName: "Calgary Community Amenities",
                    featureLayer: commAmenity,
                    summaryType: "Detailed",
                    summaryFields: [],
                    fieldMapping: {
                        name: "NAME",
                        address: "ADDRESS",
                        category: "TYPE",
                    },
                    InfoGraphicDiv: null
                });
                /********************END MODULE********************/


                /********************START MODULE********************/
                var rentalMarket = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/ArcGIS/rest/services/RentalDataCapture/FeatureServer/0?token=" + token,
                    {
                        infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
                        outFields: ["*"]
                    });
                var symbolPath = "M27.812,16l-3.062-3.062V5.625h-2.625v4.688L16,4.188L4.188,16L7,15.933v11.942h17.875V16H27.812zM16,26.167h-5.833v-7H16V26.167zM21.667,23.167h-3.833v-4.042h3.833V23.167z"
                var houseSymbol = new SimpleMarkerSymbol();
                houseSymbol.setPath(symbolPath);
                houseSymbol.setColor(new Color([255, 0, 0, 0.5]));
                houseSymbol.size = 12;
                houseSymbol.setOutline(null); //new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH,new Color([255,0,0]), 3)


                rentalMarket.setSelectionSymbol(houseSymbol);

                //make unselected features invisible
                rentalMarket.setRenderer(new SimpleRenderer(nullSymbol));
                rentalMarket.BSPDescription = "Rental Market Data Capture"

                var rmSummary = [
                    { field: "rent_amount", summary: "average" },
                    { field: "rent_amount", summary: "max" },
                    { field: "rent_amount", summary: "min" },
                    { field: "rent_amount", summary: "stddev" }
                ];

                featureLayers.push({
                    featureName: "Rental Market Data Capture",
                    featureLayer: rentalMarket,
                    summaryType: "Analytics",
                    summaryFields: rmSummary,
                    fieldMapping: {
                        name: "site_title",
                        address: "address",
                        category: "business_type",
                    },
                    InfoGraphicDiv: null
                });
                /********************END MODULE********************/


                /********************START MODULE********************/
                //Edmonton
                var edmontonService = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/ArcGIS/rest/services/Edmonton_Services/FeatureServer/0?token=" + token, {
                    infoTemplate: new InfoTemplate("Block: ${BLOCK}", "${*}"),
                    outFields: ["NAME", "Address", "TYPE"]
                });

                var symbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_CIRCLE,
                  12,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 0.7]),
                    1
                  ),
                  new Color([207, 34, 171, 0.5])
                );
                edmontonService.setSelectionSymbol(symbol);
                edmontonService.BSPDescription = "Edmonton Amenities";
                edmontonService.setRenderer(new SimpleRenderer(nullSymbol));

                //which ever module is first has to declare this variable.
                featureLayers.push({
                    featureName: "Edmonton Amenities",
                    featureLayer: edmontonService,
                    summaryType: "Detailed",
                    summaryFields: [],
                    fieldMapping: {
                        name: "NAME",
                        address: "Address",
                        category: "TYPE",
                    },
                    InfoGraphicDiv: null
                });

                /********************END MODULE********************/


                var dwellingOwnRented = [
                    { field: "KeyCanFacts.ECYTENRENT", summary: null },
                    { field: "KeyCanFacts.ECYTENOWN", summary: null },
                    { field: "THS011", summary: null },
                    { field: "THS014", summary: null },
                    { field: "THS018", summary: null },
                    { field: "A11TOTPOP", summary: null },
                    { field: "ECYTOTPOP", summary: null },
                    { field: "P5YTOTPOP", summary: null },
                    { field: "ECYTENOWN", summary: null },
                    { field: "ECYTENRENT", summary: null },
                    { field: "THSNINCAGG", summary: null },
                    { field: "THSNEXPAVG", summary: null },
                    { field: "THSEIRATIO", summary: null },
                    { field: "EHYTENOWN", summary: null },
                    { field: "EHYTENRENT", summary: null },
                    { field: "P5YTENOWN", summary: null },
                    { field: "P5YTENRENT", summary: null }
                ];
                featureLayers.push({
                    featureName: "Dwellings Own/Rented",
                    featureLayer: null,
                    summaryType: "GeoEnrichment",
                    summaryFields: dwellingOwnRented,
                    fieldMapping: null,
                    InfoGraphicDiv: null
                });
                return featureLayers;
            }
        });

        //+ Carlos R. L. Rodrigues
        //@ http://jsfromhell.com/array/average [rev. #1]

        average = function (a) {
            var r = { mean: 0, variance: 0, deviation: 0 }, t = a.length;
            for (var m, s = 0, l = t; l--; s += a[l]);
            for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
            return r.deviation = Math.sqrt(r.variance = s / t), r;
        }
    </script>
</head>

<body class="tundra">

    <div data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="gutters:true, liveSplitters:true" id="borderContainerTwo">
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'top', splitter:false">
            <img src="images/BSP_HighRes-Print-33.jpg" style="float: left" />

            <img src="images/SPD_HighRes-Print-33.jpg" style="float: right" />
            <div class="pageHeader">
                <img src="images/360ResearchTool.png" />
            </div>

        </div>
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'left',splitter:true">

            <div data-dojo-type="dijit/layout/AccordionContainer" data-dojo-props="minSize:20" style="width: 400px;" id="leftAccordion">
                <div data-dojo-type="dijit/layout/AccordionPane" title="Welcome to the Tool">
                    <p>Using this tools is as simple as clicking on the map and then exploring the information returned.</p>
                    <p>This tool is updated regularly so check back for new content</p>
                    <p>
                        if you have any problems with it please contact <a href="mailto:devhelpdesk@broadstreet.ca">devhelpdesk@broadstreet.ca</a> with a detialed description of your problem
                    
                    </p>
                </div>
            </div>
            <!-- end AccordionContainer -->
        </div>
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'center', splitter:false" style="padding: 0px;">
            <div class="maptoolBar" style="border-radius: 8px; position: absolute; z-index: 199; top: 7px; width: auto; left: 7px;">
                <div style="display: none">
                    City:
                <select></select>
                    Buffer Type: 
                    <input type="radio" name="bufferType" id="radioOne" checked value="Radius" />
                    <label for="radioOne">Radius</label>
                    <input type="radio" name="bufferType" id="radioTwo" value="DriveTime" />
                    <label for="radioTwo">Drive Time</label>
                </div>
                Map Mode:
                <button id="panButtonNode" type="button" style="color: black"></button>

                Site Type:
                <select id="SiteType" data-dojo-type="dijit/form/Select" style="width: 200px;">
                    <option value="O">Current</option>
                    <option value="C">Project</option>
                    <option value="P">Future</option>
                </select>

                Site Name:
                <select id="Site" data-dojo-type="dijit/form/Select" style="width: 250px;">
                    <option value="Laurel Meadows">Laurel Meadows
                    </option>
                    <option value="West Haven Terrace">West Haven Terrace
                    </option>
                </select>
                <button id="JumpToSite" type="button" style="color: black">Load Site</button>
            </div>
            <div id="mapDiv" style="height: 100%;"></div>
            <div id="legend" style="position: absolute; z-index: 99; border-width: 1px; border-style: solid; border-color: black; right: 5px; top: 35px; width: 150px; height: 100px; background-color: white; border-radius: 5px;">
                <div style="background-color: #AED0D8; text-align: center; color: black; padding-top: 5px; padding-bottom: 5px; border-bottom: 1px solid black">Legend</div>
                <table>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </table>
            </div>
        </div>

    </div>
    <!-- end BorderContainer -->


</body>
</html>
