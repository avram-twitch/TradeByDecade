
let createDropdownMenu = function(countryNameData, updatePlot){

    // TODO Add selector for year
    
    // TODO Remove World, Areas, etc. from list
    
    countryNameData.sort(function(a, b){
        return d3.ascending(a.name, b.name);
    });

    let dropdownWrap = d3.select("#dropdownMenus").append("div");
    dropdownWrap.classed("dropdown-wrapper", true);
    let countryWrap = dropdownWrap.append("div").classed("dropdown-panel", true);

    countryWrap.append("div")
               .classed("country-label", true)
               .append("text")
               .text("Country:");

    countryWrap.append("div")
               .attr("id", "country-dropdown")
               .classed("dropdown", true)
               .append("div")
               .classed("dropdown-content", true)
               .append("select");

    let dropCountry = countryWrap.select("#country-dropdown")
                                 .select('.dropdown-content')
                                 .select('select');

    let optionsCountry = dropCountry.selectAll("option")
                                    .data(countryNameData);
    optionsCountry.exit().remove();
    let optionsCountryEnter = optionsCountry.enter()
                                            .append("option")
                                            .attr("value", (d, i) => d.id_3char);

    optionsCountryEnter.append("text")
                       .text((d, i) => d.name);

    optionsCountry = optionsCountryEnter.merge(optionsCountry);

    // Default to United States
    let selectedCountry = optionsCountry.filter(d => d.id_3char === "usa")
                                        .attr("selected", true);

    dropCountry.on('change', function(d, i) {
        let countryValue = this.options[this.selectedIndex].value;
        updatePlot(countryValue);
    });

};
