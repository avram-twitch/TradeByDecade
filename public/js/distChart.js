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

        let distChart = d3.select("#distChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = distChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        this.groupPadding = 0.1;
        this.groupHeight = (this.svgHeight - this.margin.top - this.margin.bottom) / (this.allCodes.length + 1);
        this.groupWidth = (this.svgWidth - this.margin.left - this.margin.right) / 5;
        this.groupMargin = {top: this.groupHeight * this.groupPadding, 
                            right: this.groupWidth * this.groupPadding, 
                            bottom:this.groupHeight * this.groupPadding, 
                            left:this.groupWidth * this.groupPadding};

        this.svg = distChart.append("svg")
                            .attr("width", this.svgWidth)
                            .attr("height", this.svgHeight);

        this.allYScale = d3.scaleLinear()
                          .domain([0, this.allCodes.length + 1])
                          .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top])
        this.createHeaders();

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


    /*
     * Updates chart given selected country
     *
     * @param data import/export data filtered to a single year
     * @param country 3 character id of selected country
     */
    update (data, selectedCountry){

        let that = this;

        for (let i = 0; i < this.argsList.length; i++)
        {
            this.updateCharts(data, this.argsList[i], selectedCountry);
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

    /**
     * Given selected country and data args, generates a column of the distribution chart
     *
     * @param data data filtered by the selected year
     * @param args selected row of this.argsList. Specifies direction, type, and position of column data
     * @param country the 3 char id of selected country
     */

    updateCharts(data, args, country){

        // TODO Are lines correct (They appear all the same)
        // definitely not. In order to pass data to child elements you have to use selectAll, not select
        
        // TODO Handle cases where there is no data for selected country

        // TODO Tooltip that shows countries
        
        // TODO (Maybe) use kernel function to show distribution
        
        // TODO Enable click to impact rest of chart
        
        let that = this;

        let direction = args.direction;
        let type = args.type;
        let position = +args.position;

        let fData = this.filterData(data, direction, type);
        let selectedCountryData = this.getSelectedCountryData(fData, country);
        let scales = this.generateScales(fData);


        let dataSizes = {};

        for (let i = 0; i < fData.length; i++)
        {
            dataSizes[fData[i][0].code] = fData[i].length;
        }

        let area = d3.area()
                     .x(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / dataSizes[d.code] * (i + 1); 
                         return rightShift + that.groupMargin.left + offset;
                     })
                     .y0((d) => that.allYScale(+d.code + 1))
                     .y1(function(d,i) { 
                         let base = that.allYScale(+d.code + 1);
                         let height = scales[d.code](d.val);
                         return base - height; });

        let container = this.svg.select('#' + direction + type);

        let groups = container.selectAll("g")
                              .data(fData);

        let enterGroups = groups.enter()
                                .append("g");
        enterGroups.append("path");
        enterGroups.append("line");

        groups = enterGroups.merge(groups);

        let paths = groups.select("path")
                          .datum((d) => {
                              return d;
                          });

        paths.attr('d', area)
             .style("fill", "blue");

        groups = container.selectAll("g")
                          .data(selectedCountryData);
        let lines = groups.select("line");
                               
        lines.attr("x1", (d) => {
            let rightShift = that.groupWidth * position;
            let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / dataSizes[d[0].code] * (d[0].rank + 1);
            return rightShift + that.groupMargin.left + offset;
        })
        .attr("x2", (d) => {
            let rightShift = that.groupWidth * position;
            let offset = (that.groupWidth - that.groupMargin.right - that.groupMargin.left) / dataSizes[d[0].code] * (d[0].rank + 1);
            return rightShift + that.groupMargin.left + offset;
        })
        .attr("y1", (d) => that.allYScale(+d[0].code))
        .attr("y2", (d) => that.allYScale(+d[0].code) + that.groupHeight - that.groupMargin.top - that.groupMargin.bottom)
        .attr("stroke", "red");

                                      
                                

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

            output.push(tmp);
        }

        return output;

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

    /*
     * Parses and processes raw data. Can generate val as per capita or absolute
     *
     * @param data data already filtered by this.filterData
     * @param type string, either "percap" or "abs", indicates type of value to return
     *
     * @return info list where each row in data is represented as follows:
     *         rank: Rank of given country (compared to the world) for the given code and direction
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
                    return d.countries.wld / d.population;
                }
                return 0;
            };
        }
        else
        {
            getVal = function(d) {
                return d.countries.wld;
            };
        }

        data.forEach( function (row, i) {
            info.push({
                rank: i,
                val: getVal(row),
                code: row.code,
                direction: row.type,
                type: type,
                orig: row.orig
            });
        });

        return info;

    };
}
