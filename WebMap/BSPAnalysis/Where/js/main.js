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
define(["dojo/ready",
    "dojo/json",
    "dojo/_base/array",
    "dojo/_base/Color",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-geometry",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/query",
    "dojo/store/Memory",
    "dijit/registry",
    "dijit/Menu",
    "dijit/CheckedMenuItem",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dojox/charting/Chart",
    "dojox/charting/plot2d/Pie",
    "dojox/charting/plot2d/Columns",
    "dojox/charting/plot2d/Areas",
    "dojox/charting/action2d/MoveSlice",
    "dojox/charting/action2d/Highlight",
    "dojox/charting/action2d/Tooltip",
    "dojox/charting/themes/Shrooms",
    "dojox/charting/widget/Legend",
    "application/toolbar",
    "application/has-config",
    "esri/arcgis/utils",
    "esri/dijit/HomeButton",
    "esri/dijit/LocateButton",
    "esri/dijit/Legend",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Measurement",
    "esri/dijit/OverviewMap",
    "esri/geometry/Extent",
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/UniqueValueRenderer",
    "application/TableOfContents",
    "application/ShareDialog",
    "dojox/charting/axis2d/Default"
], function (ready,
    JSON,
    array,
    Color,
    declare,
    lang,
    dom,
    domGeometry,
    domAttr,
    domClass,
    domConstruct,
    domStyle,
    on,
    Deferred,
    all,
    query,
    MemoryStore,
    registry,
    Menu,
    CheckedMenuItem,
    TabContainer,
    ContentPane,
    Chart,
    Pie,
    Columns,
    Areas,
    MoveSlice,
    Highlight,
    Tooltip,
    ChartTheme,
    ChartLegend,
    Toolbar,
    has,
    arcgisUtils,
    HomeButton,
    LocateButton,
    Legend,
    BasemapGallery,
    Measurement,
    OverviewMap,
    Extent,
    FeatureLayer,
    EsriQuery,
    SimpleMarkerSymbol,
    SimpleFillSymbol,
    SimpleLineSymbol,
    PictureMarkerSymbol,
    SimpleRenderer,
    UniqueValueRenderer,
    TableOfContents,
    ShareDialog) {


    return declare(null, {
        config: {},
        color: null,
        theme: null,
        map: null,
        initExt: null,
        mapExt: null,
        editorDiv: null,
        editor: null,
        editableLayers: null,
        currentTab: 'Home',

        startup: function (config) {
            // config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id and any url parameters and any application specific configuration information.
            if (config) {
                this.config = config;
                this.color = this.setColor(this.config.color);
                this.theme = this.setColor(this.config.theme);
                // document ready   
                ready(lang.hitch(this, function () {
                    //supply either the webmap id or, if available, the item info
                    var itemInfo = this.config.itemInfo || this.config.webmap;
                    //If a custom extent is set as a url parameter handle that before creating the map 
                    if (this.config.extent) {
                        var extArray = decodeURIComponent(this.config.extent).split(",");

                        if (extArray.length === 4) {
                            itemInfo.item.extent = [
                                [parseFloat(extArray[0]), parseFloat(extArray[1])],
                                [parseFloat(extArray[2]), parseFloat(extArray[3])]
                            ];
                        } else if (extArray.length === 5) {
                            this.initExt = new Extent(JSON.parse(this.config.extent));

                        }
                    }
                    this._createWebMap(itemInfo);


                }));
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },

        reportError: function (error) {
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            domClass.add(document.body, "app-error");
            // an error occurred - notify the user. In this example we pull the string from the
            // resource.js file located in the nls folder because we've set the application up
            // for localization. If you don't need to support multiple languages you can hardcode the
            // strings here and comment out the call in index.html to get the localization strings.
            // set message
            var node = dom.byId("loading_message");
            if (node) {
                if (this.config && this.config.i18n) {
                    node.innerHTML = this.config.i18n.map.error + ": " + error.message;
                } else {
                    node.innerHTML = "Unable to create map: " + error.message;
                }
            }
        },

        setColor: function (color) {
            var rgb = Color.fromHex(color).toRgb();
            var outputColor = null;
            if (has("ie") < 9) {
                outputColor = color;
            } else {
                //rgba supported so add 
                rgb.push(0.9);
                outputColor = Color.fromArray(rgb);

            }

            return outputColor;

        },

        // Map is ready
        _mapLoaded: function () {
            query(".esriSimpleSlider").style("backgroundColor", this.theme.toString());
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            on(window, "orientationchange", lang.hitch(this, this._adjustPopupSize));
            
            this._adjustPopupSize();

        },


        // Create UI
        _createUI: function () {
            domStyle.set("panelPages", "visibility", "hidden");
            //Add tools to the toolbar. The tools are listed in the defaults.js file 
            var toolbar = new Toolbar(this.config);
            toolbar.startup().then(lang.hitch(this, function () {

                // set map so that it can be repositioned when page is scrolled
                toolbar.map = this.map;
                var sl = this.symbolizeSites(this.map);

                var toolList = [];
                for (var i = 0; i < this.config.tools.length; i++) {
                    switch (this.config.tools[i].name) {
                    case "legend":
                        toolList.push(this._addLegend(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "bookmarks":
                        toolList.push(this._addBookmarks(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "layers":
                        toolList.push(this._addLayers(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "basemap":
                        toolList.push(this._addBasemapGallery(this.config.tools[i], toolbar, "large"));
                        break;
                    case "overview":
                        toolList.push(this._addOverviewMap(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "measure":
                        toolList.push(this._addMeasure(this.config.tools[i], toolbar, "small"));
                        break;
                    case "edit":
                        toolList.push(this._addEditor(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "print":
                        toolList.push(this._addPrint(this.config.tools[i], toolbar, "small"));
                        break;
                    case "details":
                        toolList.push(this._addDetails(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "share":
                        toolList.push(this._addShare(this.config.tools[i], toolbar, "medium"));
                        break;
                    case "infopanel":
                        toolList.push(this._addInfoPanel(this.config.tools[i], toolbar, "xlarge"));
                        break;
                    default:
                        break;
                    }
                }

                all(toolList).then(lang.hitch(this, function (results) {


                    //If all the results are false and locate and home are also false we can hide the toolbar
                    var tools = array.some(results, function (r) {
                        return r;
                    });

                    var home = has("home");
                    var locate = has("locate");


                    //No tools are specified in the configuration so hide the panel and update the title area styles 
                    if (!tools && !home && !locate) {
                        domConstruct.destroy("panelTools");
                        domStyle.set("panelContent", "display", "none");
                        domStyle.set("panelTitle", "border-bottom", "none");
                        domStyle.set("panelTop", "height", "52px");
                        query(".esriSimpleSlider").addClass("notools");
                        this._updateTheme();
                        return;
                    }

                    //Now that all the tools have been added to the toolbar we can add page naviagation
                    //to the toolbar panel, update the color theme and set the active tool. 
                    this._updateTheme();
                    toolbar.activateTool(this.config.activeTool);
                    toolbar.updatePageNavigation();

                    on(toolbar, "updateTool", lang.hitch(this, function (name) {
                        if (name === "measure") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                        } else if (name === "edit") {
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                            this._createEditor();
                        } else {
                            //activate the popup and destroy editor if necessary
                            this._destroyEditor();
                            this.map.setInfoWindowOnClick(false);
                        }
                    }));

                    domStyle.set("panelPages", "visibility", "visible");

                }));
            }));
        },
        symbolizeSites: function (pageMap) {

            var symAOP = new PictureMarkerSymbol("/images/siteicons/BSP_APPT_OP.png", 54, 35);
            var symARU = new PictureMarkerSymbol("/images/siteicons/BSP_APPT_RU.png", 54, 35);
            var symAUC = new PictureMarkerSymbol("/images/siteicons/SPD_APPT_UC.png", 54, 35);
            var symAPR = new PictureMarkerSymbol("/images/siteicons/SPD_APPT_PR.png", 54, 35);

            var symTOP = new PictureMarkerSymbol("/images/siteicons/BSP_TOWN_OP.png", 54, 35);
            var symTRU = new PictureMarkerSymbol("/images/siteicons/BSP_TOWN_RU.png", 54, 35);
            var symTUC = new PictureMarkerSymbol("/images/siteicons/SPD_TOWN_UC.png", 54, 35);
            var symTPR = new PictureMarkerSymbol("/images/siteicons/SPD_TOWN_PR.png", 54, 35);

            var symUOP = new PictureMarkerSymbol("/images/siteicons/SPD_UKN_OP.png", 54, 35);
            var symURU = new PictureMarkerSymbol("/images/siteicons/SPD_UKN_RU.png", 54, 35);
            var symUUC = new PictureMarkerSymbol("/images/siteicons/SPD_UKN_UC.png", 54, 35);
            var symUPR = new PictureMarkerSymbol("/images/siteicons/SPD_UKN_PR.png", 54, 35);

            var symRUC = new PictureMarkerSymbol("/images/siteicons/REG_UC.png", 35, 35);
            var symROP = new PictureMarkerSymbol("/images/siteicons/REG_OP.png", 35, 35);

            var symUK = new PictureMarkerSymbol("/images/siteicons/NEW_UNKNOWN.png", 54, 35);

            var siteRend = new UniqueValueRenderer(symUK, "Type", "SiteStatus", null, ":");
            siteRend.addValue("Low Rise Apt:Operating", symAOP);
            siteRend.addValue("Low Rise Apt:Rent-up", symARU);
            siteRend.addValue("Low Rise Apt:In Construction", symAUC);
            siteRend.addValue("Low Rise Apt:Upcoming", symAPR);
            siteRend.addValue("BSP Apart:Pre-construction", symAPR);

            siteRend.addValue("Townhouse:Operating", symTOP);
            siteRend.addValue("Townhouse:Rent-up", symTRU);
            siteRend.addValue("Townhouse:In Construction", symTUC);
            siteRend.addValue("Townhouse:Upcoming", symTPR);

            siteRend.addValue("Unknown:Operating", symUOP);
            siteRend.addValue("Unknown:Rent-up", symURU);
            siteRend.addValue("Unknown:In Construction", symUUC);
            siteRend.addValue("Unknown:Upcoming", symUPR);

            siteRend.addValue("Regional Office:In Construction", symRUC);
            siteRend.addValue("Regional Office:Operating", symROP);

            for (i = 0; i < pageMap.graphicsLayerIds.length; i++) {
                var lyr = pageMap.getLayer(pageMap.graphicsLayerIds[i]);
                if (lyr.name == 'BaseSites') {
                    lyr.setRenderer(siteRend);
                }

            }
        },
        _addInfoPanel: function (tool, toolbar, panelClass) {
            var deferred = new Deferred();
            if (has("infopanel")) {
                var infoPanelDiv = toolbar.createTool(tool, panelClass);
                var fLayer = toolbar.map.getLayer(toolbar.map.graphicsLayerIds[0]);
                on(fLayer, 'click', lang.hitch(this, this.populateInfoPanel,infoPanelDiv));
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

        },
        populateInfoPanel: function (panel, evt) {
            domConstruct.empty(panel.id);
            var info = domConstruct.create("div", {}, panel);

            var lyr = event.graphic._layer;
            var tc = new TabContainer({
                style: "height:100%;width100%"
            }, info);

            
            var attrs = evt.graphic.attributes;

            var nl = query('#pageHeader_infopanel > .pageTitle');
            nl[0].innerHTML = attrs.Name;
            var objIdFld = lyr.objectIdField;
            lyr.clearSelection();
            //cyan
            var selectionColor = new Color([0, 255, 255, 1.0]);
            var selectSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, selectionColor, 4), new Color([255, 200, 0, 0.5]));
            lyr.setSelectionSymbol(selectSymbol);

            var q = new EsriQuery();
            var oids = [];
            oids.push(evt.graphic.attributes[objIdFld]);
            q.objectIds = oids;
            lyr.selectFeatures(q, FeatureLayer.SELECTION_NEW);

            /*
            var chartNode = domConstruct.create("div", { style: "width:100%;height:400px;" });
            var testPie = new Chart(chartNode);
            
            var testData = [1234, 893, 455];
            //testPie.shadow = true;
            testPie.addPlot("default", {
                type: Pie,
                font: "Open Sans",
                radius:150

            });
            testPie.addSeries("Test Data", testData);
            testPie.setTheme(ChartTheme);
            var ms = new MoveSlice(testPie, "default");
            testPie.render();
            */
            var home = domConstruct.create("div");
            domClass.add(home, "margin5");
            var homeData = this.buildHomeArray(evt);
            var htable = "<table style=\"width:100%\">";
            htable += "<tr><td> Apartments Units Goal</td>";
            htable += "<td>" + homeData.APTGoal + "</td></tr>";
            htable += "<tr><td> Townhome Units Goal</td>";
            htable += "<td>" + homeData.THGoal + "</td></tr>"
            htable += '<tr><td colspan="2">&nbsp;</td></tr>';
            htable += "<tr><td> Apartments Units Currently</td>";
            htable += "<td>" + homeData.APTActual + "</td></tr>";
            htable += "<tr><td> Townhome Units Currently</td>";
            htable += "<td>" + homeData.THActual + "</td></tr>";
            htable += '<tr><td colspan="2">&nbsp;</td></tr>';
            htable += "<tr><td> Apartments Units Needed</td>";
            htable += "<td>" + (homeData.APTGoal - homeData.APTActual) + "</td></tr>";
            htable += "<tr><td> Townhome Units Needed</td>";
            htable += "<td>" + (homeData.THGoal - homeData.THActual) + "</td></tr>";
            htable += "</table>";

            var vacNode = domConstruct.create("div");
            var vacChartNode = domConstruct.create("div", {}, vacNode);
            domClass.add(vacChartNode,"margin5");
            var vacCont = this.buildVacancyData(evt, vacChartNode);
            var vacDescription = domConstruct.create("div", {}, vacNode);
            vacDescription.innerHTML = "Vacancy rates come from the CMHC website and are listed here for Oct 2012, and Oct 2013 which is the most recent data CMHC lists for major centers."

            
            var lmNode = domConstruct.create("div");
            var lmChartNode = domConstruct.create("div", {  }, lmNode);
            var lmLegNode = domConstruct.create("div", { }, lmNode);
            domClass.add(lmChartNode, "margin5");
            domClass.add(lmLegNode, "margin5");
            var lmChart = this.buildLonelyManData(evt, lmChartNode, lmLegNode);
            var lmDescription = domConstruct.create("div", {}, lmNode);
            domClass.add(lmDescription, "margin5");
            lmDescription.innerHTML = "A Lonely Site a site that has no neighbouring sites within a 10km radius";

            var NOI = this.buildNOIData(evt);

            var rmdNode = domConstruct.create("div");
            var rmdChartNode = domConstruct.create("div", {  }, rmdNode);
            var legNode = domConstruct.create("div", { }, rmdNode);
            domClass.add(rmdChartNode, "margin5");
            legNode.innerHTML = "legend";
            var rmdChart = this.buildRentalMarketData(evt, rmdChartNode, legNode);
            var rmdDescription = domConstruct.create("div", {}, rmdNode);
            domClass.add(rmdDescription, "margin5");
            rmdDescription.innerHTML = "The Rental Bedrooms data comes from research calls collected by the Call Center. Mouse over the pie chart for total number in each category";

            var hsNode = domConstruct.create("div");
            var hsMonthChart = domConstruct.create("div", {}, hsNode);
            var hsYTDChart = domConstruct.create("div", {}, hsNode);
            var hsDesc = domConstruct.create("div", { style: 'font-size:10px' }, hsNode);
            hsDesc.innerHTML = "All data is for Single-Family Dwellings obtained from CMHC and is an aggregate of the CMHC zones that lie inside the AOI"
            domClass.add(hsMonthChart, "margin5");
            domClass.add(hsYTDChart, "margin5");
            var mthChart = this.buildHousingStartsMonthData(evt, hsMonthChart);
            var ytdChart = this.buildHousingStartsYTDData(evt, hsYTDChart);


            var mgmtChlgNode = domConstruct.create("div");
            domClass.add(mgmtChlgNode, "margin5");
            mgmtChlgNode.innerHTML = this.buildMCData(evt);



            var cp1 = new ContentPane({
                title: "Home",
                content: htable,
                selected: false
            });
            var cp2 = new ContentPane({
                title: "Vacancy",
                content: vacNode,
                selected: false
            });
            var cp3 = new ContentPane({
                title: "Lonely Sites",
                content: lmNode,
                selected:  false
            });
            var cp4 = new ContentPane({
                title: "NOI",
                content: NOI,
                selected:  false
            });

            var cp5 = new ContentPane({
                title: "Rental Bedrooms",
                content: rmdNode,
                selected:  false
            });

            var cp6 = new ContentPane({
                title: "Housing Starts",
                content: hsNode,
                selected:  false
            });
            var cp7 = new ContentPane({
                title: "Management Challenge",
                content: mgmtChlgNode,
                selected:  false
            });
            var nl = query('#currentTab');
            var curTab = nl[0].value

            switch (curTab) {
                case 'Home':
                    cp1.selected = true;
                    break;
                case 'Vacancy':
                    cp2.selected = true;
                    break;
                case 'Lonely Sites':
                    cp3.selected = true;
                    break;
                case 'NOI':
                    cp4.selected = true;
                    break;
                case 'Rental Bedrooms':
                    cp5.selected = true;
                    break;
                case 'Housing Starts':
                    cp6.selected = true;
                    break;
                case 'Management Challenge':
                    cp7.selected = true;
                    break;
            }
            on(cp6, 'Show', lang.hitch(this, function (mthChart,ytdChart) {
                mthChart.resize(400, 225);
                ytdChart.resize(400, 225);
            }, mthChart,ytdChart));
            tc.addChild(cp1);
            tc.addChild(cp2);
            tc.addChild(cp3);
            tc.addChild(cp4);
            tc.addChild(cp5);
            tc.addChild(cp6);
            tc.addChild(cp7);
            tc.startup();
            tc.watch("selectedChildWidget", lang.hitch(this, function (evt, oval, nval) {
                var nl = query('#currentTab');
                nl[0].value = nval.title;
            }));
           
            

        },
        buildHousingStartsMonthData: function (evt,monthNode) {
            var attrs = evt.graphic.attributes;
            var hsMonthData = [];
            var hsYTDData = [];
            if (attrs.HSAUG13 == " " || attrs.HSAUG13 == null || attrs.HSAUG13 == undefined) {
                hsMonthData.push({ title: "Starts Aug 2013", y: 0 });
            } else {
                hsMonthData.push({ title: "Starts Aug 2013", y: attrs.HSAUG13 });
            }
            if (attrs.HSAUG14 == " " || attrs.HSAUG14 == null || attrs.HSAUG14 == undefined) {
                hsMonthData.push({ title: "Starts Aug 2014", y: 0 });
            } else {
                hsMonthData.push({ title: "Starts Aug 2014", y: attrs.HSAUG14 });
            }
            if (attrs.HSYTD13 == " " || attrs.HSYTD13 == null || attrs.HSYTD13 == undefined) {
                hsYTDData.push({ title: "Starts YTD 2013", y: 0 });
            } else {
                hsYTDData.push({ title: "Starts YTD 2013", y: attrs.HSYTD13 });
            }
            if (attrs.HSYTD14 == " " || attrs.HSYTD14 == null || attrs.HSYTD14 == undefined) {
                hsYTDData.push({ title: "Starts YTD 2014", y: 0 });
            } else {
                hsYTDData.push({ title: "Starts YTD 2014", y: attrs.HSYTD14 });
            }
            var hsMonth = new Chart(monthNode, {
                title: 'Housing Starts August',
                titleFont: 'Open Sans',
                titlePos: 'top',
                titleGap: 10
            });
            hsMonth.addPlot('default', {
                type: Columns,
                font: 'Open Sans',
                labels: true,
                fontColor: 'white',
                gap: 20,
                precision: 0
            });
            hsMonth.addAxis("x", {
                labels: [
                    {
                        value: 0,
                        text: ''

                    },
                    {
                        value: 1,
                        text: 'Aug 2013'

                    },
                    {
                        value: 2,
                        text: 'Aug 2014'
                    },
                    {
                        value: 3,
                        text: ''
                    }],
                fixLower: 'major',
                fixUpper: 'major',
                minorLabel: false,
                minorTick: false
            });
            hsMonth.addAxis("y", {
                vertical: true,
                min: 0,
                fixUpper: 'major',
                fixLower: 'major'
            });
            hsMonth.setTheme(ChartTheme);
            hsMonth.addSeries('default', hsMonthData);
            hsMonth.render();
            return hsMonth;
        },
        buildHousingStartsYTDData: function (evt,YTDNode) {
            var attrs = evt.graphic.attributes;
            var hsYTDData = [];
            if (attrs.HSYTD13 == " " || attrs.HSYTD13 == null || attrs.HSYTD13 == undefined) {
                hsYTDData.push({ title: "Starts YTD 2013", y: 0, tooltip: 0  });
            } else {
                hsYTDData.push({ title: "Starts YTD 2013", y: attrs.HSYTD13, tooltip: attrs.HSYTD13 });
            }
            if (attrs.HSYTD14 == " " || attrs.HSYTD14 == null || attrs.HSYTD14 == undefined) {
                hsYTDData.push({ title: "Starts YTD 2014", y: 0, tooltip:0 });
            } else {
                hsYTDData.push({ title: "Starts YTD 2014", y: attrs.HSYTD14, tooltip: attrs.HSYTD14 });
            }
            var hsYTD = new Chart(YTDNode, {
                title: 'Housing Starts YTD',
                titleFont: 'Open Sans',
                titlePos: 'top',
                titleGap: 10
            });
            hsYTD.addPlot('default', {
                type: Columns,
                font: 'Open Sans',
                labels: true,
                fontColor: 'white',
                precision: 0,
                gap:20
            });
            hsYTD.addAxis("x", {
                labels: [
                    {
                        value: 0,
                        text: ''
                    },

                    {
                        value: 1,
                        text: 'Jan - Aug 2013'
                    },
                {
                    value: 2,
                    text: 'Jan - Aug 2014'
                },
                {
                    value: 3,
                    text: ''
                }
                ],
                fixLower: 'major',
                fixUpper: 'major',
                minorLabels: false,
                minorTicks: false,
                microLabels: false,
                microTicks: false
            });
            hsYTD.addAxis("y", {
                vertical: true,
                min: 0,
                fixUpper: 'major',
                fixLower: 'major',
            });
            hsYTD.setTheme(ChartTheme);
            hsYTD.addSeries('default', hsYTDData);
            hsYTD.render();
            var hi = new Highlight(hsYTD);
            return hsYTD;
        },
        buildRentalMarketData: function (evt, chartNode, legendNode) {
            var rmdPie = new Chart(chartNode, {
                title: "Rental Bedrooms",
                titleFont: "Open Sans 15pt",
                titlePos: "top",
                titleGap: 20
            });
            var attrs = evt.graphic.attributes;

            var bdrmData = [];
            if (attrs.Sum_bdrm1 == " " || attrs.Sum_bdrm1 == null || attrs.Sum_bdrm1 == undefined) {
                bdrmData.push({ y: 0, legend: "1 Bedroom", tooltip: 0 });
            } else {
                bdrmData.push({ y: attrs.Sum_bdrm1, value: attrs.Sum_bdrm1, legend: "1 Bedroom", tooltip: attrs.Sum_bdrm1});
            }
            if (attrs.Sum_bdrm2 == " " || attrs.Sum_bdrm2 == null || attrs.Sum_bdrm2 == undefined) {
                bdrmData.push({ y: 0, legend: "2 Bedroom", tooltip: 0 });
            } else {
                bdrmData.push({ y: attrs.Sum_bdrm2, legend: "2 Bedroom", tooltip: attrs.Sum_bdrm2 });
            }
            if (attrs.Sum_bdrm3 == " " || attrs.Sum_bdrm3 == null || attrs.Sum_bdrm3 == undefined) {
                bdrmData.push({ y: 0, legend: "3 Bedroom", tooltip: 0 });
            } else {
                bdrmData.push({ y: attrs.Sum_bdrm3, legend: "3 Bedroom", tooltip: attrs.Sum_bdrm3 });
            }
            if (attrs.Sum_bdrm4 == " " || attrs.Sum_bdrm4 == null || attrs.Sum_bdrm4 == undefined) {
                bdrmData.push({ y: 0, legend: "4 Bedroom", tooltip: 0 });
            } else {
                bdrmData.push({ y: attrs.Sum_bdrm4, legend: "4 Bedroom", tooltip: attrs.Sum_bdrm4 });
            }
            rmdPie.addPlot("default", {
                type: Pie,
                font: "Open Sans",
                radius: 100,
                labels:false
            });
            rmdPie.addSeries("default", bdrmData)
            rmdPie.setTheme(ChartTheme);
            var ms = new MoveSlice(rmdPie, "default");
            var tip = new Tooltip(rmdPie, "default");
            rmdPie.render();
            var leg = new ChartLegend({ chart: rmdPie,vertical:true }, legendNode);
            return rmdPie;

        },
        buildMCData: function (evt) {
            var attrs = evt.graphic.attributes;
            var MCTable = '<table style="width:100%">';
            MCTable += '<tr><th style="font-size:2em"> Average Management Challenge </th></tr>';
            MCTable += '<tr><td style="text-align:center;font-size:2.5em"><div class="rounded shadow" style="background-color:#00add8;color:white">';
            if (attrs.MGMTCHLG === null) {
                MCTable += 'N/A';
            } else {
                MCTable += attrs.MGMTCHLG.toFixed(2)
            }
            MCTable += '</div> </td></tr>'

            MCTable += '<tr><th style="font-size:2em">Regional Management Challenge</th></tr>';
            MCTable += '<tr><td style="text-align:center;font-size:2.5em"><div class="rounded shadow" style="background-color:#00add8;color:white">';
            if (attrs.MGMTCHLGRGN === null) {
                MCTable += 'N/A';
            } else {
                MCTable += attrs.MGMTCHLGRGN.toFixed(2)
            }
            MCTable += '<tr><td>Management Challenge is a calculated field based on a variety of factors including number of buildings, lonely man status, age of buildings and other factors.</td></tr>'
            MCTable += '<tr><td style="text-align:center"> Scale 1 - Easy, 4 - Difficult</td></tr>';
            MCTable += "</table>";
            return MCTable
        },
        buildNOIData: function (evt) {
            var attrs = evt.graphic.attributes;
            var NOITable = '<table style="width:100%">';
            NOITable += '<tr><th style="font-size:2.5em">Area NOI % </th></tr>';
            NOITable += '<tr><td style="text-align:center;font-size:2.5em"><div class="rounded shadow" style="background-color:#00add8;color:white">';
            NOITable += !isNaN(attrs.Sum_NOI / attrs.Sum_Revenue) ? ((attrs.Sum_NOI / attrs.Sum_Revenue) * 100).toFixed(0) + '%' : 'N/A'
            NOITable += '</div> </td></tr>'
            NOITable += '<tr><th style="font-size:2.5em">Portfolio NOI % </th></tr>';
            NOITable += '<tr><td style="text-align:center;font-size:2.5em"><div class="rounded shadow" style="background-color:#00add8;color:white">' + (0.690378281 * 100).toFixed(0) + '%</div> </td></tr>'
            NOITable += '<tr><td>NOI for all sites within Area of Interest expressed as a percentage of Revenue</td></tr>'
            NOITable += "</table>";
            return NOITable;
        },
        buildLonelyManData : function(evt, chartNode, legendNode){
            
            var lmPie = new Chart(chartNode);
            var attrs = evt.graphic.attributes;

            var lmData = [];
            if (attrs.Point_Count == " " || attrs.Point_Count == null || attrs.Point_Count == undefined) {
                lmData.push({ y: 0, legend: "Lonely Sites", text: 0 });
                lmData.push({ y: 0, legend: "Non Lonely Sites", text: 0 });
            } else {
                if (attrs.Sum_LonelyMan == " " || attrs.Sum_LonelyMan == null || attrs.Sum_LonelyMan == undefined) {
                    lmData.push({ y: 0, legend: "Lonely Sites", text: 0, tooltip: '0%' });
                    lmData.push({ y: attrs.Point_Count, legend: "Non Lonely Sites", text: attrs.Point_Count, tooltip: '100%' });
                } else {
                    var lm = {};
                    lm.y = (attrs.Sum_LonelyMan);
                    lm.legend = "Lonely Sites";
                    lm.text = attrs.Sum_LonelyMan;
                    lm.tooltip = ((attrs.Sum_LonelyMan/attrs.Point_Count) * 100).toFixed(2).toString() + '%';
                    lmData.push(lm);

                    var nlm = {};
                    nlm.y = (attrs.Point_Count - attrs.Sum_LonelyMan);
                    nlm.legend = "Non Lonely Sites";
                    nlm.text = (attrs.Point_Count - attrs.Sum_LonelyMan);
                    nlm.tooltip = (((attrs.Point_Count - attrs.Sum_LonelyMan) / attrs.Point_Count) * 100).toFixed(2).toString() + '%';
                    lmData.push(nlm);
                }
            }

            //testPie.shadow = true;
            lmPie.addPlot("default", {
                type: Pie,
                font: "Open Sans",
                fontColor:"white",
                radius: 125

            });
            lmPie.addSeries("default", lmData);
            lmPie.setTheme(ChartTheme);
            var ms = new MoveSlice(lmPie, "default");
            var tip = new Tooltip(lmPie, "default");
            lmPie.render();
            var leg = new ChartLegend({ chart: lmPie, vertical: true }, legendNode);
            return lmPie;
        },

        buildVacancyData: function (evt, chartNode) {
            var attrs = evt.graphic.attributes;
            //VROCT12, VROCT13
            var vrData = [];
            if (attrs.VROCT12 == " " || attrs.VROCT12 == null || attrs.VROCT12 == undefined) {
                vrData.push({ y: 0, text: '0%' });
            } else {
                vrData.push({ y: attrs.VROCT12, text: attrs.VROCT12.toString() + '%' });
            }
            if (attrs.VROCT13 == " " || attrs.VROCT13 == null || attrs.VROCT13 == undefined) {
                vrData.push({ y: 0, text: '0%' });
            } else {
                vrData.push({ y: attrs.VROCT13, text: attrs.VROCT13.toString() + '%' });
            }
            domClass.add(chartNode, "margin5");

            var vacChart = new Chart(chartNode, {
                title: 'Vacancy Rate Percentage',
                titleGap: 10,
                titleFont:'Open Sans 15px'
            });
            vacChart.addPlot("default", {
                type: "Columns",
                font: "Open Sans",
                labels: true,
                fontColor:"white",
                gap: 25
            });

            var vacLabels = [
                { value: 1, text: "Oct 12" },
                { value: 2, text: "Oct 13" },
                { value: 3, text: '' }
            ];

            vacChart.setTheme(ChartTheme);
            vacChart.addAxis("x", { fixUpper: "major", labels:vacLabels });
            vacChart.addAxis("y", { vertical: true, includeZero: true, fixUpper: "major" });
            vacChart.addSeries("Vacancy Rate", vrData);
            
            var magnify = new Highlight(vacChart, "default");
            //var tip = new Tooltip(vacChart, "default");

            vacChart.render();

            return vacChart;

        },
        buildHomeArray:function(evt){
            var ret = {
                APTGoal: 0,
                THGoal: 0,
                APTActual: 0,
                THActual:0
            };
            var attrs = evt.graphic.attributes;
            if (attrs.APT_Goals == " " || attrs.APT_Goals == null || attrs.APT_Goals == undefined) {
                ret.APTGoal = 0;
            } else {
                ret.APTGoal = parseInt(attrs.APT_Goals);
            }
            if (attrs.TH_Goals == " " || attrs.TH_Goals == null || attrs.TH_Goals == undefined) {
                ret.THGoal = 0;
            } else {
                ret.THGoal = parseInt(attrs.TH_Goals);
            }
            if (attrs.Sum_APTUnitCou == " " || attrs.Sum_APTUnitCou == null || attrs.Sum_APTUnitCou == undefined) {
                ret.APTActual = 0;
            } else {
                ret.APTActual = parseInt(attrs.Sum_APTUnitCou);
            }
            if (attrs.Sum_THUnitCoun == " " || attrs.Sum_THUnitCoun == null || attrs.Sum_THUnitCoun == undefined) {
                ret.THActual = 0;
            } else {
                ret.THActual = parseInt(attrs.Sum_THUnitCoun);
            }
            return ret;
        },
        _addBasemapGallery: function (tool, toolbar, panelClass) {
            //Add the basemap gallery to the toolbar. 
            var deferred = new Deferred();
            if (has("basemap")) {
                var basemapDiv = toolbar.createTool(tool, panelClass);
                var basemap = new BasemapGallery({
                    id: "basemapGallery",
                    map: this.map,
                    showArcGISBasemaps: true,
                    portalUrl: this.config.sharinghost,
                    basemapGroup: this._getBasemapGroup()
                }, domConstruct.create("div", {}, basemapDiv));
                basemap.startup();
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },

        _addBookmarks: function (tool, toolbar, panelClass) {
            //Add the bookmarks tool to the toolbar. Only activated if the webmap contains bookmarks. 
            var deferred = new Deferred();
            if (this.config.response.itemInfo.itemData.bookmarks) {
                //Conditionally load this module since most apps won't have bookmarks
                require(["application/has-config!bookmarks?esri/dijit/Bookmarks"], lang.hitch(this, function (Bookmarks) {
                    if (!Bookmarks) {
                        deferred.resolve(false);
                        return;
                    }
                    var bookmarkDiv = toolbar.createTool(tool, panelClass);
                    var bookmarks = new Bookmarks({
                        map: this.map,
                        bookmarks: this.config.response.itemInfo.itemData.bookmarks
                    }, bookmarkDiv);

                    deferred.resolve(true);

                }));

            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },
        _addDetails: function (tool, toolbar, panelClass) {
            //Add the default map description panel 
            var deferred = new Deferred();
            if (has("details")) {
                var description = this.config.description || this.config.response.itemInfo.item.description || this.config.response.itemInfo.item.snippet;
                if (description) {
                    var descLength = description.length;
                    //Change the panel class based on the string length
                    if (descLength < 200) {
                        panelClass = "small";
                    } else if (descLength < 400) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }

                    var detailDiv = toolbar.createTool(tool, panelClass);
                    detailDiv.innerHTML = description;
                }
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;

        },
        _addEditor: function (tool, toolbar, panelClass) {

            //Add the editor widget to the toolbar if the web map contains editable layers 
            var deferred = new Deferred();
            this.editableLayers = this._getEditableLayers(this.config.response.itemInfo.itemData.operationalLayers);
            if (has("edit") && this.editableLayers.length > 0) {
                if (this.editableLayers.length > 0) {
                    this.editorDiv = toolbar.createTool(tool, panelClass);
                    return this._createEditor();
                } else {
                    console.log("No Editable Layers");
                    deferred.resolve(false);
                }
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        },
        _createEditor: function () {
            var deferred = new Deferred();
            //Dynamically load since many apps won't have editable layers 
            require(["application/has-config!edit?esri/dijit/editing/Editor"], lang.hitch(this, function (Editor) {
                if (!Editor) {
                    deferred.resolve(false);
                    return;
                }


                //add field infos if necessary. Field infos will contain hints if defined in the popup and hide fields where visible is set
                //to false. The popup logic takes care of this for the info window but not the edit window. 
                array.forEach(this.editableLayers, lang.hitch(this, function (layer) {
                    if (layer.featureLayer && layer.featureLayer.infoTemplate && layer.featureLayer.infoTemplate.info && layer.featureLayer.infoTemplate.info.fieldInfos) {
                        //only display visible fields 
                        var fields = layer.featureLayer.infoTemplate.info.fieldInfos;
                        var fieldInfos = [];
                        array.forEach(fields, function (field) {
                            if (field.visible) {
                                fieldInfos.push(field);
                            }
                        });
                        layer.fieldInfos = fieldInfos;
                    }
                }));
                var settings = {
                    map: this.map,
                    layerInfos: this.editableLayers,
                    toolbarVisible: has("edit-toolbar")
                };
                this.editor = new Editor({
                    settings: settings
                }, domConstruct.create("div", {}, this.editorDiv));


                this.editor.startup();
                deferred.resolve(true);

            }));
            return deferred.promise;

        },
        _destroyEditor: function () {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }

        },
        _addLayers: function (tool, toolbar, panelClass) {
            //Toggle layer visibility if web map has operational layers 
            var deferred = new Deferred();

            var layers = this.config.response.itemInfo.itemData.operationalLayers;

            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("layers")) {


                    //Use small panel class if layer layer is less than 5
                    if (layers.length < 5) {
                        panelClass = "small";
                    } else if (layers.length < 15) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }
                    var layersDiv = toolbar.createTool(tool, panelClass);

                    var toc = new TableOfContents({
                        map: this.map,
                        layers: layers
                    }, domConstruct.create("div", {}, layersDiv));
                    toc.startup();


                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            }
            return deferred.promise;
        },
        _addLegend: function (tool, toolbar, panelClass) {
            //Add the legend tool to the toolbar. Only activated if the web map has operational layers. 
            var deferred = new Deferred();
            var layers = arcgisUtils.getLegendLayers(this.config.response);


            if (layers.length === 0) {
                deferred.resolve(false);
            } else {
                if (has("legend")) {
                    var legendLength = 0;
                    array.forEach(layers, lang.hitch(this, function (layer) {
                        if (layer.infos && layer.infos.length) {
                            legendLength += layer.infos.length;
                        }
                    }));

                    if (legendLength.length < 5) {
                        panelClass = "small";
                    } else if (legendLength.length < 15) {
                        panelClass = "medium";
                    } else {
                        panelClass = "large";
                    }

                    var legendDiv = toolbar.createTool(tool, panelClass);
                    var legend = new Legend({
                        map: this.map,
                        layerInfos: layers
                    }, domConstruct.create("div", {}, legendDiv));
                    domClass.add(legend.domNode, "legend");
                    legend.startup();
                    toolbar.activateTool(this.config.activeTool || "legend");
                    deferred.resolve(true);

                } else {
                    deferred.resolve(false);
                }


            }
            return deferred.promise;
        },

        _addMeasure: function (tool, toolbar, panelClass) {
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();
            if (has("measure")) {

                var measureDiv = toolbar.createTool(tool, panelClass);
                var areaUnit = (this.config.units === "metric") ? "esriSquareKilometers" : "esriSquareMiles";
                var lengthUnit = (this.config.units === "metric") ? "esriKilometers" : "esriMiles";

                var measure = new Measurement({
                    map: this.map,
                    defaultAreaUnit: areaUnit,
                    defaultLengthUnit: lengthUnit
                }, domConstruct.create("div", {}, measureDiv));

                measure.startup();
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }



            return deferred.promise;
        },
        _addOverviewMap: function (tool, toolbar, panelClass) {
            //Add the overview map to the toolbar 
            var deferred = new Deferred();

            if (has("overview")) {
                var ovMapDiv = toolbar.createTool(tool, panelClass);


                domStyle.set(ovMapDiv, {
                    "height": "100%",
                    "width": "100%"
                });

                var panelHeight = this.map.height;
                if (panelClass === "small") {
                    panelHeight = 250;
                } else if (panelClass === "medium") {
                    panelHeight = 350;
                }

                var ovMap = new OverviewMap({
                    id: "overviewMap",
                    map: this.map,
                    height: panelHeight
                }, domConstruct.create("div", {}, ovMapDiv));

                ovMap.startup();

                on(this.map, "layer-add", lang.hitch(this, function (args) {
                    //delete and re-create the overview map if the basemap gallery changes  
                    if (args.layer.hasOwnProperty("_basemapGalleryLayerType") && args.layer._basemapGalleryLayerType === "basemap") {
                        registry.byId("overviewMap").destroy();
                        var ovMap = new OverviewMap({
                            id: "overviewMap",
                            map: this.map,
                            height: panelHeight,
                            visible: false
                        }, domConstruct.create("div", {}, ovMapDiv));

                        ovMap.startup();
                    }
                }));
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }


            return deferred.promise;
        },
        _addPrint: function (tool, toolbar, panelClass) {
            //Add the print widget to the toolbar. TODO: test custom layouts. 
            var deferred = new Deferred(),
                legendNode = null,
                print = null;


            require(["application/has-config!print?esri/dijit/Print"], lang.hitch(this, function (Print) {
                var layoutOptions = {
                    "titleText": this.config.title,
                    "scalebarUnit": this.config.units,
                    "legendLayers": []
                };
                if (!Print) {
                    deferred.resolve(false);
                    return;
                }

                var printDiv = toolbar.createTool(tool, panelClass);
                if (has("print-legend")) {
                    legendNode = domConstruct.create("input", {
                        id: "legend_ck",
                        className: "checkbox",
                        type: "checkbox",
                        checked: false
                    }, domConstruct.create("div", {
                        "class": "checkbox"
                    }));

                    var labelNode = domConstruct.create("label", {
                        "for": "legend_ck",
                        "className": "checkbox",
                        "innerHTML": "  " + this.config.i18n.tools.print.legend
                    }, domConstruct.create("div"));
                    domConstruct.place(legendNode, printDiv);
                    domConstruct.place(labelNode, printDiv);

                    on(legendNode, "change", lang.hitch(this, function (arg) {


                        if (legendNode.checked) {
                            var layers = arcgisUtils.getLegendLayers(this.config.response);
                            var legendLayers = array.map(layers, function (layer) {
                                return {
                                    "layerId": layer.layer.id
                                };
                            });
                            if (legendLayers.length > 0) {
                                layoutOptions.legendLayers = legendLayers;
                            }
                            array.forEach(print.templates, function (template) {
                                template.layoutOptions = layoutOptions;
                            });


                        } else {
                            array.forEach(print.templates, function (template) {
                                if (template.layoutOptions && template.layoutOptions.legendLayers) {
                                    template.layoutOptions.legendLayers = [];
                                }

                            });
                        }


                    }));
                }

                require(["application/has-config!print-layouts?esri/request", "application/has-config!print-layouts?esri/tasks/PrintTemplate"], lang.hitch(this, function (esriRequest, PrintTemplate) {
                    if (!esriRequest && !PrintTemplate) {
                        //Use the default print templates 
                        var templates = [{
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label1,
                            format: "PDF"
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label2,
                            format: "PDF"
                        },
                        {
                            layout: "Letter ANSI A Landscape",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label3,
                            format: "PNG32"
                        },
                        {
                            layout: "Letter ANSI A Portrait",
                            layoutOptions: layoutOptions,
                            label: this.config.i18n.tools.print.layouts.label4,
                            format: "PNG32"
                        }];



                        print = new Print({
                            map: this.map,
                            id: "printButton",
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div"));
                        domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();



                        deferred.resolve(true);
                        return;
                    }

                    esriRequest({
                        url: this.config.helperServices.printTask.url,
                        content: {
                            "f": "json"
                        },
                        "callbackParamName": "callback"
                    }).then(lang.hitch(this, function (response) {
                        var layoutTemplate, templateNames, mapOnlyIndex, templates;

                        layoutTemplate = array.filter(response.parameters, function (param, idx) {
                            return param.name === "Layout_Template";
                        });

                        if (layoutTemplate.length === 0) {
                            console.log("print service parameters name for templates must be \"Layout_Template\"");
                            return;
                        }
                        templateNames = layoutTemplate[0].choiceList;

                        // remove the MAP_ONLY template then add it to the end of the list of templates 
                        mapOnlyIndex = array.indexOf(templateNames, "MAP_ONLY");
                        if (mapOnlyIndex > -1) {
                            var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
                            templateNames.push(mapOnly);
                        }

                        // create a print template for each choice
                        templates = array.map(templateNames, function (name) {
                            var plate = new PrintTemplate();
                            plate.layout = plate.label = name;
                            plate.format = "pdf";
                            plate.layoutOptions = layoutOptions;
                            return plate;
                        });


                        print = new Print({
                            map: this.map,
                            templates: templates,
                            url: this.config.helperServices.printTask.url
                        }, domConstruct.create("div")); //domConstruct.create("div",{}),printDiv); 
                        domConstruct.place(print.printDomNode, printDiv, "first");

                        print.startup();
                        deferred.resolve(true);

                    }));
                }));

            }));


            return deferred.promise;
        },
        _addShare: function (tool, toolbar, panelClass) {
            //Add share links for facebook, twitter and direct linking. 
            //Add the measure widget to the toolbar.
            var deferred = new Deferred();

            if (has("share")) {

                var shareDiv = toolbar.createTool(tool, panelClass);

                var shareDialog = new ShareDialog({
                    bitlyLogin: this.config.bitlyLogin,
                    bitlyKey: this.config.bitlyKey,
                    map: this.map,
                    image: this.config.sharinghost + "/sharing/rest/content/items/" + this.config.response.itemInfo.item.id + "/info/" + this.config.response.itemInfo.thumbnail,
                    title: this.config.title,
                    summary: this.config.response.itemInfo.snippet
                }, shareDiv);
                domClass.add(shareDialog.domNode, "pageBody");
                shareDialog.startup();

                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }


            return deferred.promise;

        },
        _getEditableLayers: function (layers) {
            var layerInfos = [];
            array.forEach(layers, lang.hitch(this, function (layer) {

                if (layer && layer.layerObject) {
                    var eLayer = layer.layerObject;
                    if (eLayer instanceof FeatureLayer && eLayer.isEditable()) {
                        layerInfos.push({
                            "featureLayer": eLayer
                        });
                    }
                }
            }));
            return layerInfos;
        },


        _getBasemapGroup: function () {
            //Get the id or owner and title for an organizations custom basemap group. 
            var basemapGroup = null;
            if (this.config.basemapgroup && this.config.basemapgroup.title && this.config.basemapgroup.owner) {
                basemapGroup = {
                    "owner": this.config.basemapgroup.owner,
                    "title": this.config.basemapgroup.title
                };
            } else if (this.config.basemapgroup && this.config.basemapgroup.id) {
                basemapGroup = {
                    "id": this.config.basemapgroup.id
                };
            }
            return basemapGroup;
        },

        _createMapUI: function () {
            // Add map specific widgets like the Home  and locate buttons. Also add the geocoder. 
            if (has("home")) {
                domConstruct.create("div", {
                    id: "panelHome",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnHome'></div>"
                }, dom.byId("panelTools"), 0);
                var home = new HomeButton({
                    map: this.map
                }, dom.byId("btnHome"));

                if (!has("touch")) {
                    //add a tooltip 
                    domAttr.set("btnHome", "data-title", this.config.i18n.tooltips.home);
                } else {
                    //remove no-touch class from body 
                    domClass.remove(document.body, "no-touch");

                }

                home.startup();
            }

            if (has("locate")) {
                domConstruct.create("div", {
                    id: "panelLocate",
                    className: "icon-color tool",
                    innerHTML: "<div id='btnLocate'></div>"
                }, dom.byId("panelTools"), 1);
                var geoLocate = new LocateButton({
                    map: this.map
                }, dom.byId("btnLocate"));
                if (!has("touch")) {
                    //add a tooltip 
                    domAttr.set("btnLocate", "data-title", this.config.i18n.tooltips.locate);
                }


                geoLocate.startup();

            }

            //Add the location search widget 
            require(["application/has-config!search?application/CreateGeocoder"], lang.hitch(this, function (CreateGeocoder) {
                if (!CreateGeocoder) {
                    return;
                }

                var geocoder = new CreateGeocoder({
                    map: this.map,
                    config: this.config
                });
                if (geocoder.geocoder && geocoder.geocoder.domNode) {
                    domConstruct.place(geocoder.geocoder.domNode, "panelGeocoder");
                }
            }));

            //create the tools 
            this._createUI();

        },
        _updateTheme: function () {

            //Set the background color using the configured theme value 
            query(".bg").style("backgroundColor", this.theme.toString());
            query(".esriPopup .pointer").style("backgroundColor", this.theme.toString());
            query(".esriPopup .titlePane").style("backgroundColor", this.theme.toString());


            //Set the font color using the configured color value   
            query(".fc").style("color", this.color.toString());
            query(".esriPopup .titlePane").style("color", this.color.toString());
            query(".esriPopup. .titleButton").style("color", this.color.toString());


            //Set the Slider +/- color to match the icon style. Valid values are white and black
            // White is default so we just need to update if using black. 
            //Also update the menu icon to match the tool color. Default is white. 
            if (this.config.icons === "black") {
                query(".esriSimpleSlider").style("color", "#000");
                query(".icon-color").style("color", "#000");
            }

        },
        _checkExtent: function () {
            var pt = this.map.extent.getCenter();
            if (!this.initExt.contains(pt)) {
                this.map.setExtent(this.mapExt);
            } else {
                this.mapExt = this.map.extent;
            }
        },
        _adjustPopupSize: function () {
            if (!this.map) {
                return;
            }
            var box = domGeometry.getContentBox(this.map.container);

            var width = 270,
                height = 300,
                newWidth = Math.round(box.w * 0.50),
                newHeight = Math.round(box.h * 0.35);
            if (newWidth < width) {
                width = newWidth;
            }
            if (newHeight < height) {
                height = newHeight;
            }
            this.map.infoWindow.resize(width, height);
        },
        _createWebMap: function (itemInfo) {
            // create a map based on the input web map id
            arcgisUtils.createMap(itemInfo, "mapDiv", {
                usePopupManager: true,
                bingMapsKey: this.config.bingKey
            }).then(lang.hitch(this, function (response) {

                this.map = response.map;
                domClass.add(this.map.infoWindow.domNode, "light");
                this._updateTheme();

                //Add a logo if provided
                if (this.config.logo) {
                    domConstruct.create("div", {
                        id: "panelLogo",
                        innerHTML: "<img id='logo' src=" + this.config.logo + "></>"
                    }, dom.byId("panelTitle"), "first");
                }

                //Set the application title
                this.map = response.map;
                //Set the title - use the config value if provided. 
                var title = (this.config.title === null) ? response.itemInfo.item.title : this.config.title;
                this.config.title = title;
                document.title = title;
                dom.byId("panelText").innerHTML = title;
                this.config.response = response;
                window.config = this.config;

                if (this.initExt !== null) {
                    this.map.setExtent(this.initExt);
                }
                this.initExt = this.map.extent;
                on.once(this.map, "extent-change", lang.hitch(this, this._checkExtent));

                this._createMapUI();
                // make sure map is loaded
                if (this.map.loaded) {
                    // do something with the map
                    this._mapLoaded();
                } else {
                    on.once(this.map, "load", lang.hitch(this, function () {
                        // do something with the map
                        this._mapLoaded();
                    }));
                }
            }), this.reportError);
        }
    });
});
