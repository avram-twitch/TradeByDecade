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

        this.codeSortingOrder =  {'1':1,
                                  '2':2, 
                                  '3':3, 
                                  '4':4, 
                                  '5':5, 
                                  '6':6, 
                                  '7':7, 
                                  '8':8, 
                                  '9':9 };

        this.sortingTracker = {'export-dist': 0,
                               'export-bar': 0,
                               'import-dist': 0,
                               'import-bar': 0};

        this.headers = [{'name':"Product Type", 'direction': 'none', 'chart': 'none'}, 
                        {'name':"Export Ranks", 'direction': 'export', 'chart': 'dist'}, 
                        {'name':"Exports", 'direction': 'export', 'chart': 'bar'}, 
                        {'name':"Import Ranks", 'direction': 'import', 'chart': 'dist'}, 
                        {'name': "Imports", 'direction': 'import', 'chart': 'bar'}
                       ];

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

        this.selectedCountry = "";
        this.selectedCode = "all";
        this.year = "";

        this.createChart();
        this.createHeaders();

        this.distTip = d3.tip()
                     .attr('id', "distChartTooltip")
                     .attr('class', 'd3-tip')
                     .direction('e');

        this.barTip = d3.tip()
                        .attr('id', 'barChartTooltip')
                        .attr('class', 'd3-tip')
                        .direction('e');

        d3.select("#distChartTooltip")
          .classed("hidden", true);

        d3.select("#barChartTooltip")
          .classed("hidden", true);

        this.type = "abs";

    };

    addUpdateFunction(updatePlot)
    {
        this.updatePlot = updatePlot;
    }

    sortCodes(direction, chart) {

        let that = this;
        let fData;
        let selectedCountryData;
        if (chart == 'bar')
        {
            fData = this.filteredData;
        }
        
        if (chart == 'dist')
        {
            fData = this.filterData(this.data, direction, this.type);
            selectedCountryData = this.getSelectedCountryData(fData, this.selectedCountry);
        }

        let trackerKey = direction + '-' + chart;
        let sortDirection = this.sortingTracker[trackerKey];
        
        // Resets sorting Directions
        
        Object.keys(this.sortingTracker).forEach(function(key, index) {
            that.sortingTracker[key] = 0;
        });

        if (sortDirection == 0 || sortDirection == -1)
        {
            sortDirection = 1;
        } else {
            sortDirection = -1;
        }

        this.sortingTracker[trackerKey] = sortDirection;


        if (chart == 'bar')
        {
            fData = fData.filter((d) => d.type == direction && d.code != 'all');
            fData.sort(function(a,b){
                return d3.ascending(+a.countries.wld * sortDirection, +b.countries.wld * sortDirection);
            });

            for (let i = 0; i < fData.length; i++)
            {
                let code = fData[i].code;
                this.codeSortingOrder[code] = i + 1;
            }
        }

        if (chart == 'dist')
        {
            selectedCountryData = selectedCountryData.filter((d) => d[0].direction == direction);
            selectedCountryData.sort(function(a,b){
                let aSize = that.dataSizes[a[0].code];
                let bSize = that.dataSizes[b[0].code];
                return d3.ascending((aSize - (+a[0].rank)) * sortDirection, (bSize - (+b[0].rank)) * sortDirection);
            });

            for (let i = 0; i < selectedCountryData.length; i++)
            {
                let code = selectedCountryData[i][0].code;
                this.codeSortingOrder[code] = i + 1;
            }
        }

        this.createHeaders();
        this.update(this.data, this.filteredData, this.selectedCountry);

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

    formatNumber(number) {
        let thousands = 1000;
        let millions = 1000000;
        let billions = 1000000000;
        let trillions = 1000000000000;

        if (number > trillions) {
            return (number / trillions).toFixed(1) + "T";
        }

        if (number > billions) {
            return (number / billions).toFixed(1) + "B";
        }

        if (number > millions) {
            return (number / millions).toFixed(1) + "M";
        }

        if (number > thousands) {
            return (number / thousands).toFixed(1) + "K";
        }

        return number.toFixed(1);
    };

    dist_tooltip_render(data, rank) {
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
                text = text + "<span style='font-size: " + fontSize + "pt;'>" + "***#" + data[i].rank + ": " + data[i].name + "($" + this.formatNumber(data[i].val) + ")</span>" + "<br>";
            }
            else
            {
                text = text + "<span style='font-size: " + fontSize + "pt;'>" + "#" + data[i].rank + ": " + data[i].name + "($" + this.formatNumber(data[i].val) + ")</span>" + "<br>";
            }
        }
        return text;
    };

    bar_tooltip_render(data, direction) {

        let topN = 5;
        let headerSize = 15;

        let dataList = [];

        Object.keys(data.countries).forEach(function(key, index) {
            if (key != 'wld')
            {
                dataList.push({'key': key, 'val': +data.countries[key]});
            }
        });

        dataList.sort(function(a,b) {
                return d3.descending(a.val, b.val);
            });

        let text = "";

        if (direction == 'export')
        {
            text = text + "<span style='font-size: " + headerSize + "pt;'><b>Top Exporting Destinations</b></span><br>";
        }

        if (direction == 'import')
        {
            text = text + "<span style='font-size: " + headerSize + "pt;'><b>Top Importing Origins</b></span><br>";
        }

        for (let i = 0; i < topN; i++)
        {
            let name = this.getCountryName(dataList[i].key);
            let value = dataList[i].val;
            text = text + "<span>" + "#" + (i + 1) + ": " + name + "($" + this.formatNumber(value) + ")" + "</span>" + "<br>";
        }

        return text;
    };

    createChart() {

        // Create base SVG elements
        
        let that = this;

        this.svg = this.distChart.append("svg")
                                 .attr("width", this.svgWidth)
                                 .attr("height", this.svgHeight)
                                 .on('click', function() {
                                     
                                        d3.event.stopPropagation();
                                        that.codeSortingOrder =  {'1':1,
                                                                  '2':2, 
                                                                  '3':3, 
                                                                  '4':4, 
                                                                  '5':5, 
                                                                  '6':6, 
                                                                  '7':7, 
                                                                  '8':8, 
                                                                  '9':9 };

                                        that.sortingTracker = {'export-dist': 0,
                                                               'export-bar': 0,
                                                               'import-dist': 0,
                                                               'import-bar': 0};

                                        that.updatePlot(that.selectedCountry, that.year, 'all');
                                 });

        // Set up Y Scale
        
        this.allYScale = d3.scaleLinear()
                           .domain([0, this.allCodes.length + 1])
                           .range([this.margin.bottom, this.svgHeight - this.margin.bottom - this.margin.top]);

        // Generate Groups
        
//        this.argsList = [{'direction': 'export', 'type': 'abs', 'position': 1, 'chart': 'dist'},
//                         {'direction': 'export', 'type': 'abs', 'position': 2, 'chart': 'bar'},
//                         {'direction': 'import', 'type': 'abs', 'position': 3, 'chart': 'dist'},
//                         {'direction': 'import', 'type': 'abs', 'position': 4, 'chart': 'bar'}];

        this.argsList = [{'direction': 'export', 'position': 1, 'chart': 'dist'},
                         {'direction': 'export', 'position': 2, 'chart': 'bar'},
                         {'direction': 'import', 'position': 3, 'chart': 'dist'},
                         {'direction': 'import', 'position': 4, 'chart': 'bar'}];

        this.svg.append('g').attr('id', 'distHeaders');
        this.svg.append('g').attr('id', 'distRowLabels');

        for (let i = 0; i < this.argsList.length; i++)
        {
            let direction = this.argsList[i].direction;
            let type = this.argsList[i].type;
            let chart = this.argsList[i].chart;
            this.svg.append("g").attr("id", chart + "_" + direction);
        }

    };

    /**
     * Creates the Headers and left column labels of distribution chart
     */
    createHeaders(){

        let that = this;

        let rowLabelsGroups = this.svg.select('#distRowLabels');
        rowLabelsGroups = rowLabelsGroups.selectAll('g')
                                         .data(this.allCodes);

        let enterLabels = rowLabelsGroups.enter()
                                         .append('g');
        enterLabels.append('text');
        enterLabels.append('rect');

        rowLabelsGroups = enterLabels.merge(rowLabelsGroups);

        rowLabelsGroups.select('text')
                       .text((d) => this.codeSemantics[d])
                       .classed('distChartHighlightedProduct', (d) => {
                           return +d == that.selectedCode;
                       })
                       .attr('x', this.groupMargin.left)
                       .attr('y', (d) => this.allYScale(that.codeSortingOrder[+d] + .5))
                       .classed('distChartRowLabels', true);
        rowLabelsGroups.select('rect')
                       .classed('distChartRowLabelOverlay', true)
                       .attr('x', this.groupMargin.left)
                       .attr('y', (d) => this.allYScale(that.codeSortingOrder[+d]))
                       .attr('width', this.groupWidth)
                       .attr('height', this.groupHeight)
                       .on('click', (d) => {
                           d3.event.stopPropagation();
                           if (d == that.selectedCode)
                           {
                               that.updatePlot(that.selectedCountry, that.year, 'all');
                           }
                           else
                           {
                               that.updatePlot(that.selectedCountry, that.year, d);
                           }
                       });

        let headersGroups = this.svg.select('#distHeaders');
        headersGroups = headersGroups.selectAll('g')
                                     .data(this.headers);
        let enterHeaders = headersGroups.enter()
                                        .append('g');
        enterHeaders.append('text');
        enterHeaders.append('rect');

        headersGroups = enterHeaders.merge(headersGroups);

        headersGroups.select('text')
                     .text((d) => d.name)
                     .attr('x', (d, i) => this.groupMargin.left + (i * this.groupWidth))
                     .attr('y', this.allYScale(0.5))
                     .classed('distChartHeaders', true);
        headersGroups.select('rect')
                     .classed('distChartHeaderOverlay', true)
                     .attr('x', (d, i) => this.groupMargin.left + (i * this.groupWidth))
                     .attr('y', this.groupMargin.top)
                     .attr('width', this.groupWidth)
                     .attr('height', this.groupHeight)
                     .on('click', (d) => {
                         d3.event.stopPropagation();
                         let direction = d.direction;
                         if (direction == 'none')
                         {
                             updatePlot(that.selectedCountry, that.year, 'all');
                         }
                         let chart = d.chart;
                         that.sortCodes(direction, chart);});

    };

    /*
     * Updates chart given selected country
     *
     * @param data import/export data filtered to a single year
     * @param country 3 character id of selected country
     */
    update (data, filteredData, selectedCountry){
        
        // TODO Maybe Transitions?

        // TODO Allow User to switch betwen per capit and absolute
        
        // TODO (Maybe) use kernel function to show distribution

        this.data = data;
        this.filteredData = filteredData;
        this.selectedCountry = selectedCountry;
        this.createHeaders();

        for (let i = 0; i < this.argsList.length; i++)
        {
            if (this.argsList[i].chart == 'dist'){
                this.updateDistCharts(data, this.argsList[i], selectedCountry);
            }

            if (this.argsList[i].chart == 'bar'){
                this.updateBarCharts(filteredData, this.argsList[i], selectedCountry);
            }
        }

    };

    updatePerCapita () {
        
        for (let i = 0; i < this.argsList.length; i++)
        {
            if (this.argsList[i].chart == 'dist'){
                this.updateDistCharts(this.data, this.argsList[i], this.selectedCountry);
            }

            if (this.argsList[i].chart == 'bar'){
                this.updateBarCharts(this.filteredData, this.argsList[i], this.selectedCountry);
            }
        }

    };

    /**
     * Given selected country and data args, generates a column of the distribution chart
     *
     * @param data data filtered by the selected year
     * @param args selected row of this.argsList. Specifies direction, type, and position of column data
     * @param country the 3 char id of selected country
     */

    updateBarCharts(data, args, country){

        let that = this;

        let direction = args.direction;
        let type = this.type;
        let position = +args.position;
        let chart = args.chart;

        let fData = data.filter((d) => d.type == direction && d.code != 'all');

        if (fData.length == 0)
        {
            let container = this.svg.select('#' + chart + "_" + direction);
            let groups = container.selectAll("g")
                                  .data(fData);
            groups.exit().remove();
            return;
        }

        let max = 0;

        for (let i = 0; i < fData.length; i++)
        {
            let val = 0;
            if (type == "abs")
            {
                val = fData[i].countries.wld;
            }
            
            if (type == "percap")
            {
                val = fData[i].countries.wld / fData[i].population;
            }

            if (val > max)
            {
                max = val;
            }
        }

        // Note: I deliberately subtract right margin twice for range to provide some padding
        this.barChartScale = d3.scaleLinear()
                              .domain([0,max])
                              .range([0, this.groupWidth - this.groupMargin.left - this.groupMargin.right - this.groupMargin.right]); 

        let container = this.svg.select('#' + chart + "_" + direction);

        let groups = container.selectAll("g")
                              .data(fData);
        groups.exit().remove();

        let enterGroups = groups.enter()
                                .append('g');

        enterGroups.append('rect').classed("distChartBar", true);
        enterGroups.append("rect").classed('distChartBackground', true);
        enterGroups.append("text");

        groups = enterGroups.merge(groups);

        // Update Bar charts

        let rects = groups.select('.distChartBar')
                          .datum((d) => {
                              return d;
                          });

        rects.attr('x',(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         return rightShift + that.groupMargin.left;
                     }))
                     .attr('y', ((d) => that.allYScale(that.codeSortingOrder[+d.code]) + that.groupMargin.top + that.groupHeight * .25))
                     .attr('height', (that.groupHeight - that.groupMargin.top - that.groupMargin.bottom) / 2)
                     .attr('width', (d) => {
                         if (type == "abs")
                         {
                             return that.barChartScale(d.countries.wld);
                         }
                         if (type == "percap")
                         {
                             return that.barChartScale(d.countries.wld / d.population);  
                         }
                         return;
                     })
                     .classed('distChartExports', (d) => d.type == 'export')
                     .classed('distChartImports', (d) => d.type == 'import');

        // Update background

        rects = groups.select(".distChartBackground")
                          .datum((d) => {
                              return d;
                          });

        rects.attr('x',(function(d,i) { 
                         let rightShift = that.groupWidth * position;
                         return rightShift + that.groupMargin.left;
                     }))
                     .attr('y', ((d) => that.allYScale(that.codeSortingOrder[+d.code]) + that.groupMargin.top))
                     .attr('height', this.groupHeight - this.groupMargin.top - this.groupMargin.bottom)
                     .attr('width', this.groupWidth - this.groupMargin.left - this.groupMargin.right)
                     .classed('distChartBackground', true);

        this.barTip.html((d) => {
            return that.bar_tooltip_render(d, d.type);
        });

        groups.call(this.barTip);
        groups.on("mouseover", (d) => {
                 d3.select("#barChartTooltip").classed("hidden", false);
                 d3.event.stopPropagation();
             })
             .on("mousemove", (d) => {
                 this.barTip.show(d);
                 d3.event.stopPropagation();
             })
             .on("mouseout", (d) => { d3.select("#barChartTooltip").classed("hidden", true);});

        
        let texts = groups.select('text')
                          .datum((d) => {
                              return d;
                          });

        texts.attr('x', (d, i) => {
             let rightShift = that.groupWidth * position;
             let offset;
             if (type == "abs")
             {
                 offset = that.barChartScale(d.countries.wld);
             }
             if (type == "percap")
             {
                 offset = that.barChartScale(d.countries.wld / d.population);
             }

             if (that.groupMargin.left + offset > that.groupWidth / 2)
             {
                 return rightShift + offset;
             }
             else{
                 return rightShift + (2 * that.groupMargin.left) + offset;
             }
        })
             .attr("y", (d) => that.allYScale(that.codeSortingOrder[+d.code]) + (that.groupMargin.top * 2) + (that.groupHeight / 2))
             .text((d) => {
                 if (type == "abs")
                 {
                     return that.formatNumber(d.countries.wld);
                 }
                 if (type == "percap")
                 {
                     return that.formatNumber(d.countries.wld / d.population);
                 }
                 return;
             })
             .classed("barChartLabelLeft", (d) => {
                 let offset;
                 if (type == "abs")
                 {
                     offset = that.barChartScale(d.countries.wld);
                 }
                 if (type == "percap")
                 {
                     offset = that.barChartScale(d.countries.wld / d.population);
                 }
                 return that.groupMargin.left + offset >= that.groupWidth / 2;
             })
             .classed("barChartLabelRight", (d) => {
                 let offset;
                 if (type == "abs")
                 {
                     offset = that.barChartScale(d.countries.wld);
                 }
                 if (type == "percap")
                 {
                     offset = that.barChartScale(d.countries.wld / d.population);
                 }
                 return that.groupMargin.left + offset < that.groupWidth / 2;
             });

    };

    updateDistCharts(data, args, country) {

        let that = this;

        let direction = args.direction;
        let type = this.type;
        let position = +args.position;
        let chart = args.chart;

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
                     .y0((d) => that.allYScale(that.codeSortingOrder[+d.code] + 1))
                     .y1(function(d,i) { 
                         let base = that.allYScale(that.codeSortingOrder[+d.code] + 1);
                         let height = that.scales[d.code](d.val);
                         return base - height; });

        let container = this.svg.select('#' + chart + "_" + direction);

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
        enterGroups.append("text");

        groups = enterGroups.merge(groups);

        // Set up tooltip
        
        this.distTip.html((d, rank) => {

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
                let currCountry = {'orig': d[i].orig, 'rank': d.length - d[i].rank, 'name': this.getCountryName(d[i].orig), 'val': d[i].val};
                countriesToRender.push(currCountry);
            }

            return this.dist_tooltip_render(countriesToRender, d.length - rank);
        });

        groups.call(this.distTip);
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
                 this.distTip.show(d, rank);
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
                     .attr('y', ((d) => that.allYScale(that.codeSortingOrder[+d[0].code]) + that.groupMargin.top))
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
                     .attr('y', ((d) => that.allYScale(that.codeSortingOrder[+d[0].code]) + that.groupMargin.top))
                     .attr('height', this.groupHeight - this.groupMargin.top - this.groupMargin.bottom)
                     .attr('width', this.groupWidth - this.groupMargin.left - this.groupMargin.right)
                     .classed('distChartRectOverlay', true);
                          

        // Update Area Charts
        let paths = groups.select("path")
                          .datum((d) => {
                              return d;
                          });


        paths.attr('d', area)
             .classed('distChartArea', true)
             .classed('distChartExports', (d) => d[0].direction == 'export')
             .classed('distChartImports', (d) => d[0].direction == 'import');

        // Update Text values
        
        let texts = groups.select("text")
                          .data(selectedCountryData);
        texts.attr('x', (d) => {
                if (d.length == 0){
                    return 0;
                }
                let rightShift = that.groupWidth * position;
                return rightShift + (that.groupMargin.left * 2);
        })
             .attr('y', (d) => {
                 if (d.length == 0){
                     return 0;
                 }
                 return that.allYScale(that.codeSortingOrder[+d[0].code]) + (0.5 * that.groupHeight);
             })
             .text((d) => {
                 if (d.length == 0){
                     return "";
                 }
                 return "#" + (that.dataSizes[d[0].code] - d[0].rank);
             })
             .classed('distChartRankLabel', true);


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
            return that.allYScale(that.codeSortingOrder[+d[0].code]) + that.groupMargin.top;
        })
        .attr("y2", (d) => {
            if (d.length == 0){    // No data for selected country
                return 0;
            }
            return that.allYScale(that.codeSortingOrder[+d[0].code] + 1)}
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

    filterBarChartData(data, direction, country) {
        let that = this;

        let output = [];

        for (let i = 0; i < this.allCodes.length; i++)
        {
            let tmp = data.filter(function(d) {
                return d.type == direction && d.code == that.allCodes[i] && d.orig == country;
            });

            tmp.sort(function(a, b) {
                return d3.ascending(a.val, b.val);
            });

            tmp = this.rank(tmp);

            output.push(tmp);
        }

        return output;

    };
}
