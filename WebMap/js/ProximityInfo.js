define([
        'dojo/Evented',
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/_base/Color',
        'dojo/dom',
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/number',
        "dojo/currency",
        'dojo/date/locale',
        'dojo/on',
        'esri/geometry/mathUtils',
        'esri/graphic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/Font',
        'esri/symbols/TextSymbol',
        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'application/bspIcons'
], function (
	     Evented,
        declare,
        array,
        lang,
        Color,
        dom,
        domClass,
        domConstruct,
        domStyle,
        number,
        localeCurrency,
        locale,
        on,
        mathUtils,
        Graphic,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Font,
        TextSymbol,
        Query,
        QueryTask,
        bspIcons
) {

    var proximityInfo = declare('ProximityInfo', [Evented], {

        config: null,
        map: null,
        fields: [],
        infoTemplate: null,
        location: null,
        container: null,
        pageObj: null,

        constructor: function (config) {
            this.config = config;
        },

        // update for location
        updateForLocation: function (location, container, pageObj) {
            this.location = location;
            this.container = container;
            this.container.innerHTML = "<br/><br/><img src='images/ajax-loader.gif'/>";
            this.pageObj = pageObj;

            var layer = pageObj.layer;
            var layerType = pageObj.layerType;
            this.fields = this.getFields(layer);
            this.infoTemplate = layer.infoTemplate;

            if (layerType == "Feature Layer") {
                this.queryFeatures();
            } else {
                this.filterFeatures();
            }
        },

        // query features
        queryFeatures: function () {
            var layer = this.pageObj.layer;
            var query = new Query();
            query.returnGeometry = true;
            query.geometry = this.pageObj.buffer;
            var me = this;
            layer.queryFeatures(query, lang.hitch(me, me.resultsHandler), lang.hitch(me, me.errorHandler));
        },

        // filter features
        filterFeatures: function () {
            var buffer = this.pageObj.buffer;
            var layer = this.pageObj.layer;
            var features = [];
            for (var i = 0; i < layer.graphics.length; i++) {
                var gra = layer.graphics[i];
                var geom = gra.geometry;
                var pt = geom;
                if (geom.type != "point")
                    pt = this.getPointForGeometry(geom);
                if (buffer.contains(pt)) {
                    features.push(gra);
                }
            }
            this.resultsHandler({ features: features });
        },


        // results handler
        resultsHandler: function (results) {

            this.container.innerHTML = "";

            var proximityFeatures = [];
            var features = results.features;
            var categorizedList = {};
            if (features.length > 0) {
                
                // process features
                for (var i = 0; i < features.length; i++) {
                    var gra = features[i];

                    var geom = gra.geometry;
                    var pt = geom;
                    if (geom.type != "point")
                        pt = this.getPointForGeometry(geom);
                    var dist = this.getDistance(pt);
                    var newAttr = { DISTANCE: dist, POINT_LOCATION: pt };
                    for (var f = 0; f < this.fields.length; f++) {
                        newAttr[this.fields[f]] = gra.attributes[this.fields[f]];
                    }
                    gra.setAttributes(newAttr);
                    gra.setInfoTemplate(this.infoTemplate);
                    if (gra.attributes.TYPE != undefined) {
                        if (!categorizedList.hasOwnProperty(gra.attributes.TYPE)) {
                            categorizedList[gra.attributes.TYPE] = [];
                        }
                        proximityFeatures.push(gra);
                        categorizedList[gra.attributes.TYPE].push(gra);
                    }else{
                        proximityFeatures.push(gra);
                    }
                }
                // create content
                var content = domConstruct.create("div", {
                    //class: "resultsContent"
                }, this.container);
                domClass.add(content, 'resultsContent');
                if (results.features[0].attributes.TYPE != undefined) {
                    for (var cat in categorizedList) {
                        
                        var catItem = domConstruct.create("div", {
                            innerHTML:null
                        }
                            , content);
                        var catHeader = domConstruct.create("div", {
                            innerHTML: cat + ' [' + (categorizedList[cat].length).toString() + ']'
                        },catItem);
                        domClass.add(catHeader, "catHeader");
                        domClass.add(catItem, "bg");
                        domClass.add(catItem, "pageTypeHeader");
                        //catItem.innerHTML = "a";
                        this.createList(categorizedList[cat], catItem);
                    }
                } else {
                    this.createList(proximityFeatures,content);
                }
            }
            dom.byId("pageCounter_" + this.pageObj.id).innerHTML = proximityFeatures.length;
            this.emit('updated', { data: proximityFeatures });
        },
        createList:function(proximityFeatures,content){


                    // sort by distance
                proximityFeatures.sort(this.compareDistance);




                for (var i = 0; i < proximityFeatures.length; i++) {
                    var feature = proximityFeatures[i];
                    var geom = feature.geometry;
                    var dist = feature.attributes.DISTANCE;
                    var pt = feature.attributes.POINT_LOCATION;
                    var attr = feature.attributes;

                    var num = i + 1;

                    var rec = domConstruct.create("div", {
                        //class: "recProximity"
                    }, content);
                    domClass.add(rec, 'recProximity');
                    var recLeftNum = domConstruct.create("div", {
                        //class: "recLeftNum"
                    }, rec);
                    domClass.add(recLeftNum, 'recLeftNum');
                    var recNum; 

                    if (attr.hasOwnProperty("num_bedrooms") && attr.hasOwnProperty("business_type")) {
                        switch (attr.business_type) {
                            case 'private':
                                recNum = domConstruct.create("div", {
                                    //class: "recNum",
                                    style: "background-image: url(\"/images/rmd_private.png\")",// + this.pageObj.color,
                                    innerHTML: attr.num_bedrooms
                                }, recLeftNum);
                                domClass.add(recNum, 'recNum');
                                break;
                            case 'commercial':
                                recNum = domConstruct.create("div", {
                                    //class: "recNum",
                                    style:  "background-image: url(\"/images/rmd_commercial.png\")",// + this.pageObj.color,
                                    innerHTML: attr.num_bedrooms
                                }, recLeftNum);
                                domClass.add(recNum, 'recNum');
                                break;
                        }
                        
                    } else {
                        if (attr.hasOwnProperty("TYPE")) {
                            var iconFile = new bspIcons();
                            var type = iconFile.replaceAll(attr.TYPE, " ", "_");
                            //iconFile.icons[type].side
                            recNum = domConstruct.create("div", {
                                //class: "recNum",
                                style: "background-image: url(\"" + iconFile.icons[type].side + "\")",
                                innerHTML: null
                            }, recLeftNum);
                            domClass.add(recNum, 'iconrecNum');
                        } else {
                            recNum = domConstruct.create("div", {
                                //class: "recNum",
                                style: "background-color:" + this.pageObj.color,
                                innerHTML: num
                            }, recLeftNum);
                            domClass.add(recNum, 'recNum');
                        }
                    }
                    

                    on(recNum, "click", lang.hitch(this, this.zoomToLocation, pt));
                    var recInfo = domConstruct.create("div", {
                        //class: "recInfo"
                    }, rec);
                    domClass.add(recInfo, 'recInfo');
                    var infoDist = "";
                    if (geom.type == "point" && this.config.showDirections)
                        infoDist += "<img src='images/car.png' /> ";
                    infoDist += Math.round(dist * 100) / 100 + " " + this.config.distanceUnits.toUpperCase() + "<br/>";
                    var recDistance = domConstruct.create("span", {
                        //class: "recDistance",
                        innerHTML: infoDist
                    }, recInfo);
                    domClass.add(recDistance, 'recDistance');
                    if (geom.type == "point")
                        on(recDistance, "click", lang.hitch(this, this.routeToLocation, pt));
                    var recInfoText = domConstruct.create("span", {
                        innerHTML: this.getInfo(feature)
                    }, recInfo);
                }
                //console.log(categorizedList)

            

        },

        // error handler
        errorHandler: function (error) {
            this.container.innerHTML = "";
            var div = domConstruct.create("div", {
                innerHTML: error.message
            }, this.container);
            this.emit('updated', { data: null });
        },

        // get point for geometry
        getPointForGeometry: function (geom) {
            if (geom.type == "polygon")
                return geom.getCentroid();
            if (geom.type == "polyline") {
                var pathNum = Math.floor(geom.paths.length / 2);
                var ptNum = Math.floor(geom.paths[pathNum].length / 2);
                var coords = geom.getPoint(pathNum, ptNum);
                return geom.getPoint(pathNum, ptNum);
            }
            return geom.getExtent().getCenter();
        },

        // getFields
        getFields: function (layer) {
            var fields = [];
            if (layer.infoTemplate) {
                var fldInfos = layer.infoTemplate.info.fieldInfos;
                for (var i = 0; i < fldInfos.length; i++) {
                    var fld = fldInfos[i];
                    if (fld.visible)
                        fields.push(fld.fieldName);
                }
            } else {
                var fldTypes = "esriFieldTypeSmallInteger,esriFieldTypeInteger,esriFieldTypeSingle,esriFieldTypeDouble,esriFieldTypeString";
                for (var i = 0; i < layer.fields.length; i++) {
                    var fld = layer.fields[i];
                    var type = fld.type;
                    if (fldTypes.indexOf(type) > -1) {
                        fields.push[fld];
                    }
                }
            }
            return fields;
        },

        // get info
        getInfo: function (gra) {
            var attr = gra.attributes;
            var info = "";
            var c = 0;
            for (var prop in attr) {
                if (prop != "DISTANCE" && prop != "POINT_LOCATION" && c < 3) {
                    if (prop.indexOf("timestamp") != -1) {
                        var dat = new Date(attr[prop]);
                        info += locale.format(dat, { datePattern: "MMM d y" }) + "<br/>";
                    } else {
                        if (prop.indexOf("amount") != -1) {
                            info += localeCurrency.format(attr[prop], { currency: "USD" }) + "<br/>";
                        } else {
                            info += attr[prop] + "<br/>";
                        }
                    }
                    c += 1;
                }
            }
            return info;
        },

        // get distance
        getDistance: function (loc) {
            var dist = 0;
            dist = mathUtils.getLength(this.location, loc) * 0.000621371;
            if (this.config.distanceUnits == "kilometers")
                dist = dist * 1.60934;
            return dist;
        },

        // zoom to location
        zoomToLocation: function (loc) {
            this.map.centerAndZoom(loc, this.config.defaultZoomLevel || 14);
        },

        // route to location
        routeToLocation: function (loc) {
            if (this.config.showDirections)
                this.emit('route', { data: loc });
        },

        // compare distance
        compareDistance: function (a, b) {
            if (a.attributes.DISTANCE < b.attributes.DISTANCE)
                return -1;
            if (a.attributes.DISTANCE > b.attributes.DISTANCE)
                return 1;
            return 0;
        }

    });

    return proximityInfo;

});