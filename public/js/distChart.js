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

        this.groupPadding = 0.1;
        this.groupHeight = (this.svgHeight - this.margin.top - this.margin.bottom) / this.allCodes.length;
        this.groupWidth = (this.svgWidth - this.margin.left - this.margin.right) / 4;
        this.groupMargin = {top: this.groupHeight * this.groupPadding, 
                            right: this.groupWidth * this.groupPadding, 
                            bottom:this.groupHeight * this.groupPadding, 
                            left:this.groupWidth * this.groupPadding};

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

        this.codeScales = {}

        for (let i = 0; i < this.allCodes.length; i++)
        {
            let tmp = data.filter(function(d) {
                return d.type == "export" && d.code == that.allCodes[i];
            });

            let max = d3.max(tmp, function(d) {
                return +d.countries.wld;
            });

            let scale = d3.scaleLinear()
                          .domain([0, max])
                          .range([this.groupMargin.bottom, this.groupHeight - this.groupMargin.bottom - this.groupMargin.top]);

            tmp.sort(function(a, b) {
                return d3.ascending(a.countries.wld, b.countries.wld);
            });

            tmp = this.parse(tmp);
            allData.push(tmp);
            this.codeScales[this.allCodes[i]] = scale;
        }

        let max = d3.max(data, function(d) {
            return +d.countries.wld;
        });

        console.log(allData);

        let allYScale = d3.scaleLinear()
                          .domain([0, this.allCodes.length])
                          .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])

        let area = d3.area()
                     .x(function(d,i) { return that.groupMargin.left + (i * (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / 250); })
                     .y0((d) => allYScale(d.code))
                     .y1(function(d,i) { 
                         let base = allYScale(d.code);
                         let height = that.codeScales[d.code](d.val);
                         return base - height; });

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
