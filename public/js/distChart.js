class DistributionChart {

    /**
     * Constructor for the DistributionChart
     *
     * @param worldHeatMap an instance of --WorldHeatMap-- class
     * @param trendChart an instance of -- TrendChart-- class
     */
    constructor (){

        // Set codes/semantics variables
        
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

        this.headers = ["Product Type", "Exports", "Exports per Capita", "Imports", "Imports per Capita"];

        // Set SVG dimensions
        
        this.distChart = d3.select("#distChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = this.distChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        // Set Group Dimensions

        this.groupPadding = 0.05;
        this.groupHeight = (this.svgHeight - this.margin.top - this.margin.bottom) / (this.allCodes.length + 1);
        this.groupWidth = (this.svgWidth - this.margin.left - this.margin.right) / 5;
        this.groupMargin = {top: this.groupHeight * this.groupPadding, 
                            right: this.groupWidth * this.groupPadding, 
                            bottom:this.groupHeight * this.groupPadding, 
                            left:this.groupWidth * this.groupPadding};

        this.createChart();
        this.createHeaders();

        this.tip = d3.tip()
                     .attr('id', "distChartTooltip")
                     .attr('class', 'd3-tip')
                     .direction('e');

        d3.select("#distChartTooltip")
          .classed("hidden", true);

        this.selectedCountry = "";


    };

    loadCountryNameData(countryNameData) {

        this.countryNameData = {}

        for (let i = 0; i < countryNameData.length; i++)
        {
            let key = countryNameData[i].id_3char;
            let value = countryNameData[i].name;
            this.countryNameData[key] = value;
        }


    };

    getCountryName(id) {

        return this.countryNameData[id];

    };

    tooltip_render(data, rank) {
        let fontSizeMax = 15;
        let fontSizeMin = 9;
        let fontSize = 0;
        let fontStep = (fontSizeMax - fontSizeMin) / ((data.length - 1) / 2);
        let text = "";
        let mid = ((data.length - 1) / 2);
        for (let i = 0; i < data.length; i++)
        {
            fontSize = Math.max(fontSizeMin, fontSizeMax - (Math.abs(data[i].rank - rank) * fontStep));
            if (this.selectedCountry == data[i].orig)
            {
                text = text + "<span style='font-size: " + fontSize + "pt;'>" + "***#" + data[i].rank + ": " + data[i].name + "</span>" + "<br>";
            }
            else
            {
                text = text + "<span style='font-size: " + fontSize + "pt;'>" + "#" + data[i].rank + ": " + data[i].name + "</span>" + "<br>";
            }
        }
        return text;
    };

    createChart() {

        // Create base SVG elements
        
        this.svg = this.distChart.append("svg")
                                 .attr("width", this.svgWidth)
                                 .attr("height", this.svgHeight);

        this.allYScale = d3.scaleLinear()
                           .domain([0, this.allCodes.length + 1])
                           .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])

        this.argsList = [{'direction': 'export', 'type': 'abs', 'position': 1},
                         {'direction': 'export', 'type': 'percap', 'position': 2},
                         {'direction': 'import', 'type': 'abs', 'position': 3},
                         {'direction': 'import', 'type': 'percap', 'position': 4}];

        for (let i = 0; i < this.argsList.length; i++)
        {
            let direction = this.argsList[i].direction;
            let type = this.argsList[i].type;
            this.svg.append("g").attr("id", direction + type);
        }

    };

    /**
     * Creates the Headers and left column labesl of distribution chart
     */
    createHeaders(){

        for (let i = 0; i < this.allCodes.length; i++)
        {
            let tmp = this.svg.append("text");
            tmp.text(this.codeSemantics[this.allCodes[i]]);
            tmp.attr("x", this.groupMargin.left)
               .attr("y", this.allYScale(+this.allCodes[i] + .5));
            tmp.style("stroke", "black");
        }

        for (let i = 0; i < this.headers.length; i++)
        {
            let tmp = this.svg.append("text");
            tmp.text(this.headers[i]);
            tmp.attr("x", this.groupMargin.left + (i * this.groupWidth))
               .attr("y", this.allYScale(0.5))
               .style("stroke", "black");
        }

    };


    /*
     * Updates chart given selected country
     *
     * @param data import/export data filtered to a single year
     * @param country 3 character id of selected country
     */
    update (data, selectedCountry){

        this.data = data;
        this.selectedCountry = selectedCountry;

        for (let i = 0; i < this.argsList.length; i++)
        {
            this.updateCharts(data, this.argsList[i], selectedCountry);
        }

    };


    /**
     * Given selected country and data args, generates a column of the distribution chart
     *
     * @param data data filtered by the selected year
     * @param args selected row of this.argsList. Specifies direction, type, and position of column data
     * @param country the 3 char id of selected country
     */

    updateCharts(data, args, country){
        
        // TODO Implement Bar charts. Probably keep imports/exports, and allow user
        //      to switch between per capit and absolute

        // TODO Implement Sorting
        
        // TODO Enable click to impact rest of chart (clicking on product changes
        //      product for rest of chart).
        
        // TODO (Maybe) use kernel function to show distribution
        
        // Set variables, scales, and filter data
        
        this.updateDistCharts(data, args, country);

    };

    updateDistCharts(data, args, country) {

        let that = this;

        let direction = args.direction;
        let type = args.type;
        let position = +args.position;

        let fData = this.filterData(data, direction, type);
        let selectedCountryData = this.getSelectedCountryData(fData, country);
        this.scales = this.generateScales(fData);

        // Determine size of data subset for each code

        this.dataSizes = {};

        for (let i = 0; i < fData.length; i++)
        {
            this.dataSizes[fData[i][0].code] = fData[i].length;
        }

        let area = d3.area()
                     .x(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / that.dataSizes[d.code] * (i + 1); 
                         return rightShift + that.groupMargin.left + offset;
                     })
                     .y0((d) => that.allYScale(+d.code + 1))
                     .y1(function(d,i) { 
                         let base = that.allYScale(+d.code + 1);
                         let height = that.scales[d.code](d.val);
                         return base - height; });

        let container = this.svg.select('#' + direction + type);

        let groups = container.selectAll("g")
                              .data(fData);

        groups.exit().remove();
        
        // Create new groups, paths, and lines
        
        let enterGroups = groups.enter()
                                .append("g");
        enterGroups.append("rect").classed('distChartBackground', true);
        enterGroups.append("path");
        enterGroups.append("line");
        enterGroups.append("rect").classed('distChartRectOverlay', true);

        groups = enterGroups.merge(groups);

        // Set up tooltip
        
        this.tip.html((d, rank) => {

            let tipSize = 5;
            let tipBeforeAfter = (tipSize - 1) / 2;
            let tipBegin = 0;
            let tipEnd = 0;

            // Check if crosses lower bound
            if (rank - tipBeforeAfter < 0)
            {
                tipBegin = 0;
                tipEnd = tipSize;
            }
            else
            {
                tipBegin = rank - tipBeforeAfter;
                // Check if crosses upper bound
                if (rank + tipBeforeAfter >= d.length)
                {
                    tipBegin = d.length - 1 - tipSize;
                    tipEnd = d.length - 1;
                }
                else
                {
                    tipEnd = rank + tipBeforeAfter;
                }
            }

            let countriesToRender = [];
            for (let i = tipBegin; i < tipEnd + 1; i++)
            {
                let currCountry = {'orig': d[i].orig, 'rank': d.length - d[i].rank, 'name': this.getCountryName(d[i].orig)};
                countriesToRender.push(currCountry);
            }

            return this.tooltip_render(countriesToRender, d.length - rank);
        });

        groups.call(this.tip);
        groups.on("mouseover", (d) => {
                 d3.select("#distChartTooltip").classed("hidden", false);
                 d3.event.stopPropagation();
             })
             .on("mousemove", (d) => {
                 d3.event.stopPropagation();
                 let divMargin = 8;
                 let code = d[0].code;
                 let rightShift = (that.groupWidth) * position;
                 let XIndex = d3.event.pageX - divMargin;
                 let offset = XIndex - rightShift - that.groupMargin.left;
                 let rank = ((offset * that.dataSizes[code]) / (that.groupWidth - that.groupMargin.right - that.groupMargin.left) );
                 rank = Math.floor(rank);
                 this.tip.show(d, rank);
             })
             .on("mouseout", (d) => { d3.select("#distChartTooltip").classed("hidden", true);});

        // Update Background Rectangles
        
        let rects = groups.select(".distChartBackground") //.select("rect")
                          .datum((d) => {
                              return d;
                          });

        rects.attr('x',(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         return rightShift + that.groupMargin.left;
                     }))
                     .attr('y', ((d) => that.allYScale(+d[0].code) + that.groupMargin.top))
                     .attr('height', this.groupHeight - this.groupMargin.top - this.groupMargin.bottom)
                     .attr('width', this.groupWidth - this.groupMargin.left - this.groupMargin.right)
                     .classed('distChartBackground', true);

        // Update Overlay Rectangles
        let overlays = groups.select(".distChartRectOverlay")
                             .datum((d) => {
                                 return d;
                             });

        overlays.attr('x',(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         return rightShift + that.groupMargin.left;
                     }))
                     .attr('y', ((d) => that.allYScale(+d[0].code) + that.groupMargin.top))
                     .attr('height', this.groupHeight - this.groupMargin.top - this.groupMargin.bottom)
                     .attr('width', this.groupWidth - this.groupMargin.left - this.groupMargin.right)
                     .classed('distChartRectOverlay', true);
                          

        // Update Area Charts
        let paths = groups.select("path")
                          .datum((d) => {
                              return d;
                          });


        paths.attr('d', area)
             .classed('distChartArea', true);

        // Update Selected Country Lines
        groups = container.selectAll("g")
                          .data(selectedCountryData);
        let lines = groups.select("line");
                               
        lines.attr("x1", (d) => {
            if (d.length == 0){    // No data for selected country
                return 0;
            }
            let rightShift = that.groupWidth * position;
            let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / that.dataSizes[d[0].code] * (d[0].rank + 1);
            return rightShift + that.groupMargin.left + offset;
        })
        .attr("x2", (d) => {
            if (d.length == 0){    // No data for selected country
                return 0;
            }
            let rightShift = that.groupWidth * position;
            let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / that.dataSizes[d[0].code] * (d[0].rank + 1);
            return rightShift + that.groupMargin.left + offset;
        })
        .attr("y1", (d) => {
            if (d.length == 0){    // No data for selected country
                return 0;
            }
            return that.allYScale(+d[0].code) + that.groupMargin.top;
        })
        .attr("y2", (d) => {
            if (d.length == 0){    // No data for selected country
                return 0;
            }
            return that.allYScale(+d[0].code + 1)}
            )
        .classed("distChartSelectedCountryLine", true);

        // This is to ensure correct data is bound to tooltip
        groups = container.selectAll("g")
                          .data(fData);

    };

    /**
     * Filters data based on direction (import/export) and type (percapita or absolute)
     *
     * @param data data filtered to a single year
     * @param direction string that is either "import" or "export"
     * @param type string that is either "percap" or "abs"
     *
     * @return output a filtered version of data, based on @direction and @type
     */
    filterData(data, direction, type){

        let that = this;

        let output = [];

        for (let i = 0; i < this.allCodes.length; i++)
        {
            let tmp = data.filter(function(d) {
                return d.type == direction && d.code == that.allCodes[i];
            });

            tmp = this.parse(tmp, type);

            tmp.sort(function(a, b) {
                return d3.ascending(a.val, b.val);
            });

            tmp = this.rank(tmp);

            output.push(tmp);
        }

        return output;

    };

    /*
     * Parses and processes raw data. Can generate val as per capita or absolute
     *
     * @param data data already filtered by this.filterData
     * @param type string, either "percap" or "abs", indicates type of value to return
     *
     * @return info list where each row in data is represented as follows:
     *         val: The metric for the given country, code, and direction. Can be absolute import/export, or per capita
     *         code: Product code for row
     *         direction: indicates whether import or export
     *         type: indicates whether is absolute or per capita value
     *         orig: the country of the data
     */
        
    parse (data, type){

        let info = [];

        let getVal;

        if (type == "percap")
        {
            getVal = function(d) {
                if (d.population != "NA")
                {
                    return d.val / d.population;
                }
                return 0;
            };
        }
        else
        {
            getVal = function(d) {
                return d.val
            };
        }

        data.forEach( function (row, i) {
            if (row.orig != 'wld'){
                info.push({
                    val: getVal(row),
                    code: row.code,
                    direction: row.type,
                    type: type,
                    orig: row.orig
                });
            }
        });

        return info;

    };

    rank (data){

        for (let i = 0; i < data.length; i++)
        {
            data[i]['rank'] = i;
        }

        return data;

    };

    /**
     * Filters data to only include selected country
     *
     * @param data filtered dataset, already filtered by this.filterData
     * @param country 3 char id indicating selected country
     *
     * @return output filtered data including only selected country
     */

    getSelectedCountryData(data, country){

        let output = [];

        for (let i = 0; i < data.length; i++)
        {
            let tmp = data[i].filter(function(d) {
                return d.orig == country;
            });
            output.push(tmp)
        }

        return output;
    };

    /**
     * Generates a list of scales for each code in a filtered dataset
     *
     * @param data data already filtered by this.filterData
     * 
     * @return outScales object with product codes as keys, and values as d3 scales
     */
    
    generateScales(data){

        let outScales = {};

        for (let i = 0; i < data.length; i++)
        {
            let tmp = data[i];
            let max = d3.max(tmp, function(d) {
                return d.val;
            });

            let scale = d3.scaleLinear()
                          .domain([0, max])
                          .range([this.groupMargin.bottom, this.groupHeight - this.groupMargin.bottom - this.groupMargin.top]);
            outScales[tmp[0].code] = scale;
        }

        return outScales;
    };
}
