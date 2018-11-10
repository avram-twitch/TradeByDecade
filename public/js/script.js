

let worldMap = new WorldChart();
let distChart = new DistributionChart(0,0);
let trendChart = new TrendChart();

console.log("Loading country name data");
let countryNameData = d3.csv('data/country_names.csv');
countryNameData.then( countryNames => {
    console.log("Loaded country name data");
});

console.log("Loading world json");
d3.json('data/world.json').then( worldJson => {
    console.log("Loaded world json");

    countryNameData.then( countryNames => {
        // create lookup table for id -> name
        let countryNameLookup = [];
        for( let datum of countryNames ) {
            countryNameLookup[datum.id_3char] = datum.name;
        }
        // convert JSon to easily usable format
        let geojson = topojson.feature(worldJson, worldJson.objects.countries);
        let countryData = geojson.features.map(country => {
            return new CountryData(country.type, country.id.toLowerCase(), country.properties, country.geometry, countryNameLookup[country.id.toLowerCase()]);
        });
        console.log(countryData);
        worldMap.loadedWorld(countryData);
        worldMap.createCharts();
    });
});

console.log("Loading trade data");
//d3.json("data/filtered.json").then(filtered => {
d3.json("data/data.json").then(tradeData => {
    console.log("Loaded trade data");
    console.log(tradeData);
    let filtered = tradeData.filter(function(d) {
        return d.year == "1980";
    });
    worldMap.loadedData(filtered);

    let updatePlot = function(countryValue) {
        distChart.update(filtered, countryValue);
        worldMap.selectedCountry(filtered, countryValue);
        trendChart.update(countryValue, '2', tradeData);
    };

    worldMap.addUpdateFunction(updatePlot);

    countryNameData.then( countryNames => {
        console.log("Creating Dropdown Menus");
        createDropdownMenu(countryNames, updatePlot);
    });

    // Select USA by default
    updatePlot("usa");
});
