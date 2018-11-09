class CountryData {
    /**
     *
     * @param type refers to the geoJSON type- countries are considered features
     * @param properties contains the value mappings for the data
     * @param geometry contains array of coordinates to draw the country paths
     */
    constructor(type, id, properties, geometry) {
        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
    }
}

class WorldChart {

    constructor (){
        let worldChart = d3.select("#worldHeatChart");
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        this.svgBounds = worldChart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height;

        this.verticalMargin = 20;
        this.horizontalMargin = 20;

        let worldMapScale = (this.svgHeight - this.verticalMargin*2)/3;
        let geoWinkel3Ratio = 157.0/90;
        let worldMapWidth = worldMapScale*geoWinkel3Ratio*3;
        //let worldMapWidth = this.svgHeight*geoWinkel3Ratio;
        this.svg = worldChart.append("svg")
                            .classed("worldChartSVG", true)
                            .attr("width", worldMapWidth)
                            .attr("height", this.svgHeight);

        this.projection = d3.geoWinkel3().scale(worldMapScale).translate([worldMapWidth/2, this.svgHeight/2]);

        this.highlightedCountryID = 0;
        this.selectedCountryID = 0;

        this.tip = d3.tip().attr('class', 'd3-tip')
                .direction('w')
                .offset(function() {
                    return [0,0];
                })
    };

    loadedData(tradeData) {
        this.tradeData = tradeData;
    }

    loadedWorld(world) {
        this.worldJson = world;
    }

    addUpdateFunction(updateFunction) {
        this.updateFunction = updateFunction;
    }

    selectedCountry(filteredData, countryID) {
        this.selectedCountryID = countryID.toUpperCase();
        this.updateCharts();
    }

    updateCharts() {
        this.countryPathElements.attr("fill", "black");
        if( this.selectedCountryID != 0 ) {
            //console.log("searching for " + this.selectedCountryID.toLowerCase() + " in data");
            for( let datum of this.tradeData ) {
                if( datum.orig == this.selectedCountryID.toLowerCase() ) {
                    // console.log("chose datum:");
                    // console.log(datum);
                    for( let dest of Object.keys(datum.countries) ) {
                        d3.select("#path-" + dest.toUpperCase() ).attr("fill", "red");
                    }
                    break;
                }
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
        if( this.highlightedCountryID != 0 ) {
            for( let datum of this.tradeData ) {
                if( datum.orig == this.highlightedCountryID.toLowerCase() ) {
                    console.log(datum);
                    break;
                }
            }
        }
    }

    tooltip_render(tooltip_data) {
        let text = "<h2>" + tooltip_data.countryID + "</h2>";
        return text;
    }

    createCharts() {

        let geojson = topojson.feature(this.worldJson, this.worldJson.objects.countries);

        let countryData = geojson.features.map(country => {
            return new CountryData(country.type, country.id, country.properties, country.geometry);
        });
        let path = d3.geoPath()
                .projection(this.projection);
        
        // Bind data and create one path per GeoJSON feature
        let pathSelection = this.svg.selectAll("path")
                .data(countryData);
        this.tip.html((d)=> {
            let tooltip_data = {
                    "countryID": d.id
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
                    this.updateFunction(d.id);
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
