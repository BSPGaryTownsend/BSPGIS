﻿<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="SPD.aspx.vb" Inherits="WebMap.SPD" %>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--The viewport meta tag is used to improve the presentation and behavior of the samples 
      on iOS devices-->
    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
    <title>Geometry Service: Relation</title>

    <link rel="stylesheet" href="http://js.arcgis.com/3.9/js/esri/css/esri.css">

    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            width: 100%;
        }
         #mapDiv{
             height:450px;
             width:800px;
         }
        #info {
            bottom: 20px;
            color: #444;
            height: auto;
            font-family: arial;
            left: 20px;
            margin: 5px;
            padding: 10px;
            position: absolute;
            text-align: left;
            width: 200px;
            z-index: 40;
        }

        .label {
            display: inline-block;
            width: 4em;
        }
    </style>

    <script src="http://js.arcgis.com/3.9/"></script>
    <script>
        var map;

        require([
          "dojo/dom", "dojo/_base/array", "dojo/promise/all", "dojo/json",

          "esri/map", "esri/domUtils", "esri/graphic", "esri/graphicsUtils",
          "esri/geometry/Point", "esri/tasks/GeometryService", "esri/tasks/Geoprocessor",
          "esri/tasks/FeatureSet", "esri/tasks/RelationParameters",
          "esri/Color", "esri/symbols/SimpleLineSymbol",
          "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol",
          "esri/config", "esri/request", "esri/layers/OpenStreetMapLayer", "dojo/domReady!"
        ], function (
          dom, array, all, JSON,

          Map, domUtils, Graphic, graphicsUtils,
          Point, GeometryService, Geoprocessor,
          FeatureSet, RelationParameters,
          Color, SimpleLineSymbol,
          SimpleMarkerSymbol, SimpleFillSymbol,
          esriConfig, esriRequest, OpenStreetMapLayer
        ) {

            var geoprocessor, geometryService, geometries, baseGraphics;

            map = new esri.Map("mapDiv", {
                center: [-114.0288, 51.0669],
                zoom: 13
            });
            map.on("click", mapClicked);
            var osmLayer = new OpenStreetMapLayer({
                id: "osmLayer",
                visible: true
            });

            map.addLayer(osmLayer);
            geometryService = new GeometryService("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");
            geoprocessor = new Geoprocessor("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons");
            geoprocessor.setOutSpatialReference({
                wkid: 4326
            });

            esriConfig.defaults.io.corsEnabledServers.push("sampleserver6.arcgisonline.com");

            function mapClicked(evt) {
                geometries = [];
                map.graphics.clear();

                // add a simple marker graphic at the location where the user clicked on the map.
                var pointSymbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_CROSS, 22,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 128, 0]), 4));

                var clickPointGraphic = new Graphic(evt.mapPoint, pointSymbol);
                map.graphics.add(clickPointGraphic);

                // use promise/all to monitor when place search and drive time calculation finish
                var promises = new all({
                    poiSearch: executeLocalSearch(clickPointGraphic),
                    driveTimes: getDriveTimePolygon(clickPointGraphic)
                }).then(relateGeometries);
            }

            function executeLocalSearch(graphic) {
                // find (up to) 20 pizza restaurants within a the map's current extent
                var params = {
                    text: "Schools",
                    location: JSON.stringify(graphic.geometry.toJson()),
                    bbox: JSON.stringify(map.extent.toJson()),
                    maxLocations: 20,
                    f: "json"
                };

                return esriRequest({
                    url: "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find",
                    content: params,
                    callbackParamName: "callback"
                });
            }

            function showLocations(response) {
                // create a symbol (Red Square) for pizza restaurants
                var pointSymbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_SQUARE, 6,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 1),
                  new Color([255, 0, 0]));

                // add the pizza restaurants to the map
                var results = response.locations;
                baseGraphics = array.map(results, function (r) {
                    var graphic = new Graphic(r.feature);
                    graphic.setSymbol(pointSymbol);
                    return map.graphics.add(graphic);
                });
            }

            function getDriveTimePolygon(graphic) {
                // the graphic representing the selected location is passed onto the GP Task
                var featureSet = new FeatureSet();
                featureSet.features = [graphic];

                var params = {
                    "Input_Location": featureSet,
                    "Drive_Times": 10
                };
                return geoprocessor.execute(params);
            }

            function showDriveTime(results, messages) {
                var feature = results[0].value.features[0];

                // add the drive time polygon to the map
                var polySymbolRed = new SimpleFillSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 1]), 1),
                  new Color([255, 0, 0, 0.2]));
                feature.setSymbol(polySymbolRed);
                map.graphics.add(feature);
            }

            function relateGeometries(results) {
                // check that both requests completed successfully
                if (!results.poiSearch || !results.driveTimes) {
                    alert("Unable to compute point in polygon.");
                }
                showDriveTime(results.driveTimes);
                showLocations(results.poiSearch);
                console.log("baseGraphics", baseGraphics);
                var relationParams = new RelationParameters();
                relationParams.geometries1 = graphicsUtils.getGeometries(baseGraphics);
                relationParams.geometries2 = graphicsUtils.getGeometries(results.driveTimes[0].value.features);
                relationParams.relation = RelationParameters.SPATIAL_REL_WITHIN;

                geometryService.relation(relationParams).then(addRelateResultsToMap);
                // alternatively, could use polygon.contains instead of using the geometry service
            }

            function addRelateResultsToMap(relations) {
                console.log("add relate results", relations);
                // create a Green Square symbol
                var symbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_SQUARE, 8,
                  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0]), 1),
                  new Color([0, 255, 0]));
                // highlight the pizza places that satisfy the spatial relation (WITHIN) against the 3-minute drive time polygon
                array.forEach(relations, function (relation) {
                    baseGraphics[relation.geometry1Index].setSymbol(symbol).getDojoShape().moveToFront();
                });
            }
        });
    </script>

</head>

<body class="claro">
    <div id="mapDiv"></div>
    <div><input type="text" id=""</div>
</body>
</html>

