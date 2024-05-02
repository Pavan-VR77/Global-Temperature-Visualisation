class GeoMapVisualization {
  /**
   * class constructor with basic chart configuration
   * @param {Object} _config
   * @param {Array} _data
   * @param {d3.Scale} _colorScale
   */
  constructor(_config, _data, _geojsonData) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 35 },
    };
    this.data = _data;
    this.fitleredData = null;
    this.geojsonData = _geojsonData;
    this.colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([-30, 40]);

    // this.selectedCategory = "Mortality Costs";
    // this.selectedRCP = "RCP 8.5";
    // this.selectedTimePeriod = "Next 20 Years 2020-2039";
    // this.selectedProbability = "Median";
    // this.selectedTemperatureScale = "Celsius";
    this.initVis();
  }

  /**
   * this function is used to initialize scales/axes and append static elements
   */
  initVis() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    d3.select(vis.config.parentElement)
      .append("h2")
      .style("text-align", "center")
      .text("Geo Map");
    let mainDiv = d3.select(vis.config.parentElement);
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("id", "geomap")
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );
    console.log("Country", this.data);

    console.log("Country", [
      ...new Set(
        this.geojsonData.features.map((item) => item["properties"]["name"])
      ),
    ]);
    this.renderVis();
  }

  update(data) {
    this.data = data; // Update the data with the filtered dataset
    this.renderVis(); // Re-render visualization with new data
    this.fitleredData = data.reduce((acc, item) => {
      acc[item.Country] = item;
      return acc;
    }, {});
    console.log(
      "d3 extent",
      d3.extent(data.map((item) => item["Temperature C"]))
    );
    this.colorScale = d3
      .scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain(d3.extent(data.map((item) => item["Temperature C"])));
    console.log("letest this.fitleredData ", this.fitleredData);
  }

  /**
   * this function contains the d3 code for binding data visual elements
   */
  renderVis() {
    let vis = this;

    const projection = d3
      .geoEquirectangular()
      .fitSize([vis.width, vis.height], vis.geojsonData);
    const path = d3.geoPath().projection(projection);
    vis.svg
      .selectAll("path")
      .data(this.geojsonData.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const countryName = d.properties.name;
        // console.log("first", vis.fitleredData);
        if (vis.fitleredData == null) {
          return "#FF0";
        }
        if (!vis.fitleredData[countryName]) {
          // console.error("No data for:", countryName);
          return "#FF7"; // Default color when data is missing
        }
        return vis.colorScale(vis.fitleredData[countryName]["Temperature C"]);
      })
      .attr("stroke", "black");
    // let dataToUse = vis.filteredData || vis.data;
    // vis.svg
    //   .selectAll(".line")
    //   .data(dataToUse)
    //   .join("path")
    //   .attr("class", (d) => `line ${d.species.replaceAll(" ", "_")}`)
    //   .attr("d", (d) => {
    //     return d3.line()(
    //       vis.dimensions.map((dim) => {
    //         const x =
    //           (vis.width / vis.dimensions.length) *
    //             vis.dimensions.indexOf(dim) +
    //           vis.width / vis.dimensions.length / 2 -
    //           93;
    //         const y = vis.yScales[dim](d[dim]);
    //         return [x, y];
    //       })
    //     );
    //   })
    //   .style("fill", "none")
    //   .style("stroke", (d) => vis.colorScale(d.species))
    //   .style("stroke-opacity", 0.5)
    //   .on("mouseover", function (event, d) {
    //     d3.select("#barchart")
    //       .selectAll(".bar")
    //       .style("fill-opacity", (bar) => (bar.species === d.species ? 1 : 0.5))
    //       .style("stroke-width", (bar) => (bar.species === d.species ? 2 : 0))
    //       .style("stroke", (bar) =>
    //         bar.species === d.species ? "black" : "none"
    //       );
    //   })
    //   .on("mouseleave", function () {
    //     d3.select("#barchart")
    //       .selectAll(".bar")
    //       .style("fill-opacity", 1)
    //       .style("stroke-width", 0);
    //   });
  }
}
