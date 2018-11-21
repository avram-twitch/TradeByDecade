let worldMap = new WorldChart();
let distChart = new DistributionChart();
let trendChart = new TrendChart();

console.log("Loading country population data");
let countryPopulationData = d3.csv('data/country_populations.csv');
countryPopulationData.then( countryPopulations => {
    console.log("Loaded country population data");
    console.log(countryPopulations);
});

console.log("Loading country name data");
let countryNameData = d3.csv('data/country_names.csv');
countryNameData.then( countryNames => {
    console.log("Loaded country name data");
    distChart.loadCountryNameData(countryNames);
});


console.log("Loading world json");
d3.json('data/world.json').then( worldJson => {
    console.log("Loaded world json");
    countryNameData.then( countryNames => {
        countryPopulationData.then( countryPopulations => {
            // create lookup table for id -> name
            let countryNameLookup = []
            countryPopulations.forEach(element => {
                countryNameLookup[element.geo] = element;
            });
            for( let datum of countryNames ) {
                if( !countryNameLookup[datum.id_3char] ) {
                    countryNameLookup[datum.id_3char] = [];
                }
                countryNameLookup[datum.id_3char].country = datum.name;
            }
            console.log(countryNameLookup);
            // convert JSon to easily usable format
            let geojson = topojson.feature(worldJson, worldJson.objects.countries);
            let countryData = geojson.features.map(country => {
                let id = country.id.toLowerCase();
                let name = "";
                if( countryNameLookup[id] ) {
                    name = countryNameLookup[id]["country"];
                }
                return new CountryData(country.type, id, country.properties, country.geometry, name);
            });
            console.log(countryData);
            worldMap.updatePopulationData(countryNameLookup);
            worldMap.loadedWorld(countryData);
            worldMap.createCharts();
        });
    });
});

let updatePlot = function(countryValue, yearValue, codeValue) {

    d3.json("data/countries/" + countryValue + ".json").then(countryData => {

        d3.json("data/years/" + yearValue + ".json").then(yearData => {
            let filtered = countryData.filter(function(d) {
                return d.year == yearValue;
            });
            worldMap.loadedData(filtered);
            distChart.update(yearData, countryValue);
            worldMap.selected(countryValue, yearValue, codeValue);
            trendChart.update(countryValue, codeValue, countryData);
        });

    });
};

worldMap.addUpdateFunction(updatePlot);

countryNameData.then(countryNames => {
    console.log("Creating Dropdown Menus");
    createDropdownMenu(countryNames, updatePlot);
});

updatePlot("usa", "2000", "1");

//console.log("Loading trade data");
//d3.json("data/countries/usa.json").then(tradeData => {
//    console.log("Loaded trade data");
//    console.log(tradeData);
//    let filtered = tradeData.filter(function(d) {
//        return d.year == "1980";
//    });
//    console.log("Filtered trade data");
//    console.log(filtered);
//    worldMap.loadedData(filtered);
//
//    let updatePlot = function(countryValue) {
//        distChart.update(filtered, countryValue);
//        worldMap.selectedCountry(filtered, countryValue);
//        trendChart.update(countryValue, '2', tradeData);
//    };
//
//    worldMap.addUpdateFunction(updatePlot);
//
//    countryNameData.then( countryNames => {
//        console.log("Creating Dropdown Menus");
//        createDropdownMenu(countryNames, updatePlot);
//    });
//
//    // Select USA by default
//    updatePlot("usa");
//});
//
//console.log("Loading year data");
//d3.json("data/years/1980.json").then(yearData => {
//    console.log(yearData);
//    distChart.update(yearData, 'usa');
//});
