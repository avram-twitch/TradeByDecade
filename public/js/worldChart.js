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
        this.colorRange = ["#000000", "#FF0000"];
        this.svgBounds = worldChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        let buttonWrapper = worldChart.append("div");

        this.volumeButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .classed("worldChartOptionSelected", true)
                .on("click", () => {
                    this.selectedOption(this.volumeButton);
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
                })
                .on("mouseover", () => {
                    this.perCapitaButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.perCapitaButton.classed("worldChartOptionHovered", false);
                })
                .text("Per Capita");
        this.dependencyButton = buttonWrapper.append("label")
                .classed("worldChartOption", true)
                .on("click", () => {
                    this.selectedOption(this.dependencyButton);
                })
                .on("mouseover", () => {
                    this.dependencyButton.classed("worldChartOptionHovered", true);
                })
                .on("mouseout", () => {
                    this.dependencyButton.classed("worldChartOptionHovered", false);
                })
                .text("Dependency");

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
        this.volumeButton.classed("worldChartOptionSelected", false);
        this.perCapitaButton.classed("worldChartOptionSelected", false);
        this.dependencyButton.classed("worldChartOptionSelected", false);
        button.classed("worldChartOptionSelected", true);
        this.updateCharts();
    }

    loadedData(tradeData) {
        this.tradeData = tradeData;
    }

    loadedWorld(countryData) {
        this.countryData = countryData;
    }

    addUpdateFunction(updateFunction) {
        this.updateFunction = updateFunction;
    }

    selected(countryID, year, productCode) {
        this.selectedCountryID = countryID;
        this.selectedYear = year;
        this.selectedProductCode = productCode;
        this.updateCharts();
    }

    updateCharts() {
        this.countryPathElements.classed("countryOutline", false).attr("fill", "white");
        if( this.tradeData != null ) {
            if( this.selectedCountryID != 0 ) {
                let totalExportsPerCountry = [];
                let onlySelectedCountryData = this.tradeData.filter(datum => {
                    return datum.orig == this.selectedCountryID;
                });
                let onlyExportData = onlySelectedCountryData.filter(datum => {
                    return datum.type == "export";
                });
                let filteredData = onlyExportData.filter(datum => {
                    return datum.code == this.selectedProductCode;
                });
                if( this.selectedYear ) {
                    filteredData = filteredData.filter(datum => {
                        return datum.year == this.selectedYear;
                    });
                }
                for(let productType of filteredData) {
                    for(let country of Object.keys(productType.countries)) {
                        if( totalExportsPerCountry[country] ) {
                            totalExportsPerCountry[country] += +productType.countries[country];
                        }
                        else {
                            totalExportsPerCountry[country] = +productType.countries[country];
                        }
                    }
                }
                let max = Math.max(...Object.entries(totalExportsPerCountry).filter(d => d[0] != "wld").map(d => d[1]));
                let colorScale = d3.scaleLinear().domain([0, max]).range(this.colorRange);
                let axisScale = d3.scaleLinear().domain([max, 0]).range([0,this.legendHeight-1]).nice();
                this.legendAxisGroup.call(d3.axisRight().scale(axisScale).tickFormat(d3.format("~s")));
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
        let text = "<h4>" + tooltip_data.title + "</h4>";
        return text;
    }

    createCharts() {

        let path = d3.geoPath()
                .projection(this.projection);
        
        // Bind data and create one path per GeoJSON feature
        let pathSelection = this.svg.selectAll("path")
                .data(this.countryData);
        this.tip.html((d)=> {
            let tooltip_data = {
                    "title": d.name
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
                    this.updateFunction(d.id, '1980', '2');
                });
        pathSelection.exit().remove();
        pathSelection = pathEnterSelection.merge(pathSelection);

        this.countryPathElements = pathSelection;

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

    };
}
