class CountryData {
    /**
     *
     * @param type refers to the geoJSON type- countries are considered features
     * @param properties contains the value mappings for the data
     * @param geometry contains array of coordinates to draw the country paths
     */
    constructor(type, id, properties, geometry, name) {
        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
        this.name = name;
    }
}

class WorldChart {

    constructor (){
        this.selectedProductCode = "all";

        let worldChart = d3.select("#worldHeatChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.legendHeight = 120;
        this.colorRange = ["#ffffff", "#FF0000"];
        this.svgBounds = worldChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        let buttonWrapper = worldChart.append("div");

        this.volumeButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .classed("worldChartOptionSelected", true)
                .on("click", () => {
                    this.selectedOption(this.volumeButton);
                    this.changePerCapita('abs');
                })
                .on("mouseover", () => {
                    this.volumeButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.volumeButton.classed("worldChartOptionHovered", false);
                })
                .text("Volume");
        this.perCapitaButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .on("click", () => {
                    this.selectedOption(this.perCapitaButton);
                    this.changePerCapita('percap');
                })
                .on("mouseover", () => {
                    this.perCapitaButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.perCapitaButton.classed("worldChartOptionHovered", false);
                })
                .text("Per Capita");
        this.exportsButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .classed("worldChartOptionSelected", true)
                .on("click", () => {
                    this.selectedOption(this.exportsButton);
                })
                .on("mouseover", () => {
                    this.exportsButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.exportsButton.classed("worldChartOptionHovered", false);
                })
                .text("Exports");
        this.importsButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .on("click", () => {
                    this.selectedOption(this.importsButton);
                })
                .on("mouseover", () => {
                    this.importsButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.importsButton.classed("worldChartOptionHovered", false);
                })
                .text("Imports");
        // this.dependencyButton = buttonWrapper.append("label")
        //         .classed("worldChartOption", true)
        //         .on("click", () => {
        //             this.selectedOption(this.dependencyButton);
        //         })
        //         .on("mouseover", () => {
        //             this.dependencyButton.classed("worldChartOptionHovered", true);
        //         })
        //         .on("mouseout", () => {
        //             this.dependencyButton.classed("worldChartOptionHovered", false);
        //         })
        //         .text("Dependency");

        this.verticalMargin = 20;
        this.horizontalMargin = 20;

        let worldMapScale = (this.svgHeight - this.verticalMargin*2)/3;
        let geoWinkel3Ratio = 157.0/90;
        let worldMapWidth = worldMapScale*geoWinkel3Ratio*3;
        //let worldMapWidth = this.svgHeight*geoWinkel3Ratio;
        this.svg = worldChart.append("div").append("svg")
                            .attr("width", worldMapWidth)
                            .attr("height", this.svgHeight);

        let svgDefs = this.svg.append("defs");
        let legendGradient = svgDefs.append("linearGradient").attr('id', 'legendGradient').attr("x2", "0%").attr("y2", "100%");
        legendGradient.append("stop").attr("stop-color", this.colorRange[1]).attr("offset", "0");
        legendGradient.append("stop").attr("stop-color", this.colorRange[0]).attr("offset", "1");

        this.legendGroup = this.svg.append("g").attr("transform", "translate(0,20)");
        this.legendGroup.append("rect").attr("width", 10).attr("height", this.legendHeight).attr("fill", "url(#legendGradient)");
        this.legendAxisGroup = this.legendGroup.append("g").attr("transform", "translate(10, 0)");

        this.projection = d3.geoWinkel3().scale(worldMapScale).translate([worldMapWidth/2, this.svgHeight/2]);

        this.highlightedCountryID = 0;
        this.selectedCountryID = 0;

        this.tip = d3.tip().attr('class', 'd3-tip')
                .direction('w')
                .offset(function() {
                    return [0,0];
                })
    };

    selectedOption(button) {
        if( button == this.volumeButton || button == this.perCapitaButton) {
            this.volumeButton.classed("worldChartOptionSelected", false);
            this.perCapitaButton.classed("worldChartOptionSelected", false);
            //this.dependencyButton.classed("worldChartOptionSelected", false);
            button.classed("worldChartOptionSelected", true);
        }
        else {
            this.exportsButton.classed("worldChartOptionSelected", false);
            this.importsButton.classed("worldChartOptionSelected", false);
            //this.dependencyButton.classed("worldChartOptionSelected", false);
            button.classed("worldChartOptionSelected", true);
        }
        this.updateCharts();
    }

    loadedData(tradeData) {
        this.tradeData = tradeData;
    }

    updatePopulationData(populationData) {
        this.populationData = populationData;
    }

    loadedWorld(countryData) {
        this.countryData = countryData;
    }

    addUpdateFunction(updateFunction) {
        this.updateFunction = updateFunction;
    }

    addChangePerCapitaFunction(changePerCapitaFunction) {
        this.changePerCapita = changePerCapitaFunction;
    }

    selected(countryID, year, productCode) {
        this.selectedCountryID = countryID;
        this.selectedYear = year;
        this.selectedProductCode = productCode;
        this.updateCharts();
    }
    formatNumber(number) {
        let thousands = 1000;
        let millions = 1000000;
        let billions = 1000000000;
        let trillions = 1000000000000;
        if (number > trillions) {
            return (number / trillions).toFixed(1) + "T";
        }

        else if (number > billions) {
            return (number / billions).toFixed(1) + "B";
        }

        else if (number > millions) {
            return (number / millions).toFixed(1) + "M";
        }

        else if (number > thousands) {
            return (number / thousands).toFixed(1) + "K";
        }
        return this.sigFigs(number, 2);
    };
    sigFigs(n, sig) {
        var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }
    getSpecificData(countryFrom, countryTo) {
        if( this.tradeData != null ) {
            let onlySelectedCountryData = this.tradeData.filter(datum => {
                return datum.orig == countryFrom;
            });
            let showExports = this.exportsButton.classed("worldChartOptionSelected");
            let filterText = "export";
            if( !showExports ) {
                filterText = "import";
            }
            let filteredData = onlySelectedCountryData.filter(datum => {
                return datum.type == filterText;
            });
            filteredData = filteredData.filter(datum => {
                return datum.code == this.selectedProductCode;
            });
            if( this.selectedYear ) {
                filteredData = filteredData.filter(datum => {
                    return datum.year == this.selectedYear;
                });
            }
            let perCapita = this.perCapitaButton.classed("worldChartOptionSelected");
            let totalExports = 0;
            for(let productType of filteredData) {
                let year = productType.year;
                if( productType.countries[countryTo] ) {
                    let multiplier = 1;
                    if( perCapita ) {
                        if( this.populationData[countryTo] && this.populationData[countryTo][year]) {
                            multiplier = 1.0/this.populationData[countryTo][year];
                        }
                        else {
                            multiplier = 0;
                        }
                    }
                    if( totalExports ) {
                        totalExports += +productType.countries[countryTo] * multiplier;
                    }
                    else {
                        totalExports = +productType.countries[countryTo] * multiplier;
                    }
                }
            }
            return totalExports;
        }
        return -1;
    }
    updateCharts() {
        let that = this;
        this.countryPathElements.classed("countryOutline", false).attr("fill", "#CCCCCC");
        if( this.tradeData != null ) {
            if( this.selectedCountryID != 0 ) {
                let onlySelectedCountryData = this.tradeData.filter(datum => {
                    return datum.orig == this.selectedCountryID;
                });
                let showExports = this.exportsButton.classed("worldChartOptionSelected");
                let filterText = "export";
                if( !showExports ) {
                    filterText = "import";
                }
                let filteredData = onlySelectedCountryData.filter(datum => {
                    return datum.type == filterText;
                });
                filteredData = filteredData.filter(datum => {
                    return datum.code == this.selectedProductCode;
                });
                if( this.selectedYear ) {
                    filteredData = filteredData.filter(datum => {
                        return datum.year == this.selectedYear;
                    });
                }
                let perCapita = this.perCapitaButton.classed("worldChartOptionSelected");
                let totalExportsPerCountry = [];
                for(let productType of filteredData) {
                    let year = productType.year;
                    for(let country of Object.keys(productType.countries).filter(country => country != "wld")) {
                        let multiplier = 1;
                        if( perCapita ) {
                            if( this.populationData[country] && this.populationData[country][year]) {
                                multiplier = 1.0/this.populationData[country][year];
                            }
                            else {
                                multiplier = 0;
                            }
                        }
                        if( totalExportsPerCountry[country] ) {
                            totalExportsPerCountry[country] += +productType.countries[country] * multiplier;
                        }
                        else {
                            totalExportsPerCountry[country] = +productType.countries[country] * multiplier;
                        }
                    }
                }
                let max = Math.max(...Object.entries(totalExportsPerCountry).map(d => d[1]));
                let colorScale = d3.scaleLinear().domain([0, max]).range(this.colorRange);
                let axisScale = d3.scaleLinear().domain([max, 0]).range([0,this.legendHeight-1]).nice();
                //this.legendAxisGroup.call(d3.axisRight().scale(axisScale).ticks(6, ",f"));
                this.legendAxisGroup.call(d3.axisRight().scale(axisScale).tickFormat((d) => that.formatNumber(d)));
                Object.keys(totalExportsPerCountry).map(d => {
                    d3.select("#path-" + d )
                                 .attr("fill", colorScale(totalExportsPerCountry[d]));
                });
            }
        }
        let selectedNode = d3.select("#path-" + this.selectedCountryID );
        if( selectedNode != null ) {
            selectedNode.attr("fill", "green");
        }
        let highlightedNode = d3.select("#path-" + this.highlightedCountryID );
        if( highlightedNode != null ) {
            highlightedNode.attr("fill", "gray");
        }
    }

    tooltip_render(tooltip_data) {
        let text = "<span style='font-size: " + 16 + "pt;'><b>" + tooltip_data.title + "</b></span><br>";
        let perCapita = this.perCapitaButton.classed("worldChartOptionSelected");
        if( tooltip_data.data != -1 ) {
            let showExports = this.exportsButton.classed("worldChartOptionSelected");
            let tradeType = "Exports";
            if( !showExports ) {
                tradeType = "Imports";
            }
            if( perCapita ) {
                text += "Per Capita " + tradeType + ": ";
            }
            else {
                text += tradeType + ": ";
            }
            text += this.formatNumber(tooltip_data.data);
        }
        return text;
    }

    createCharts() {


        let path = d3.geoPath()
                .projection(this.projection);

        console.log("finished adding normal map components, now adding graticule");
        let graticule = d3.geoGraticule();
        let outlineGroup = this.svg.append("g");
        outlineGroup.append("path")
                .datum(graticule)
                .classed('worldMapGraticule', true)
                .attr('d', path);

        outlineGroup.append("path")
                .datum({type: "Sphere"})
                .classed('worldMapOutline', true)
                .attr("d", path);
        
        // Bind data and create one path per GeoJSON feature
        let pathSelection = this.svg.selectAll("path").filter('.world-path')
                .data(this.countryData);
        this.tip.html((d)=> {
            let tooltip_data = {
                    "title": d.name,
                    "data": this.getSpecificData(this.selectedCountryID, d.id)
                };
			return this.tooltip_render(tooltip_data);
        });
        
		this.svg.call(this.tip);
        this.svg.on("mouseover", () => {
            d3.event.stopPropagation();
            this.highlightedCountryID = 0;
            this.updateCharts();
        });
        let pathEnterSelection = pathSelection.enter()
                .append("path")
                .attr("d", d => path(d))
                .attr("id", d => 'path-' + d.id)
                .on("mouseover", d => {
                    d3.event.stopPropagation();
                    this.highlightedCountryID = d.id;
                    this.updateCharts();
                    this.tip.show(d);
                })
                .on("mouseout", this.tip.hide)
                .on("click", d => {
                    d3.event.stopPropagation();
                    this.highlightedCountryID = 0;
                    this.updateFunction(d.id, this.selectedYear, this.selectedProductCode); // Needs to be changed
                })
                .classed('world-path', true);
        pathSelection.exit().remove();
        pathSelection = pathEnterSelection.merge(pathSelection);

        this.countryPathElements = pathSelection;


    };
    /*
     * Formats a number in an easier to read format, e.g. in millions/billions, etc.
     *
     * @param number The number to be formatted
     *
     * @return formatted number
     */

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
}
