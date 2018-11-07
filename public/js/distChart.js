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
        this.allCodes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

        let distChart = d3.select("#distChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = distChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        this.svg = distChart.append("svg")
                            .attr("width", this.svgWidth)
                            .attr("height", this.svgHeight);
    };

    parse (data){

        let info = [];

        data.forEach( function (row, i) {
            info.push({
                rank: i,
                val: row.countries.wld,
                code: row.code
            });
        });

        return info;

    };

    update (data){

        let that = this;

        let allData = [];

        for (let i = 0; i < this.allCodes.length; i++)
        {
            let tmp = data.filter(function(d) {
                return d.type == "export" && d.code == that.allCodes[i];
            });
            tmp.sort(function(a, b) {
                return d3.descending(a.countries.wld, b.countries.wld);
            });
            tmp = this.parse(tmp);
            allData.push(tmp);
        }

        let max = d3.max(data, function(d) {
            return +d.countries.wld;
        });

        console.log(allData);

        let groupYScale = d3.scaleLinear()
                            .domain([0, max])
                            .range([0, (this.svgHeight - this.margin.bottom - this.margin.top) / 10]);

        let allYScale = d3.scaleLinear()
                          .domain([0, 10])
                          .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])

        let area = d3.area()
                     .x(function(d,i) { return i * (that.svgWidth / 250); })
                     .y0((d) => allYScale(d.code))
                     .y1(function(d,i) { return allYScale(d.code) - groupYScale(d.val); });

        let groups = this.svg.selectAll("g")
                             .data(allData);

        let enterGroups = groups.enter()
                                .append("g");


        let paths = enterGroups.append("path")
                               .datum((d) => {
                                   return d;
                               });

        paths.attr('d', area)
             .style("fill", "blue");
                                

    };
        
}
