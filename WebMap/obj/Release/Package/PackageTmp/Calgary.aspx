<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="Calgary.aspx.vb" Inherits="WebMap.Calgary" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>SPD Map Test</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <link rel="stylesheet" href="/dijit/themes/claro/claro.css" />
    <link rel="stylesheet" href="/dijit/themes/claro/form/slider.css" />
    <link rel="stylesheet" type="text/css" href="http://js.arcgis.com/3.9/js/esri/css/esri.css" />

    <style>
        #mapDiv, .map.container {
            padding: 0;
            margin: 0;
            height: 500px;
            width: 889px;
            border-color:black;
            border-width:2px;
            border-style:solid;
        }
        #legendDiv {
            background-color: #fff;
            position: absolute !important;
            z-index: 99;
            top: 0px;
            left: 920px;
            width: 400px;
        }

    </style>

    <script>//var dojoConfig = { parseOnLoad: true };</script>
    <script src="http://js.arcgis.com/3.9compact/"></script>

<script>

    var map;
    var currPoint;
        require(["esri/map",
            "esri/arcgis/utils",
            "esri/dijit/Legend",
            "esri/graphic",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/renderers/SimpleRenderer",
            "esri/symbols/SimpleFillSymbol",
            "esri/Color",
            "esri/layers/FeatureLayer",
            "esri/geometry/Circle",
            "esri/layers/OpenStreetMapLayer",
            "esri/request",
            "esri/tasks/GeometryService",
            "dojo/dom",
            "dojo/parser",
            "dojo/promise/all",
            "dojo/_base/array",
            "dijit/form/HorizontalSlider",
            "dijit/form/HorizontalRule",
            "dijit/form/HorizontalRuleLabels",
            "dijit/form/TextBox", // this we only include to make an example with TextBox
            "dojo/dom-construct",
            "dojo/on",
            "esri/config",
            "dojo/domReady!"], function (Map, arcgisUtils, Legend, Graphic, SimpleLineSymbol, SimpleMarkerSymbol, SimleRenderer,
                                         SimpleFillSymbol, Color, FeatureLayer, Circle, OpenStreetMapLayer, esriRequest, GeometryService,
                                         dom, parser, all,array, HorizontalSlider, HorizontalRule,
                                         HorizontalRuleLabels, TextBox, domConstruct, on, esriConfig) {
                var geometryService,baseGraphics;
                //esriConfig.defaults.io.corsEnabledServers.push("services3.arcgis.com");
                //esriConfig.defaults.io.proxyUrl = "/proxy";
                //esriConfig.defaults.io.alwaysUseProxy = false;
                map = new esri.Map("mapDiv", {
                    center: [-114.0288, 51.0669],
                    zoom: 10
                });

                var osmLayer = new OpenStreetMapLayer({
                    id:"osmLayer",
                    visible:true
                });

                geometryService = new GeometryService("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");

                var legend = new Legend({
                    map: map,
                    layerInfos: (arcgisUtils.getLegendLayers(map))
                }, "legendDiv");

                legend.startup();
                parser.parse();
                var rulesNode = domConstruct.create("div", {}, dom.byId("slider"), "first");
                var sliderRules = new HorizontalRule({
                    container: "topDecoration",
                    count: 6,
                    style: "width: 5px;"
                }, rulesNode);

                // Create the labels
                var labelsNode = domConstruct.create("div", {}, dom.byId("slider"), "first");
                var sliderLabels = new HorizontalRuleLabels({
                    container: "topDecoration",
                    labelStyle: "font-style: italic; font-size: 0.75em",
                    count: 6,
                    labels: [5, 10, 15, 20, 25, 30]
                }, labelsNode);

                var slider = new HorizontalSlider({
                    name: "slider",
                    value: 5,
                    minimum: 5,
                    maximum: 30,
                    intermediateChanges: true,
                    discreteValues: 6,

                    style: "width:300px;",
                    onChange: function (value) {
                        dom.byId("sliderValue").value = value;
                        buildMap();
                    }
                }, "slider");



                
                var drpSite = dijit.byId("drpSite");
                on(drpSite, "change", function (e) {
                    buildMap();
                });
                //alert(value);
                var sites = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/ArcGIS/rest/services/CalgarySites/FeatureServer/0", {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "CalgarySites",
                    name: "Calgary Sites",
                    outFields: ["*"]
                });
                var dt = new FeatureLayer("http://services.arcgis.com/sG0VAg8cwgcmMUkE/ArcGIS/rest/services/CalgarySites%20Drive%20Time%20Final/FeatureServer/0", {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "DriveTime",
                    name: "Drive Times",
                });

                var siteValue = dijit.byId('drpSite').attr('value');
                sites.setDefinitionExpression("NICKNAME='" + siteValue + "'");
                map.addLayer(osmLayer);
                map.addLayer(dt);
                map.addLayer(sites);
                sites.on("update-end", function (evt) {
                    currPoint = new Graphic(evt.target.graphics[0].toJson());
                    var selectedSite = dom.byId('drpSite').value;
                    dt.setDefinitionExpression("NICKNAME='" + selectedSite + "' and ToBreak=" + sliderValue.value);
                });

                dt.on("update-end", function (evt) {
                    var promises = new all({
                        poilist : executeLocalSearch(currPoint)
                    }).then(updateGIS);
                });

                sliderRules.startup();
                sliderLabels.startup();

                function buildMap() {
                    var selectedSite = dom.byId('drpSite').value;
                    sites.setDefinitionExpression("NICKNAME='" + selectedSite + "'");
                }

                function updateGIS(results) {
                    var pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 6, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 1),
                        new Color([255, 0, 0]));
                    var searchResults = results.poilist.locations;
                    var node = dom.byId("dbg");
                    node.innerHTML = "<ol id=\"poilist\"></ol>";
                    baseGraphics = array.map(searchResults, function (r) {
                        var listnode = dom.byId("poilist");
                        var graphic = new Graphic(r.feature);
                        listnode.innerHTML += "<li>" + r.name + "</li>";
                        graphic.setSymbol(pointSymbol);
                        return map.graphics.add(graphic);
                    });

                    
                }
                function relateGeometries(results) {
                    var node = dom.byId("dbg");
                    node.innerHTML = 'results.sites : ' + results.toJson();
                }
                function executeLocalSearch(graphic) {
                    var params = {
                        text: "pizza",
                        location: JSON.stringify(graphic.geometry.toJson()),
                        bbox: JSON.stringify(map.extent.toJson()),
                        maxLocations: 100,
                        f: "json"
                    };

                    return esriRequest({
                        url: "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find",
                        content: params,
                        callbackParamName: "callback"
                    })
                }
            });

    </script>
</head>
<body class="claro">
    <form id="form1" runat="server">
    <div id="mapDiv"></div>
    <div id="legendDiv"></div>
    <div>
        <asp:DropDownList ID="drpSite" runat="server" ></asp:DropDownList>
    </div>
        Minutes
    <div>
        <div id="slider"></div>
<p><input type="text" value="5" id="sliderValue" data-dojo-type="dijit/form/TextBox" /></p>
    </div>
    <div id="dbg"></div>
    </form>
</body>
</html>
