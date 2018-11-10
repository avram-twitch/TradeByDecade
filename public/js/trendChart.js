class TrendChart {

    /**
     * Constructor for the TrendChart
     *
     * @param worldHeatMap an instance of --WorldHeatMap-- class
     * @param trendChart an instance of -- TrendChart-- class
     */
    constructor(){

        this.allCodes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

        let trendChart = d3.select("#trendChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = trendChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.width * 0.3 - this.margin.top - this.margin.bottom;

        this.groupPadding = 0.1;
        this.groupHeight = (this.svgHeight - this.margin.top - this.margin.bottom) / this.allCodes.length;
        this.groupWidth = (this.svgWidth - this.margin.left - this.margin.right) / 4;
        this.groupMargin = {top: this.groupHeight * this.groupPadding,
            right: this.groupWidth * this.groupPadding,
            bottom:this.groupHeight * this.groupPadding,
            left:this.groupWidth * this.groupPadding};

        this.svg = trendChart.append("svg")
            .attr("width", this.svgWidth + this.margin.left + this.margin.right)
            .attr("height", this.svgHeight + this.margin.top + this.margin.bottom);

        let svgGroup  = d3.select('#trendChart').select('svg').append('g').classed('wrapper-group', true);


        svgGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", "translate(0," + this.svgHeight + ")");

        svgGroup.append('text').classed('axis-label-x', true);

        svgGroup.append("g")
            .attr("class", "y-axis");

        svgGroup.append('text').classed('axis-label-y', true);

        this.allYScale = d3.scaleLinear()
            .domain([0, this.allCodes.length])
            .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])
    };


    // needs code choice, country selection, data
    update(country, code, _data){

        let data = _data.filter(function(d) {
            return d.orig == country;
        });

        let that = this;

        /**
         * Finds the max for the specified data
         * @param dataOb
         * @returns {*|number}
         */
        function findMax(dataOb) {
            let totalMax = d3.max(dataOb.map(m => {
                return m.countries.wld;
            }));
            return totalMax;
        }

        // let exports = data.filter(function(d) {
        //     return d.type == 'export' && d.code == '2';
        // });
        // let imports = data.filter(function(d) {
        //     return d.type == 'import' && d.code == '2';
        // });

        let importsAndExports = data.filter(function(d) {
            return d.code == code;
        });


        //Find the max for the X and Y data
        // let maxImports = findMax(imports);
        // let maxExports = findMax(exports);
        let maxY = findMax(importsAndExports);
        //
        // if(maxImports > maxExports){
        //     maxY = maxImports;
        // }

        let xScale = d3.scaleLinear().range([0, this.svgWidth]).domain([1960, 2016]).nice();
        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, maxY]).nice();


        let group = d3.select('#trendChart').select('svg').select('.wrapper-group');

        group.attr("transform", "translate(" + this.margin.left * 2 + "," + this.margin.top + ")");

        //Add the x and y axis
        let xAxis = d3.select('.x-axis')
            .call(d3.axisBottom(xScale));

        let yAxis = d3.select('.y-axis')
            .call(d3.axisLeft(yScale));

        //Add the countries as circles
        let circles = group.selectAll('circle').data(importsAndExports);

        circles.exit().remove();

        let circleEnter = circles
            .enter().append('circle');

        circles = circleEnter.merge(circles);

        circles.attr("r", 5)
            .attr("cx", function(d) {
                return xScale(d.year);
            })
            .attr("cy", function(d) {
                return yScale(d.countries.wld);
            })
            .attr('fill', function(d) {
                if(d.type == 'export'){
                    return 'red';
                }
                return 'blue';
            });

    };

}