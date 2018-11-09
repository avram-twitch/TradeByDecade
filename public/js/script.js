
console.log("Loading world json");
let worldMap = new WorldChart();
d3.json('data/world.json').then( worldJson => {
    worldMap.loadedWorld(worldJson);
    worldMap.createCharts();
});

console.log("Loading trade data");
//d3.json("data/filtered.json").then(allData => {
d3.json("data/data.json").then(tradeData => {
    console.log(tradeData);
    let distChart = new DistributionChart(0,0);
    let filtered = tradeData.filter(function(d) {
        return d.year == "1980";
    });
    distChart.update(filtered);

    worldMap.loadedData(filtered);
});