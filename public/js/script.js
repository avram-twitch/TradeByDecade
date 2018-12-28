let worldMap = new WorldChart();
let distChart = new DistributionChart();
let trendChart = new TrendChart();
let dropdownMenu = new CountryDropdown();
let yearBar = new YearBar();

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
    trendChart.loadCountryNameData(countryNames);
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

let yearDataCache = [];
let countryDataCache = [];

let updatePlot = async function(countryValue, yearValue, codeValue) {
    
    if(!countryDataCache[countryValue]) {
        console.log("Loading country " + countryValue);
        countryDataCache[countryValue] = await d3.json("data/countries/" + countryValue + ".json");
    }
    if(!yearDataCache[yearValue]) {
        console.log("Loading year " + yearValue);
        yearDataCache[yearValue] = await d3.json("data/years/" + yearValue + ".json");
    }

    let filtered = countryDataCache[countryValue].filter(function(d) {
        return d.year == yearValue;
    });
    worldMap.loadedData(filtered);
    yearBar.selectedCode = codeValue;
    yearBar.year = yearValue;
    yearBar.selectedCountry = countryValue;
    distChart.year = yearValue;
    distChart.selectedCode = codeValue;
    distChart.update(yearDataCache[yearValue], filtered, countryValue);
    yearBar.updateBar(yearValue);
    worldMap.selected(countryValue, yearValue, codeValue);
    trendChart.update(countryValue, codeValue, countryDataCache[countryValue], yearValue);
    dropdownMenu.update(countryValue, yearValue, codeValue);
};

let changePerCapita = function(type) {
    distChart.type = type;
    distChart.updatePerCapita();
};

worldMap.addUpdateFunction(updatePlot);
yearBar.addUpdateFunction(updatePlot);
distChart.addUpdateFunction(updatePlot);
dropdownMenu.addUpdateFunction(updatePlot);
trendChart.addUpdateFunction(updatePlot);

worldMap.addChangePerCapitaFunction(changePerCapita);

countryNameData.then(countryNames => {
    console.log("Creating Dropdown Menus");
    dropdownMenu.createDropdown(countryNames);
});

updatePlot("usa", "2000", "all");

