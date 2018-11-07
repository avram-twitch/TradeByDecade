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
                val: row.countries.wld
            });
        });

        return info;

    };

    update (data){

        let that = this;

        let selectedCountryData = data.filter(function(d) {
            return d.orig == "usa" && d.type == "export" && d.code == "1";
        });

        let allCountryData = data.filter(function(d) {
            return d.type == "export" && d.code == "1";
        });

        let max = d3.max(allCountryData, function(d) {
            return +d.countries.wld;
        });

        console.log(allCountryData);

        allCountryData.sort(function(a, b) {
            return d3.descending(a.countries.wld, b.countries.wld);
        });

        console.log(allCountryData);

        let metaData = this.parse(allCountryData);
        console.log(metaData);

        let myData = [metaData];

        let yScale = d3.scaleLinear()
                       .domain([0, max])
                       .range([this.margin.bottom, this.svgHeight]);

        let area = d3.area()
                     .x(function(d,i) { return i * (that.svgHeight / 250); })
                     .y0(0)
                     .y1(function(d,i) { yScale(d.val); });

        let groups = this.svg.selectAll("g")
                             .data(myData);

        let enterGroups = groups.enter()
                                .append("g");

        enterGroups.append('path')
                   .datum(myData)
                   .attr('d', area(myData))
                   .style("fill", "blue");
                                

//
//        let xScale = d3.scaleLinear()
//                       .domain([0, 10])
//                       .range([this.margin.left, this.svgWidth - this.margin.left - this.margin.right]);
//
//        let rects = this.svg.selectAll("rect")
//                        .data(selectedCountryData);
//
//        let enterRects = rects.enter()
//                              .append("rect");
//        enterRects.attr("x", (d,i) => xScale(i))
//                  .attr("y", (d,i) => this.svgHeight - this.margin.bottom - yScale(d.countries.wld))
//                  .attr("width", 0.5 * xScale(1))
//                  .attr("height", (d, i) => yScale(d.countries.wld))
//                  .attr("fill", "blue");
//        console.log(selectedCountryData);
    };
        
}
