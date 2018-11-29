class TrendChart {

    /**
     * Constructor for the TrendChart
     *
     * @param worldHeatMap an instance of --WorldHeatMap-- class
     * @param trendChart an instance of -- TrendChart-- class
     */
    constructor(){

        this.allCodes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        this.codeSemantics = {
            "1":"Food",
            "2":"Crude Materials",
            "3":"Fuels",
            "4":"Animal/Vegetable Oils",
            "5":"Chemicals",
            "6":"Manufactured Goods",
            "7":"Machinery",
            "8":"Misc Manufactured",
            "9":"Other"}

        let trendChart = d3.select("#trendChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = trendChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width * 0.9 - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.width * 0.2 - this.margin.top - this.margin.bottom;

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

        d3.select('#trendChart')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        svgGroup.append('text').classed('activeYear-background', true)
            .attr('transform', 'translate(100, 50)');

        svgGroup.append('text').classed('info-background', true)
            .attr('transform', 'translate(100, 100)');

        svgGroup.append('text').classed('export-background', true)
            .attr('transform', 'translate(100, 150)');

        svgGroup.append('text').classed('import-background', true)
            .attr('transform', 'translate(100, 200)');

        svgGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", "translate(75," + this.svgHeight + ")");

        svgGroup.append('text').classed('axis-label-x', true);

        svgGroup.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(75,0)");

        svgGroup.append('text').classed('axis-label-y', true);


        this.allYScale = d3.scaleLinear()
            .domain([0, this.allCodes.length])
            .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])
    };


    // needs code choice, country selection, data
    update(country, code, _data, yearValue){

        let data = _data.filter(function(d) {
            return d.orig == country;
        });

        let that = this;

        let tooltip = d3.select('.tooltip');

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

        let exportInfo = importsAndExports.filter(function(d) {
            return d.year == yearValue && d.type == 'export';
        });

        let importInfo = importsAndExports.filter(function(d) {
            return d.year == yearValue && d.type == 'import';
        });


        //Find the max for the X and Y data
        // let maxImports = findMax(imports);
        // let maxExports = findMax(exports);
        let maxY = findMax(importsAndExports);
        //
        // if(maxImports > maxExports){
        //     maxY = maxImports;
        // }

        let xScale = d3.scaleLinear().range([0, this.svgWidth]).domain([new Date(1960, 1), new Date(2016, 1)]).nice();
        let yScale = d3.scaleLinear().range([this.svgHeight, 0]).domain([0, maxY]).nice();


        let group = d3.select('#trendChart').select('svg').select('.wrapper-group');

        let div = d3.select("#trendChart").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let codeSelected = 'All Goods';
        if(importsAndExports[0].code != 'all'){
            codeSelected = that.codeSemantics[importsAndExports[0].code].toUpperCase();
        }

        group.attr("transform", "translate(" + this.margin.left * 2 + "," + this.margin.top + ")");

        let yearBg = group.select('.activeYear-background').text(country.toUpperCase() +": "+yearValue);

        let infoBg = group.select('.info-background').text("Product Type: " + codeSelected);

        let exportBg = group.select('.export-background').text("Exports: " + exportInfo[0].countries.wld.toLocaleString());

        let importBg = group.select('.import-background').text("Imports: " + importInfo[0].countries.wld.toLocaleString());


        d3.select('.axis-label-x')
            .text('YEAR')
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .attr('transform', 'translate(' + (this.svgWidth / 2) + ', ' + (this.svgHeight + 20) + ')');


        d3.select('.axis-label-y')
            .text(codeSelected)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .attr('transform', 'translate(' + -50 + ', ' + (this.svgHeight / 2) + ')rotate(-90)');

        //Add the x and y axis
        let xAxis = d3.select('.x-axis')
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

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
                return xScale(new Date(parseInt(d.year), 1));
            })
            .attr("cy", function(d) {
                return yScale(d.countries.wld);
            })
            .attr("transform", "translate(75,0)");

        //Add the tooltip labels on mouseover
        circles.on('mouseover', function(d, i) {
            d3.select(this).classed("hover", true);
            //show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(that.tooltipRender(d) + "<br/>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

        });
        //hover function for country selection
        circles.on("mouseout", function(d) {
            d3.select(this).classed("hover", false);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        circles.on('click', (d) => {
            d3.event.stopPropagation();
            that.clearHighlight();
            that.updateFunction(d.orig, d.year, d.code);
        });

        that.updateHighlightClick(yearValue);

    };

    addUpdateFunction(updateFunction) {
        this.updateFunction = updateFunction;
    }

    updateHighlightClick(activeYear) {


        this.clearHighlight();
        //highlight bubbles
        let imported = d3.select('#trendChart').select('svg').select('.wrapper-group').selectAll('circle')
            .filter(b => b.type === 'import')
            .classed('trend-import', true);
        let exported = d3.select('#trendChart').select('svg').select('.wrapper-group').selectAll('circle')
            .filter(b => b.type === 'export')
            .classed('trend-export', true);
        let selected = d3.select('#trendChart').select('svg').select('.wrapper-group').selectAll('circle')
            .filter(b => b.year === activeYear)
            .classed('selected-year', true)
            .attr("r", 10);
        console.log(selected);
    }

    clearHighlight() {
        d3.select('#trendPlot').selectAll('.selected-year')
            .classed('selected-year', false)
            .attr("r", 5);
    }

    tooltipRender(data) {
        let code = 'All Goods';
        if(data.code != 'all'){
            code = this.codeSemantics[data.code];
        }
        let text = "<h2>" + data['orig'].toUpperCase() + ": " +  data.year + "<br>" + data.type.toUpperCase() + "<br/>" + code
            + "<br/>" + data.countries.wld.toLocaleString() + "</h2>";
        return text;
    }

}
