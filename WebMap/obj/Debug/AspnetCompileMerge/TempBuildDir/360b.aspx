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
   <link rel="stylesheet" href="/styles/BSP.css">
    <script src="http://js.arcgis.com/3.9/"></script>
    <script>
        require([
          "dojo/parser", "dijit/layout/ContentPane", "dijit/layout/BorderContainer",
          "dijit/layout/AccordionContainer", "dijit/layout/AccordionPane", "dijit/registry",
          "esri/map", "esri/arcgis/utils", "esri/config", "esri/urlUtils", "esri/tasks/query",
          "esri/layers/FeatureLayer", "esri/symbols/SimpleMarkerSymbol", "esri/renderers/SimpleRenderer", "esri/Color",
		  "dojox/charting/Chart", "dojox/charting/themes/PrimaryColors", "dojox/charting/plot2d/StackedAreas",
          "dojox/charting/axis2d/Default",
          "dijit/form/Button", "dijit/form/Select",
          "dojo/domReady!"
        ], function (
          parser, ContentPane, BorderContainer,
          AccordionContainer, AccordionPane, registry,
          Map, arcgisUtils, esriConfig, urlUtils, Query,
          FeatureLayer, SimpleMarkerSymbol, SimpleRenderer,Color,
          Chart, theme, StackedAreas,
          Default,
          Button,Select
        ) {
            parser.parse();
            var siteType = registry.byId("SiteType");
            siteType.on("change",function (e) {
                    populateSites(siteType);
                });

            populateSites("C");
            urlUtils.addProxyRule({
                urlPrefix: "www.arcgis.com",
                proxyUrl: "/proxy/proxy.ashx"
            });
            urlUtils.addProxyRule({
                urlPrefix: "http://geoenrich.arcgis.com/",
                proxyUrl: "/proxy/proxy.ashx"
            });
            urlUtils.addProxyRule({
                urlPrefix: "http://services.arcgis.com",
                proxyUrl: "/proxy/proxy.ashx"
            });
            var chart = new Chart("chartNode");
            chart.setTheme(theme);
            var chartRent = [40, 35, 30];
            var chartOwn = [60, 65, 70];
            chart.addPlot("default", {
                type: StackedAreas,
                lines: true,
                areas: true,
                markers: true
            });
            chart.addAxis("x", {
                fixLower: "minor",
                fixUpper: "minor",
                labels: [{ value: 1, text: "2008" },
                    { value: 2, text: "2013" },
                    { value: 3, text: "2018" }
                ]
            });
            
            chart.addAxis("y", {
                vertical: true,
                fixLower: "minor",
                min:0

            });
            
            chart.addSeries("Rent", chartRent);
            chart.addSeries("Own", chartOwn);
            chart.render();

            arcgisUtils.createMap("753dcfe7d5ee4984a281da14cef54366", "mapDiv").then(function (response) {
                var map = response.map;
                console.log(map);

                map.on("click", function (evt) {
                   // alert(evt);
                })
                var fLayer = map.getLayer(map.graphicsLayerIds[0]);
                //var fLayer = response.itemInfo.itemData.operationalLayers[0]
                var j = 0;

                var nullSymbol = new SimpleMarkerSymbol().setSize(0);
                //fLayer.setRenderer(new SimpleRenderer(nullSymbol));
                fLayer.setVisibility(true);

                var symbolPath = "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M14.757,8h2.42v2.574h-2.42V8z M18.762,23.622H16.1c-1.034,0-1.475-0.44-1.475-1.496v-6.865c0-0.33-0.176-0.484-0.484-0.484h-0.88V12.4h2.662c1.035,0,1.474,0.462,1.474,1.496v6.887c0,0.309,0.176,0.484,0.484,0.484h0.88V23.622z"
                var siteSymbol = new SimpleMarkerSymbol();
                siteSymbol.setPath(symbolPath);
                siteSymbol.setColor(new Color([23, 62, 139, 1]));
                siteSymbol.size = 25;
                siteSymbol.setOutline(null);
                fLayer.setSelectionSymbol(siteSymbol);

                var objId = [504, 100, 1325, 728];
                var q = new Query();
                q.objectIds = objId;

                fLayer.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {
                    var bob = 0;
                });

                //response.itemInfo.itemData.operationalLayers[0].selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {

                //});



            });
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
        });
    </script>
</head>

<body class="tundra">

    <div data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="gutters:true, liveSplitters:true" id="mainContent">
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'top', splitter:false">
            <img src="images/BSP_HighRes-Print-33.jpg" style="float: left" />

            <img src="images/SPD_HighRes-Print-33.jpg" style="float: right" />
            <div class="pageHeader">
                <img src="images/360ResearchTool.png" />
            </div>

        </div>
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'left',splitter:true" style="width:350px;">
            <div id="chartNode"></div>
        </div>
        <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'center', splitter:false" style="padding: 0px;">
            <div id="mapToolBar"> Site Type:
                <select id="SiteType" data-dojo-type="dijit/form/Select" style="width: 150px;color:black">
                    <option value="O">Current</option>
                    <option value="C">Project</option>
                    <option value="P">Future</option>
                </select>

                Site Name:
                <select id="Site" data-dojo-type="dijit/form/Select" style="width: 250px;color:black">
                <option value="Laurel Meadows">Laurel Meadows
                    </option>
                    <option value="West Haven Terrace">West Haven Terrace
                    </option>
                </select>
                <button id="JumpToSite" type="button" style="color: black">Load Site</button>

            </div>
            <div id="mapDiv">

            </div>
        </div>

    </div>
    <!-- end BorderContainer -->


</body>
</html>
