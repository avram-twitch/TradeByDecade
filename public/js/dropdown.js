
class CountryDropdown {

    constructor() {

    };

    addUpdateFunction(updatePlot) {

        this.updatePlot = updatePlot;
    };

    createDropdown(countryNameData) {

        countryNameData = countryNameData.filter(d => d.id_3char != "wld" && d.id_3char != 'xxa');

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
                   .append("select")
                   .attr('id','dropdown-options')
                   .attr("autocomplete", 'off');

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

        dropCountry.on('change', function(d, i) {
            let countryValue = this.options[this.selectedIndex].value;
            updatePlot(countryValue, that.year, that.code);
        });

    };

    update(selectedCountry, selectedYear, selectedCode) {
        let oldSelectedCountry = this.selectedCountry;
        this.selectedCountry = selectedCountry;
        this.optionsCountry.filter(d => d.id_3char == oldSelectedCountry).attr("selected", null);
        this.optionsCountry.filter(d => d.id_3char == this.selectedCountry).attr("selected", true);
        this.year = selectedYear;
        this.code = selectedCode;       
        console.log('Selected Country:', this.selectedCountry);
    };

}
