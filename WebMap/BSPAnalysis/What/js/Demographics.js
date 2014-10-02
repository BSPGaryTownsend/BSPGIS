define(["dojo/ready",
    "dojo/json",
    "dojo/_base/array",
    "dojo/_base/Color",
    "dojo/_base/declare",
    "dojo/_base/lang"],
    function (ready, JSON, array, Color, declare, lang) {
        return declare(null, {
            population: [
                { varName: "ECYPT04", varClass: "population", varDescription: "2013 Total population 0‐4", varClassGrouping: 1, varGroupLabel: "0-14" },
                { varName: "ECYPT59", varClass: "population", varDescription: "2013 Total population 5‐9", varClassGrouping: 1, varGroupLabel: "0-14" },
                { varName: "ECYPT1014", varClass: "population", varDescription: "2013 Total population 10‐14", varClassGrouping: 1, varGroupLabel: "0-14" },
                { varName: "ECYPT1519", varClass: "population", varDescription: "2013 Total population 15‐19", varClassGrouping: 2, varGroupLabel: "15-24" },
                { varName: "ECYPT2024", varClass: "population", varDescription: "2013 Total population 20-24", varClassGrouping: 2, varGroupLabel: "15-24" },
                { varName: "ECYPT2529", varClass: "population", varDescription: "2013 Total population 25-29", varClassGrouping: 3, varGroupLabel: "25-34" },
                { varName: "ECYPT3034", varClass: "population", varDescription: "2013 Total population 30‐34", varClassGrouping: 3, varGroupLabel: "25-34" },
                { varName: "ECYPT3539", varClass: "population", varDescription: "2013 Total population 35‐39", varClassGrouping: 4, varGroupLabel: "35-44" },
                { varName: "ECYPT4044", varClass: "population", varDescription: "2013 Total population 40‐44", varClassGrouping: 4, varGroupLabel: "35-44" },
                { varName: "ECYPT4549", varClass: "population", varDescription: "2013 Total population 45‐49", varClassGrouping: 5, varGroupLabel: "45-54" },
                { varName: "ECYPT5054", varClass: "population", varDescription: "2013 Total population 50‐54", varClassGrouping: 5, varGroupLabel: "45-54" },
                { varName: "ECYPT5559", varClass: "population", varDescription: "2013 Total population 55‐59", varClassGrouping: 6, varGroupLabel: "55-64" },
                { varName: "ECYPT6064", varClass: "population", varDescription: "2013 Total population 60‐64", varClassGrouping: 6, varGroupLabel: "55-64" },
                { varName: "ECYPT6569", varClass: "population", varDescription: "2013 Total population 65‐69", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT6064", varClass: "population", varDescription: "2013 Total population 60‐64", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT6569", varClass: "population", varDescription: "2013 Total population 65‐69", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT7074", varClass: "population", varDescription: "2013 Total population 70‐74", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT7579", varClass: "population", varDescription: "2013 Total population 75‐79", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT8084", varClass: "population", varDescription: "2013 Total population 80‐84", varClassGrouping: 7, varGroupLabel: "65+" },
                { varName: "ECYPT85P", varClass: "population", varDescription: "2013 Total population 85+", varClassGrouping: 7, varGroupLabel: "65+" }
            ],
            marital:[
                { varName: "ECYMSCOML", varClass: "marital", varDescription: "2013 Pop 15+: Living common law", varClassGrouping: 1, varGroupLabel: "Living common law" },
                { varName: "ECYMSDIV", varClass: "marital", varDescription: "2013 Pop 15+: Divorced", varClassGrouping: 2, varGroupLabel: "Divorced" },
                { varName: "ECYMSLMAR", varClass: "marital", varDescription: "2013 Pop 15+: Married (and not separated)", varClassGrouping: 3, varGroupLabel: "Married (and not separated)" },
                { varName: "ECYMSNMNCL", varClass: "marital", varDescription: "2013 Pop 15+: Not married, not living with a common‐law partner", varClassGrouping: 4, varGroupLabel: "Not married, not living with a common‐law partner" },
                { varName: "ECYMSSINGL", varClass: "marital", varDescription: "2013 Pop 15+: Single (never legally married)", varClassGrouping: 5, varGroupLabel: "Single (never legally married)" },
                { varName: "ECYMSWID", varClass: "marital", varDescription: "2013 Pop 15+: Widowed", varClassGrouping: 6, varGroupLabel: "Widowed" },
                { varName: "ECYMSSEP", varClass: "marital", varDescription: "2013 Pop 15+: Separated", varClassGrouping: 7, varGroupLabel: "Separated" }
            ],
            occupation:[
                { varName: "ECYOCMGMT", varClass: "occupation", varDescription: "2013 A Management occupations", varClassGrouping: 1, varGroupLabel: "Management" },
                { varName: "ECYOCBFA", varClass: "occupation", varDescription: "2013 B Business, finance and admin", varClassGrouping: 2, varGroupLabel: "Business" },
                { varName: "ECYOCSCI", varClass: "occupation", varDescription: "2013 C Natural and appl sci and related", varClassGrouping: 3, varGroupLabel: "Science" },
                { varName: "ECYOCHEA", varClass: "occupation", varDescription: "2013 D Health ", varClassGrouping: 4, varGroupLabel: "Health" },
                { varName: "ECYOCPUBL", varClass: "occupation", varDescription: "2013 E Soc sci, educ, govt serv and relig ", varClassGrouping: 5, varGroupLabel: "Public" },
                { varName: "ECYOCCULT", varClass: "occupation", varDescription: "2013 F Art, culture, rec and sport", varClassGrouping: 6, varGroupLabel: "Art and Sports" },
                { varName: "ECYOCSERV", varClass: "occupation", varDescription: "2013 G Sales and service EA 2013", varClassGrouping: 7, varGroupLabel: "Sales and service" },
                { varName: "ECYOCTRADE", varClass: "occupation", varDescription: "2013 H Trades, transport/equip operators and related", varClassGrouping: 8, varGroupLabel: "Trades" },
                { varName: "ECYOCPRIMY", varClass: "occupation", varDescription: "2013 I Primary industry", varClassGrouping: 9, varGroupLabel: "Primary industry" },
                { varName: "ECYOCSCNDY", varClass: "occupation", varDescription: " 2013 J Processing, manuf and utils", varClassGrouping: 10, varGroupLabel: "Manf. and utils" }
            ],
            income:[
                { varName: "ECYHI0_10", varClass: "income", varDescription: "2013 Households w/inc 0‐9999", varClassGrouping: 1, varGroupLabel: "0‐10" },
                { varName: "ECYHI10_20", varClass: "income", varDescription: "2013 Households w/inc 10000‐19999", varClassGrouping: 2, varGroupLabel: "10‐20" },
                { varName: "ECYHI20_30", varClass: "income", varDescription: "2013 Households w/inc 20000‐29999", varClassGrouping: 3, varGroupLabel: "20‐30" },
                { varName: "ECYHI30_40", varClass: "income", varDescription: "2013 Households w/inc 30000‐39999", varClassGrouping: 4, varGroupLabel: "30‐40" },
                { varName: "ECYHI40_50", varClass: "income", varDescription: "2013 Households w/inc 40000‐49999", varClassGrouping: 5, varGroupLabel: "40‐50" },
                { varName: "ECYHI50_60", varClass: "income", varDescription: "2013 Households w/inc 50000‐59999", varClassGrouping: 6, varGroupLabel: "50‐60" },
                { varName: "ECYHI60_70", varClass: "income", varDescription: "2013 Households w/inc 60000‐69999", varClassGrouping: 7, varGroupLabel: "60‐70" },
                { varName: "ECYHI70_80", varClass: "income", varDescription: "2013 Households w/inc 70000‐79999", varClassGrouping: 8, varGroupLabel: "70‐80" },
                { varName: "ECYHI80_90", varClass: "income", varDescription: "2013 Households w/inc 80000‐89999", varClassGrouping: 9, varGroupLabel: "80‐90" },
                { varName: "ECYHI90100", varClass: "income", varDescription: "2013 Households w/inc 90000‐99999", varClassGrouping: 10, varGroupLabel: "90‐100" },
                { varName: "ECYHI10025", varClass: "income", varDescription: "2013 Households w/inc 100000‐124999", varClassGrouping: 11, varGroupLabel: "100‐125" },
                { varName: "ECYHI12550", varClass: "income", varDescription: "2013 Households w/inc 125000‐149999", varClassGrouping: 12, varGroupLabel: "125‐150" },
                { varName: "ECYHI15075", varClass: "income", varDescription: "2013 Households w/inc 150000‐174999", varClassGrouping: 13, varGroupLabel: "150‐175" },
                { varName: "ECYHI17500", varClass: "income", varDescription: "2013 Households w/inc 175000‐199999", varClassGrouping: 14, varGroupLabel: "175‐200" },
                { varName: "ECYHI20050", varClass: "income", varDescription: "2013 Households w/inc 200000‐249999", varClassGrouping: 15, varGroupLabel: "200‐250" },
                { varName: "ECYHI250_", varClass: "income", varDescription: "2013 Households w/inc 250000+", varClassGrouping: 16, varGroupLabel: "250+" },
            ],
            children:[
                { varName: "ECYFSTLP1C", varClass: "children", varDescription: "2013 Lone‐parent fams: 1 child", varClassGrouping: 1, varGroupLabel: "1", varSeries: 'Single Parent Families' },
                { varName: "ECYFSTLP2C", varClass: "children", varDescription: "2013 Lone‐parent fams: 2 children", varClassGrouping: 2, varGroupLabel: "2", varSeries: 'Single Parent Families' },
                { varName: "ECYFSTLP3C", varClass: "children", varDescription: "2013 Lone‐parent fams: 3+ children", varClassGrouping: 3, varGroupLabel: "3+", varSeries: 'Single Parent Families' },
                { varName: "ECYFSCOU1C", varClass: "children", varDescription: "2013 Couple fams: 1 child", varClassGrouping: 1, varGroupLabel: "1", varSeries: 'Couple Parent Families' },
                { varName: "ECYFSCOU2C", varClass: "children", varDescription: "2013 Couple fams: 2 children", varClassGrouping: 2, varGroupLabel: "2", varSeries: 'Couple Parent Families' },
                { varName: "ECYFSCOU3C", varClass: "children", varDescription: "2013 Couple fams: 3+ children", varClassGrouping: 3, varGroupLabel: "3+", varSeries: 'Couple Parent Families' },
            ],
            language:[
                { varName: "ECYMTABOR", varClass: "language", varDescription: "2013 MT: Aboriginal languages", varClassGrouping: 1, varGroupLabel: "Aboriginal" },
                { varName: "ECYMTARAB", varClass: "language", varDescription: "2013 MT: Arabic", varClassGrouping: 2, varGroupLabel: "Arabic" },
                { varName: "ECYMTBENG", varClass: "language", varDescription: "2013 MT: Bengali", varClassGrouping: 3, varGroupLabel: "Bengali" },
                { varName: "ECYMTCANT", varClass: "language", varDescription: "2013 MT: Cantonese ", varClassGrouping: 4, varGroupLabel: "Cantonese" },
                { varName: "ECYMTCHIO", varClass: "language", varDescription: "2013 MT: Chinese n.o.s ", varClassGrouping: 5, varGroupLabel: "Chinese" },
                { varName: "ECYMTCREO", varClass: "language", varDescription: "2013 MT: Creoles ", varClassGrouping: 6, varGroupLabel: "Creoles" },
                { varName: "ECYMTCROA", varClass: "language", varDescription: "2013 MT: Croatian ", varClassGrouping: 7, varGroupLabel: "Croatian" },
                { varName: "ECYMTCZEC", varClass: "language", varDescription: "2013 MT: Czech ", varClassGrouping: 8, varGroupLabel: "Czech" },
                { varName: "ECYMTDUTC", varClass: "language", varDescription: "2013 MT: Dutch ", varClassGrouping: 9, varGroupLabel: "Dutch" },
                { varName: "ECYMTENGL", varClass: "language", varDescription: "2013 MT: English ", varClassGrouping: 10, varGroupLabel: "English" },
                { varName: "ECYMTFREN", varClass: "language", varDescription: "2013 MT: French ", varClassGrouping: 11, varGroupLabel: "French" },
                { varName: "ECYMTGERM", varClass: "language", varDescription: "2013 MT: German ", varClassGrouping: 12, varGroupLabel: "German" },
                { varName: "ECYMTGREE", varClass: "language", varDescription: "2013 MT: Greek ", varClassGrouping: 13, varGroupLabel: "Greek" },
                { varName: "ECYMTGUJA", varClass: "language", varDescription: "2013 MT: Gujarati ", varClassGrouping: 14, varGroupLabel: "Gujarati" },
                { varName: "ECYMTHIND", varClass: "language", varDescription: "2013 MT: Hindi ", varClassGrouping: 15, varGroupLabel: "Hindi" },
                { varName: "ECYMTHUNG", varClass: "language", varDescription: "2013 MT: Hungarian ", varClassGrouping: 16, varGroupLabel: "Hungarian" },
                { varName: "ECYMTITAL", varClass: "language", varDescription: "2013 MT: Italian ", varClassGrouping: 17, varGroupLabel: "Italian" },
                { varName: "ECYMTJAPA", varClass: "language", varDescription: "2013 MT: Japanese ", varClassGrouping: 18, varGroupLabel: "Japanese" },
                { varName: "ECYMTKORE", varClass: "language", varDescription: "2013 MT: Korean ", varClassGrouping: 19, varGroupLabel: "Korean" },
                { varName: "ECYMTMAND", varClass: "language", varDescription: "2013 MT: Mandarin ", varClassGrouping: 20, varGroupLabel: "Mandarin" },
                { varName: "ECYMTOTH", varClass: "language", varDescription: "2013 MT: Other Languages ", varClassGrouping: 21, varGroupLabel: "Other Languages" },
                { varName: "ECYMTPERS", varClass: "language", varDescription: "2013 MT: Persian  ", varClassGrouping: 22, varGroupLabel: "Persian" },
                { varName: "ECYMTPOLI", varClass: "language", varDescription: "2013 MT: Polish ", varClassGrouping: 23, varGroupLabel: "Polish" },
                { varName: "ECYMTPORT", varClass: "language", varDescription: "2013 MT: Portuguese ", varClassGrouping: 24, varGroupLabel: "Portuguese" },
                { varName: "ECYMTPUNJ", varClass: "language", varDescription: "2013 MT: Punjabi ", varClassGrouping: 25, varGroupLabel: "Punjabi" },
                { varName: "ECYMTROMA", varClass: "language", varDescription: "2013 MT: Romanian ", varClassGrouping: 26, varGroupLabel: "Romanian" },
                { varName: "ECYMTRUSS", varClass: "language", varDescription: "2013 MT: Russian ", varClassGrouping: 27, varGroupLabel: "Russian" },
                { varName: "ECYMTSERB", varClass: "language", varDescription: "2013 MT: Serbian ", varClassGrouping: 28, varGroupLabel: "Serbian" },
                { varName: "ECYMTSOMA", varClass: "language", varDescription: "2013 MT: Somali ", varClassGrouping: 29, varGroupLabel: "Somali" },
                { varName: "ECYMTSPAN", varClass: "language", varDescription: "2013 MT: Spanish ", varClassGrouping: 30, varGroupLabel: "Spanish" },
                { varName: "ECYMTTAGA", varClass: "language", varDescription: "2013 MT: Tagalog ", varClassGrouping: 31, varGroupLabel: "Tagalog" },
                { varName: "ECYMTTAMI", varClass: "language", varDescription: "2013 MT: Tamil ", varClassGrouping: 32, varGroupLabel: "Tamil" },
                { varName: "ECYMTTURK", varClass: "language", varDescription: "2013 MT: Turkish ", varClassGrouping: 33, varGroupLabel: "Turkish" },
                { varName: "ECYMTUKRA", varClass: "language", varDescription: "2013 MT: Ukrainian ", varClassGrouping: 34, varGroupLabel: "Ukrainian" },
                { varName: "ECYMTURDU", varClass: "language", varDescription: "2013 MT: Urdu ", varClassGrouping: 35, varGroupLabel: "Urdu" },
                { varName: "ECYMTVIET", varClass: "language", varDescription: "2013 MT: Vietnamese ", varClassGrouping: 36, varGroupLabel: "Vietnamese" },
            ],
            categories: [
                "population",
                "marital",
                "occupation",
                "income",
                "children",
                "language"
            ],
            sortValues: function (a, b) {
                if (a.value > b.value)
                    return -1;
                if (a.value < b.value)
                    return 1;
                return 0;
            },
            sortY: function (a, b) {
                if (a.y > b.y)
                    return -1;
                if (a.y < b.y)
                    return 1;
                return 0;
            }
        });

    });