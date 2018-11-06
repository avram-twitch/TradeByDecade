class DistributionChart {

    /**
     * Constructor for the DistributionChart
     *
     * @param worldHeatMap an instance of --WorldHeatMap-- class
     * @param trendChart an instance of -- TrendChart-- class
     */
    constructor (worldHeatMap, trendChart){

        this.worldHeatMap = worldHeatMap;
        this.trendChart = trendChart;

        let distChart = d3.select("#distChart");
        this.svgBounds = distChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        this.svg = distChart.append("svg")
                            .attr("width", this.svgWidth)
                            .attr("height", this.svgHeight);
    };

    initialize (){
    };

    update (data){
    };
        
}
