
console.log("Creating Dropdown Menus");

console.log("Loading world json");
let worldMap = new WorldChart();
let distChart = new DistributionChart(0,0);

d3.json('data/world.json').then( worldJson => {
    worldMap.loadedWorld(worldJson);
    worldMap.createCharts();
});

console.log("Loading trade data");
//d3.json("data/filtered.json").then(filtered => {
d3.json("data/data.json").then(tradeData => {
    console.log(tradeData);
    let filtered = tradeData.filter(function(d) {
        return d.year == "1980";
    });
    worldMap.loadedData(filtered);

    let updatePlot = function(countryValue) {
        distChart.update(filtered, countryValue);
        worldMap.selectedCountry(filtered, countryValue);
    };

    worldMap.addUpdateFunction(updatePlot);

    d3.csv('data/country_names.csv').then( countryNames => {
        createDropdownMenu(countryNames, updatePlot);
    });

    // Select USA by default
    updatePlot("usa");
});
