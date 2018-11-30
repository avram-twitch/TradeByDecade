# Trade by the Decade 

2018 Data Visualization Course Final Project

> Project Page URL: https://strikerz76.github.io/TradeByTheDecade/

> Process Book Page URL:
https://strikerz76.github.io/TradeByTheDecade/ProcessBook.pdf

> Demo Video URL: TBD

## Motivation

> Contemporary public debate deals a lot with the idea of international trade,
> and whether it helps or hurts. In recent years, many major political issues
> deal directly with trade, such as TTIP/TPP, Brexit, and tariffs. There are
> many interesting facets of the debate. Economic and historical theory suggest
> trade is almost always beneficial. Yet political pundits argue that trade
> deficits can hurt certain industries, and may lead to strategic
> vulnerabilities. The motivation for this visualization is to use international
> trade data to contribute to this public debate by showing the connections that
> trading countries create. Admittedly, we come from a pro-trade point-of-view,
> but we believe that there is value in seeing what we export and their
> destinations, as well as what is imported and their origins. We also want to
> stray away from an adversarial “deficit” framework of trade, and focus more on
> what an individual country brings in or sends out.

## Project Structure

We stored files as follows:

* [data] -- All data files, including JSON and CSV files
* [data/countries] -- Data filtered by country
* [data/years] -- Data filtered by their year
* [public] -- All CSS and JavaScript files
* [public/js] -- Our JavaScript Code that implements the charts and dropdown
* [public/css] -- Our stylesheet
* [index.html] -- The main page of our project
* [ProcessBook.pdf] -- Our Process Book

## Project Features

* You can select the focus country in two ways
    * By using the Country dropdown menu at [public/js/dropdown.js]
    * By clicking on the country in the world map view
* [public/js/distChart.js]
    * Clicking on the distribution chart headers (export ranks, exports, etc.)
        toggles sorting for the column
    * Clicking on the product type label in the left column toggles the selected
        product code, impacting the data shown in the world chart and trend chart
    * Clicking "Product Type" clears any selected products
    * Hovering over the distribution charts shows the ranks of countries, associated
        with that spot in the chart
    * Hovering over the bar charts shows the top 5 destination/origins for
        exports/imports, for the selected country
* [public/js/worldChart.js]
    * Clicking on the Volume/Per Capita and import/export buttons impacts the data displayed in the
        world chart and distribution/bar chart
    * Hovering over a country in the world map produces a tooltip that says the
        country name and the data encoded there
* [public/js/trendChart.js]
    * You can change the year by clicking on the circles in the trend chart for the
        associated year, which changes the data displayed in the distribution/bar
        chart and world chart
    
