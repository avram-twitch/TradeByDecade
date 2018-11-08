
loadData().then(allData => {
    console.log(allData);
    let distChart = new DistributionChart(0,0);
    let filtered = allData.tradeData.filter(function(d) {
        return d.year == "1980";
    });
    distChart.update(filtered);

    let worldMap = new WorldChart();
    worldMap.createCharts(allData.worldJson);
});

async function loadData() {
    //let tradeData = await d3.json("data/filtered.json");
    let tradeData = await d3.json("data/data.json");
    let worldJson = await d3.json('data/world.json');

    return {
        'tradeData': tradeData,
        'worldJson': worldJson
    };
}