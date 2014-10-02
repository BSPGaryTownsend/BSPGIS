define([
    "dojo/ready",
    "dojo/_base/lang",
    "dojo/_base/declare"],
    function (ready,
        lang,
        declare) {
        return declare(null, {
            icons: {
                Park: { map: "/images/mapicons/forest.png", side: "/images/sideicons/forest.png" },
                Library: { map: "/images/mapicons/library.png", side: "/images/sideicons/library.png" },
                Police: { map: "/images/mapicons/police.png", side: "/images/sideicons/police.png" },
                Fire: { map: "/images/mapicons/firemen.png", side: "/images/sideicons/firemen.png" },
                Public_School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Visitor_Info: { map: "/images/mapicons/information.png", side: "/images/sideicons/information.png" },
                Off_Leash_Dog_Area: { map: "/images/mapicons/dogs_leash.png", side: "/images/sideicons/dogs_leash.png" },
                Social_Dev_Ctr: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },//not sure
                Hospital: { map: "/images/mapicons/hospital-building.png", side: "/images/sideicons/hospital-building.png" },
                Art_Centre: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },//not sure
                Athletic_Park: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                EMS_Station: { map: "/images/mapicons/ambulance.png", side: "/images/sideicons/ambulance.png" },
                Hazardous_Goods_Drop: { map: "/images/mapicons/recycle.png", side: "/images/sideicons/recycle.png" },
                PHS_Clinic: { map: "/images/mapicons/doctor.png", side: "/images/sideicons/doctor.png" },
                Spray_Park: { map: "/images/mapicons/waterpark.png", side: "/images/sideicons/waterpark.png" },
                Pool: { map: "/images/mapicons/swimming.png", side: "/images/sideicons/swimming.png" },
                Court: { map: "/images/mapicons/court.png", side: "/images/sideicons/court.png" },
                Cemetery: { map: "/images/mapicons/cemetary.png", side: "/images/sideicons/cemetary.png" },
                Golf_Course: { map: "/images/mapicons/golfing.png", side: "/images/sideicons/golfing.png" },
                Community_Centre: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                Senior_Center: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                Private_School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Catholic_School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Landfill: { map: "/images/mapicons/landfill.png", side: "/images/sideicons/landfill.png" },
                Post_Secondary: { map: "/images/mapicons/cramschool.png", side: "/images/sideicons/cramschool.png" },
                Other_School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Leisure_Centre: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                ECS_Private: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Public_Toilet: { map: "/images/mapicons/toilets.png", side: "/images/sideicons/toilets.png" },
                Arena: { map: "/images/mapicons/stadium.png", side: "/images/sideicons/stadium.png" },
                Separate_School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Recreation_Facility: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                Attraction: { map: "/images/mapicons/notvisited.png", side: "/images/sideicons/notvisited.png" },
                Recycle_Depot: { map: "/images/mapicons/recycle.png", side: "/images/sideicons/recycle.png" }
                /*
                 New Categories not ready yet for consumption.
                School: { map: "/images/mapicons/school.png", side: "/images/sideicons/school.png" },
                Hospital: { map: "/images/mapicons/hospital-building.png", side: "/images/sideicons/hospital-building.png" },
                Community_Center: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                Waste_Disposal: { map: "/images/mapicons/landfill.png", side: "/images/sideicons/landfill.png" },
                Park: { map: "/images/mapicons/forest.png", side: "/images/sideicons/forest.png" },
                Library: { map: "/images/mapicons/library.png", side: "/images/sideicons/library.png" },
                Ambulance: { map: "/images/mapicons/ambulance.png", side: "/images/sideicons/ambulance.png" },
                Water_Park: { map: "/images/mapicons/waterpark.png", side: "/images/sideicons/waterpark.png" },
                Sports_Field: { map: "/images/mapicons/soccer.png", side: "/images/sideicons/soccer.png" },
                Fire: { map: "/images/mapicons/firemen.png", side: "/images/sideicons/firemen.png" },
                Legal_Services: { map: "/images/mapicons/court.png", side: "/images/sideicons/court.png" },
                Golf: { map: "/images/mapicons/golfing.png", side: "/images/sideicons/golfing.png" },
                Pool: { map: "/images/mapicons/swimming.png", side: "/images/sideicons/swimming.png" },
                Pet_Park: { map: "/images/mapicons/dogs_leash.png", side: "/images/sideicons/dogs_leash.png" },
                Cemetery: { map: "/images/mapicons/cemetary.png", side: "/images/sideicons/cemetary.png" },
                Community_Centre: { map: "/images/mapicons/communitycentre.png", side: "/images/sideicons/communitycentre.png" },
                Police: { map: "/images/mapicons/police.png", side: "/images/sideicons/police.png" },
                Post_Secondary: { map: "/images/mapicons/cramschool.png", side: "/images/sideicons/cramschool.png" },
                Public_Toilet: { map: "/images/mapicons/toilets.png", side: "/images/sideicons/toilets.png" },
                Arena: { map: "/images/mapicons/stadium.png", side: "/images/sideicons/stadium.png" },
                Attraction: { map: "/images/mapicons/notvisited.png", side: "/images/sideicons/notvisited.png" },
                Recycle_Depot: { map: "/images/mapicons/recycle.png", side: "/images/sideicons/recycle.png" }*/
            },
            replaceAll: function (string, find, replace) {
                return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
            },
            escapeRegExp: function (string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
        })
    });