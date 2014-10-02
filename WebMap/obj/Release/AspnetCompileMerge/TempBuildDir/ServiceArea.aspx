﻿<%@ Page Language="vb" AutoEventWireup="false" CodeBehind="ServiceArea.aspx.vb" Inherits="WebMap.ServiceArea" %>

<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--The viewport meta tag is used to improve the presentation and behavior of the samples 
      on iOS devices-->
    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">

    <title>Service Area Task</title>
    <link rel="stylesheet" href="http://js.arcgis.com/3.9/js/esri/css/esri.css">
    <style>
      html, body, #mapDiv {
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
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
    </style>

    <script src="http://js.arcgis.com/3.9/"></script>
    <script>
    require(["esri/Color",
      "esri/map",
      "esri/graphic",
      "esri/graphicsUtils",
      "esri/tasks/Geoprocessor",
      "esri/tasks/FeatureSet",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol"],
    function(Color, Map, Graphic, graphicsUtils, Geoprocessor, FeatureSet, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol){


      var map, gp;
      var driveTimes = "1 2 3";

      // Initialize map, GP and image params
        map = new Map("mapDiv", { 
          basemap: "streets",
          center: [-114.0288, 51.0669],
          zoom: 12
        });

        gp = new Geoprocessor("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons");
        gp.setOutputSpatialReference({wkid:102100});
        map.on("click", computeServiceArea);

      function computeServiceArea(evt) {
        map.graphics.clear();
        var pointSymbol = new SimpleMarkerSymbol();
        pointSymbol.setOutline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1);
        pointSymbol.setSize(14);
        pointSymbol.setColor(new Color([0, 255, 0, 0.25]));

        var graphic = new Graphic(evt.mapPoint,pointSymbol);
        map.graphics.add(graphic);

        var features= [];
        features.push(graphic);
        var featureSet = new FeatureSet();
        featureSet.features = features;
        var params = { "Input_Location":featureSet, "Drive_Times":driveTimes };
        gp.execute(params, getDriveTimePolys);
      }

      function getDriveTimePolys(results, messages) {
        var features = results[0].value.features;
        // add drive time polygons to the map
        for (var f=0, fl=features.length; f<fl; f++) {
          var feature = features[f];
          if(f === 0) {
            var polySymbolRed = new SimpleFillSymbol();
            polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0,0.5]), 1));
            polySymbolRed.setColor(new Color([255,0,0,0.7]));
            feature.setSymbol(polySymbolRed);
            }
          else if(f == 1) {
            var polySymbolGreen = new SimpleFillSymbol();
            polySymbolGreen.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0,0.5]), 1));
            polySymbolGreen.setColor(new Color([0,255,0,0.7]));
            feature.setSymbol(polySymbolGreen);
            }
          else if(f == 2) {
            var polySymbolBlue = new SimpleFillSymbol();
            polySymbolBlue.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0,0.5]), 1));
            polySymbolBlue.setColor(new Color([0,0,255,0.7]));
            feature.setSymbol(polySymbolBlue);
          }
          map.graphics.add(feature);
        }
        // get the extent for the drive time polygon graphics and
        // zoom to the extent of the drive time polygons
        map.setExtent(graphicsUtils.graphicsExtent(map.graphics.graphics), true);
      }
    });
    </script>

  </head>
  <body>
    <div id="mapDiv"></div>
    <div id="info" class="esriSimpleSlider">
      Click the map to use a Geoprocessing(GP) task to generate and zoom to drive time polygons. The drive time polygons are 1, 2, and 3 minutes.
    </div>
  </body>
</html>
 