define([
    "dojo/ready",
    "dojo/_base/Color",
    "dojo/_base/declare",
    "dojo/_base/fx",
    "dojo/_base/html",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/number",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/on",
    "dojo/query",
    "dojo/window",
    "dijit/form/Select",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/UniqueValueRenderer",
    "esri/InfoTemplate",
    "esri/tasks/query",
    "esri/symbols/TextSymbol",
    "esri/layers/LabelLayer",
    "esri/dijit/Geocoder",
    "dojox/charting/Chart",
    "dojox/layout/TableContainer",
    "dojox/charting/themes/PrimaryColors",
    "dojox/charting/widget/Legend",
    "dojox/charting/plot2d/StackedAreas",
    "dojox/charting/axis2d/Default"
],
    function (ready,
    Color,
    declare,
    fx,
    html,
    lang,
    array,
    localenumber,
    dom,
    domClass,
    domConstruct,
    domGeometry,
    domStyle,
    on,
    query,
    win,
    Select,
    TabContainer,
    ContentPane,
    Point,
    SpatialReference,
    FeatureLayer,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    SimpleRenderer,
    UniqueValueRenderer,
    InfoTemplate,
    Query,
    TextSymbol,
    LabelLayer,
    Geocoder,
    Chart,
    TableContainer,
    Theme,
    Legend,
    StackedAreas
    ) {
        return declare(null, {
            config: {},
            ui:null,

            constructor: function (config) {
                this.config = config;
            },

            watermelon: function () {
                return new Point([53.447895, -113.389099], new SpatialReference({ wkid: 4326 }));
            },

            startup: function () {

                var navTable = new TableContainer({
                        cols: 1,
                        customClass: "navTable",
                        "labelWidth": "100"
                }, dom.byId("navControls"));

                var statusList = new Select({
                    name: "SiteStatus",
                    style: "width:250px;color:black;font-family:Open Sans",
                    label:"Status"

                }, "statusNode");
                
                navTable.addChild(statusList);

                var siteList = new Select({
                    name: "SiteList",
                    style: "width:250px;color:black;font-family:Open Sans",
                    label: "Site"
                }, "siteNode");

                navTable.addChild(siteList);

                navTable.startup();
                var siteLayer = new FeatureLayer(this.config.sitesURL, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    infoTemplate: new InfoTemplate("<div class=\"bspPopupHeader\"> ${GroupName}</div>", this.siteTemplate),
                    outFields: "*"
                });
                
                var symAOP = new PictureMarkerSymbol("/images/siteicons/BSP_APPT_OP.png", 54, 35);
                var symARU = new PictureMarkerSymbol("/images/siteicons/BSP_APPT_RU.png", 54, 35);
                var symAUC = new PictureMarkerSymbol("/images/siteicons/SPD_APPT_UC.png", 54, 35);
                var symAPR = new PictureMarkerSymbol("/images/siteicons/SPD_APPT_PR.png", 54, 35);

                var symTOP = new PictureMarkerSymbol("/images/siteicons/BSP_TOWN_OP.png", 54, 35);
                var symTRU = new PictureMarkerSymbol("/images/siteicons/BSP_TOWN_RU.png", 54, 35);
                var symTUC = new PictureMarkerSymbol("/images/siteicons/SPD_TOWN_UC.png", 54, 35);
                var symTPR = new PictureMarkerSymbol("/images/siteicons/SPD_TOWN_PR.png", 54, 35);

                var symUK = new PictureMarkerSymbol("/images/siteicons/NEW_UNKNOWN.png", 54, 35);
                
                var siteRend = new UniqueValueRenderer(symUK, "Type", "SiteStatus", null, ":");
                siteRend.addValue("Low Rise Apt:Operating", symAOP);
                siteRend.addValue("Low Rise Apt:Rent-up", symARU);
                siteRend.addValue("Low Rise Apt:In Construction", symAUC);
                siteRend.addValue("Low Rise Apt:Upcoming", symAPR);

                siteRend.addValue("Townhouse:Operating", symTOP);
                siteRend.addValue("Townhouse:Rent-up", symTRU);
                siteRend.addValue("Townhouse:In Construction", symTUC);
                siteRend.addValue("Townhouse:Upcoming", symTPR);


                
                siteLayer.setRenderer(siteRend);


                var sitesLabel = new TextSymbol().setColor(new Color([0, 0, 0, 0.75]));
                sitesLabel.font.setFamily("Open Sans");
                sitesLabel.font.setSize("12pt");
                sitesLabel.font.setWeight("bold");
                var sitesLabelRenderer = new SimpleRenderer(sitesLabel);

                var labels = new LabelLayer({ id: "labels" });
                

                on(statusList, "change", lang.hitch(this,this._loadSites, siteList, statusList, siteLayer));
                on(siteList, "change", lang.hitch(this, this.moveToSite));
                on(siteLayer, "load",lang.hitch(this, this._loadStatus, siteList, statusList, siteLayer));
                on(siteLayer, "click", lang.hitch(this,this._showSite, this.ui, siteLayer));
                this.map.addLayer(siteLayer);
                labels.addFeatureLayer(siteLayer, sitesLabelRenderer, "{GroupName}");
                this.map.addLayer(labels);
               // this.createJumpButton();
            },
            _showSite: function (ui,siteLayer, evt) {
                this.ui.showPin = false;
                this.map.infoWindow.hide();
                var query = new Query();
                query.objectIds = [evt.graphic.attributes.FID];
                siteLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, lang.hitch(this,function (result) {
                    //console.log('feature selected');
                    this.ui.map.infoWindow.setFeatures([result[0]]);
                    this.ui.map.infoWindow.show();
                    
                })
                
                );
                //console.log('MOOOOOOOOOOOOOOOOO');
            },
            siteTemplate: function (graphic) {
                var data = graphic.attributes;
                var summary = '<div style=\"height:auto;overflow:hidden;\"><img src ="http://companyweb.seymourpacific.ca/interface_seymour/images/scorecard_site_photos/' + data.GLCode + '-i.jpg" style="width:190px;height:auto;float:left;">';
                summary += '<img src ="http://companyweb.seymourpacific.ca/interface_seymour/images/scorecard_site_photos/' + data.GLCode + '-e.jpg" style="width:190px;height:auto;float:right;"></div>';
                summary += "<div style=\"font-family:Open Sans;font-size:12pt\">";
                summary += "<hr/><div style=\"text-align:center\">";
                summary += data.address + " ";
                summary += data.city + ", ";
                summary += data.Province + "<BR>";
                summary += data.PostalCode + "<BR>";
                summary += "</div><hr/>";
                summary += "<strong>ViewPoint GL Code: </strong> " + data.GLCode + "<BR>";
                summary += "<strong>Number of Units: </strong> " + data.NumberOfUnits + "<BR>";
                summary += "<strong>Type: </strong> " + data.Type + "<BR>";
                summary += "<strong>Status: </strong> " + data.SiteStatus + "<BR>";
                summary += "</div>";

                var tc = new TabContainer({
                    style: "height:450px;width:100%;overflow:hidden"
                }, domConstruct.create("div"));

                var cp1 = new ContentPane({
                    title: "Summary",
                    content: summary
                });
                tc.addChild(cp1);
                var chartNode = domConstruct.create("div");
                var popData = [];

                var population = [{ year: 2008, popVar: 'EHYTOTPOP' },
                    { year: 2011, popVar: 'A11TOTPOP' },
                    { year: 2013, popVar: 'THSTOTPOP' },
                    { year: 2016, popVar: 'P3YTOTPOP' },
                    { year: 2018, popVar: 'P5YTOTPOP' },
                    { year: 2023, popVar: 'P0YTOTPOP' }
                ];
                var popLabels = [];

                var popTable = '<table class="popGrid">';

                var popTabHead = '<tr>';
                var popTabBody = '<tr class="popRow">';

                for (var p = 0; p < population.length; p++) {
                    popData.push(data[population[p].popVar]);
                    popLabels.push({ value: p + 1, text: population[p].year.toString() });
                    popTabHead += '<th>' + population[p].year.toString() + '</th>';
                    popTabBody += '<td>' + localenumber.format(data[population[p].popVar]) + '</th>';
                }

                popTabHead += '</tr>';
                popTabBody += '</tr>';
                popTable += popTabHead + popTabBody + '</table>';

                var popGraph = new Chart(chartNode);
                popGraph.setTheme(Theme);
                popGraph.addPlot("default", {
                    type:"StackedAreas",
                    markers: true,
                    tension: "S"
                });

                popGraph.addAxis("x", {
                    fixLower: "major",
                    fixUpper: "major",
                    labels:popLabels
                });


                popGraph.addAxis("y", {
                    vertical: true,
                    fixLower: "major"

                });
                popGraph.addSeries("Total Population", popData);
                popGraph.render();

                var popContent = chartNode.innerHTML;
                popContent += popTable;

                var cp2 = new ContentPane({
                    title: "Area Population",
                    content: popContent
                });
                tc.addChild(cp2);


                var ownRent = [
                    { year: 2008, ownVar: "EHYTENOWN", rentVar: "EHYTENRENT" },
                    { year: 2013, ownVar: "ECYTENOWN", rentVar: "ECYTENRENT" },
                    { year: 2016, ownVar: "P3YTENOWN", rentVar: "P3YTENRENT" },
                    { year: 2018, ownVar: "P5YTENOWN", rentVar: "P5YTENRENT" },
                    { year: 2023, ownVar: "P0YTENOWN", rentVar: "P0YTENRENT" }
                ];
                var rentData = [];
                var ownData = [];
                var chartLabels = [];

                var legTab = '';
                legTab = '<table class="popGrid"><thead>';
                legTab += '<tr><th>&nbsp;</th>';
                for (var j = 0; j < ownRent.length; j++) {
                    legTab += '<th>';
                    legTab += ownRent[j].year;
                    legTab+='</th>'
                }
                legTab += '</tr></thead>';
                var rentRow = '<tr class="rentRow"><td class="rowHead">Rented Dwellings</td>';
                var ownRow = '<tr class="ownRow"><td class="rowHead">Owned Dwellings</td>';
                var rentPercRow = '<tr class="rentRow"><td class="rowHead">Rented %</td>';
                var ownPercRow = '<tr class="ownRow"><td class="rowHead">Owned %</td>';
                for (var i = 0; i < ownRent.length; i++) {

                    var rent = data[ownRent[i].rentVar];
                    var own = data[ownRent[i].ownVar];
                    chartLabels.push({ value: i + 1, text: ownRent[i].year.toString() });
                    rentRow += '<td>' + rent.toString() + '</td>';
                    ownRow += '<td>' + own.toString() + '</td>';

                    var total = rent + own;
                    var rentPerc = (rent / total)*100;
                    var ownPerc = 100 - rentPerc;
                    rentPercRow += '<td>' + rentPerc.toFixed(2) + '%</td>';
                    ownPercRow += '<td>' + ownPerc.toFixed(2) + '%</td>';
                    rentData.push(rentPerc);
                    ownData.push(ownPerc);

                }
                rentRow += '</tr>';
                ownRow += '</tr>';
                rentPercRow += '</tr>';
                ownPercRow += '</tr>';
                legTab += rentRow;
                legTab += ownRow;
                legTab += rentPercRow;
                legTab += ownPercRow;
                legTab += '</table>';

                var orNode = domConstruct.create("div")
                var ownRentGraph = new Chart(orNode);
                ownRentGraph.setTheme(Theme);
                ownRentGraph.addPlot("default", {
                    type: "StackedAreas",
                    markers: true,
                    tension: "S"
                });

                ownRentGraph.addAxis("x", {
                    fixLower: "major",
                    fixUpper: "major",
                    labels: chartLabels
                });
                ownRentGraph.addAxis("y", {
                    vertical: true,
                    fixLower: "major",
                    includeZero: true

                });
                ownRentGraph.addSeries("Rented", rentData);
                ownRentGraph.addSeries("Owned", ownData);

                ownRentGraph.render();

                    
                var legendNode = domConstruct.create("div");
                var ownLeg = new Legend({ chart: ownRentGraph }, legendNode);
                ownLeg.startup();

                var a = orNode.innerHTML;
                a += legTab;
                var cp3 = new ContentPane({
                    title: "Own/Rent",
                    content:a
                })
                tc.addChild(cp3);
                //retVal += tc.toString();
                return tc.domNode;

            }
            ,
            _loadStatus: function (siteList, statusList, siteLayer) {

                var query = new Query();
                query.where = "1=1";
                this._populateStatus(siteList, statusList, siteLayer);

                //siteLayer.queryFeatures(query, lang.hitch(this, this._populateStatus,siteList,statusList,siteLayer));
            },
            _populateStatus: function (siteList, statusList, siteLayer, oSites) {
                //var aStatus = [];
                var lStatus = [
                    { label: "Operating", value: "Operating", sort: 1 },
                    { label: "Rent-up", value: "Rent-up", sort: 2 },
                    { label: "In Construction", value: "In Construction", sort: 3 },
                    { label: "Upcoming", value: "Upcoming", sort: 4 }
                ];
                /*oSites.features.forEach(function (feature) {
                    var ss = feature.attributes.SiteStatus
                    //console.log(array.indexOf(aStatus, ss));
                    if (array.indexOf(aStatus, ss) == -1) {
                        aStatus.push(ss);
                        lStatus.push({ label: ss, value: ss });
                    }
                });*/
                lStatus.sort(this.compareSorts);
                statusList.removeOption(statusList.options);
                statusList.addOption(lStatus)
                statusList.set('value', 'Operating');
                this._loadSites(siteList, statusList, siteLayer);
                console.log('status load');
            }
            ,
            _loadSites: function (siteList, statusList, siteLayer) {
                console.log('site load');
                var query = new Query();
                query.where = 'SiteStatus=\'' + statusList.value + '\'';
                siteLayer.queryFeatures(query,lang.hitch(this,this._populateSites,siteList));
            },
            _populateSites:function(siteList,results){
                    var newList = [
                        { label: '-- Select To Load a Site --', value: 'false' }
                    ];
                    results.features.forEach(function (feature) {
                        var name = feature.attributes.GroupName;
                        var siteValue = String(feature.attributes.lat) + ',' + String(feature.attributes.long) + ',' + name;
                        newList.push({ label: name, value: siteValue });
                    });
                    newList.sort(this.compareNames);
                    siteList.removeOption(siteList.options);
                    siteList.addOption(newList);
            },

            selectSite:function(){

            },

            moveToSite: function (selectString) {
                if (selectString != 'false') {
                    var vals = selectString.split(',');
                    var options = { lat: vals[0], long: vals[1], name: vals[2] };
                    this.ui.showPin = false;
                    var sitePoint = new Point(options.long, options.lat);
                    this.ui.setLocation(sitePoint);
                    this.map.centerAndZoom(sitePoint, 14);
                }
            },
            compareNames: function (a, b) {
                if (a.label < b.label)
                    return -1;
                if (a.label > b.label)
                    return 1;
                return 0;
            },
            compareSorts: function (a, b) {
                if (a.sort < b.sort)
                    return -1;
                if (a.sort > b.sort)
                    return 1;
                return 0;
            }
        });

    });