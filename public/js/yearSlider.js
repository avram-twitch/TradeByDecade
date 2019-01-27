class YearBar {

    constructor() {

        this.yearBar = d3.select("#YearBar");
        this.margin = {top: 10, right: 20, bottom: 20, left: 20}
        this.svgBounds = this.yearBar.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 50;

        this.drawYearBar();

    };

    drawYearBar() {

        let that = this;

        d3.select('#YearBar')
          .append('div').attr('id', 'activeYearBar');

        let yearSlider = d3.select('#activeYearBar')
                           .append('div').classed('slider-wrap', true)
                           .append('input').classed('slider', true)
                           .attr('type', 'range')
                           .attr('min', 1962)
                           .attr('max', 2014)
                           .attr('value', 2000)
                           .attr('id', 'year-slider');
        yearSlider.style('margin-left', this.margin.left + 'px')
                  .style('margin-right', this.margin.right + 'px');
        this.width = yearSlider.node().getBoundingClientRect().width;
        let sliderLabel = d3.select('.slider-wrap')
                            .append('div').classed('slider-label', true)
                            .append('svg')
                            .attr("id", "slider-label")
                            .attr("height", this.svgHeight)
                            .attr("width", this.width + this.margin.left + this.margin.right);
        let sliderText = sliderLabel.append('text')
                                    .text(2000)
                                    .attr('id', 'slider-text');
        let yearScale = d3.scaleLinear().domain([1962,2014]).range([0,this.width]);
        sliderText.attr('x', yearScale(2000));
        sliderText.attr('y', 20);

        yearSlider.on('input', function() {
                                           that.activeYear = this.value;
                                           that.updatePlot(that.selectedCountry,that.activeYear, that.selectedCode);
                                           d3.event.stopPropagation();
        })
                  .on("click", function() { d3.event.stopPropagation();});
        this.yearSlider = yearSlider;
    };

    addUpdateFunction(updatePlot)
    {
        this.updatePlot = updatePlot;
    };

    updateBar(year) {
        let sliderText = d3.select('#slider-text')
                                    .text(year);
        let yearScale = d3.scaleLinear().domain([1962,2014])
                                        .range([this.margin.left,this.width + this.margin.right]);
        sliderText.attr('x', yearScale(year));
        sliderText.attr('y', 20);
        this.yearSlider.attr('value', year);

    };




}
