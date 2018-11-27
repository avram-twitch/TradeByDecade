
class CountryDropdown {

    constructor() {

    };

    addUpdateFunction(updatePlot) {

        this.updatePlot = updatePlot;
    };

    createDropdown(countryNameData) {

        countryNameData = countryNameData.filter(d => d.id_3char != "wld");

        let that = this;

        countryNameData.sort(function(a, b){
            return d3.ascending(a.name, b.name);
        });

        this.dropdownWrap = d3.select("#dropdownMenus").append("div");
        this.dropdownWrap.classed("dropdown-wrapper", true);
        let countryWrap = this.dropdownWrap.append("div").classed("dropdown-panel", true);

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
        this.optionsCountry = optionsCountry;

        // Default to United States
        this.selectedCountry = optionsCountry.filter(d => d.id_3char === "usa")
                                            .attr("selected", true);

        dropCountry.on('change', function(d, i) {
            let countryValue = this.options[this.selectedIndex].value;
            updatePlot(countryValue, that.year, that.code);
        });

    };

    update(selectedCountry, selectedYear, selectedCode) {
        this.selectedCountry = selectedCountry;
        this.year = selectedYear;
        this.code = selectedCode;
        this.optionsCountry.filter(d => d.id_3char === selectedCountry)
                           .attr("selected", (d) => {
                               return d.id_3char === selectedCountry;
                           });
                               
        console.log('Selected Country:', selectedCountry);
    };


}
