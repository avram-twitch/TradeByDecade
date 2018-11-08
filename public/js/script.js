//d3.json("data/filtered.json").then(data => {
d3.json("data/data.json").then(data => {
    console.log(data);
    let distChart = new DistributionChart(0,0);
    let filtered = data.filter(function(d) {
        return d.year == "1980";
    });
    distChart.update(filtered);
});

d3.json('data/world.json').then(mapData => {
    let worldMap = new WorldChart();
    worldMap.createCharts(mapData);
});
