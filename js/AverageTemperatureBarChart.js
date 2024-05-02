/**
 * Assignment name: Lab 6 - bar chart
 * First name: Pavan
 * Last name: Vanjre Ravindranath
 * Student ID: 801352266
 */
class AverageTemperatureBarChart {
  /**
   * class constructor with basic chart configuration
   * @param {Object} _config
   * @param {Array} _data
   * @param {d3.Scale} _colorScale
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: _config.margin || { top: 5, right: 5, bottom: 20, left: 50 },
    };
    this.data = _data;
    this.selectedCountry = "United States of America";
    this.timePeriod = "End of Century 2080-2099";
    this.rcp = "RCP 4.5";
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

    const totalWidth = vis.width * 6;
    let averageTemparutePercentileData = {};
    let filteredData = {};
    averageTemparutePercentileData = this.data.filter(
      (item) =>
        item["Country"] === this.selectedCountry &&
        (item["Category"] === "Temp - Summer Average" ||
          item["Category"] === "Temp - Winter Average") &&
        item["Time Period"] === this.timePeriod &&
        item["Emission Rate"] === this.rcp
    );
    console.log(
      "averageTemparutePercentileData",
      averageTemparutePercentileData
    );

    d3.select(vis.config.parentElement)
      .append("h2")
      .style("text-align", "center")
      .text("Bar Chart");

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .style("display", "block")
      .attr("id", "barchart");

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left + 30} ,${vis.config.margin.top})`
      );

    vis.xAxis = vis.svg
      .append("g")
      .attr("transform", `translate(30,${vis.height + 5})`);

    vis.yAxis = vis.svg.append("g").attr("transform", `translate(30,0)`);

    this.updateVis();
  }

  /**
   * this function is used to prepare the data and update the scales before we render the actual vis
   */
  updateVis() {
    let vis = this;
    let categories = ["P5th", "P50th", "P95th"];
    let groups = ["Summer", "Winter"];

    let filteredData = this.data.filter(
      (item) =>
        item["Country"] === this.selectedCountry &&
        (item["Category"] === "Temp - Summer Average" ||
          item["Category"] === "Temp - Winter Average") &&
        item["Time Period"] === this.timePeriod &&
        item["Emission Rate"] === this.rcp
    );

    // Prepare the data for the bar groups
    let preparedData = groups
      .map((group) => {
        let categoryData = filteredData.find((d) => d.Category.includes(group));
        if (!categoryData) {
          console.log(`No data found for ${group}`);
          return []; // Return empty array if no data found
        }
        return categories.map((cat) => ({
          group,
          category: cat,
          value: categoryData[cat] || 0, // Use 0 as default if undefined
        }));
      })
      .flat();
    console.log("preparedData", preparedData);
    if (preparedData.length === 0) {
      console.error("No data available to render the chart.");
      return; // Exit if no data to render
    }

    vis.xScale = d3
      .scaleBand()
      .range([0, vis.width - 20])
      .domain(preparedData.map((d) => `${d.group} ${d.category}`))
      .padding(0.1);

    vis.yScale = d3
      .scaleLinear()
      .range([vis.height, 0])
      .domain([0, d3.max(preparedData, (d) => d.value)]);

    // Update the axes
    vis.xAxis.call(d3.axisBottom(vis.xScale));
    vis.yAxis.call(d3.axisLeft(vis.yScale));

    // Bind data and create bars
    let bars = vis.svg
      .selectAll(".bar")
      .data(preparedData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => 30 + vis.xScale(`${d.group} ${d.category}`))
      .attr("width", vis.xScale.bandwidth() - 2)
      .attr("y", (d) => vis.yScale(d.value))
      .attr("height", (d) => vis.height - vis.yScale(d.value))
      .attr("fill", (d) => (d.group === "Summer" ? "orange" : "steelblue"));
  }

  /**
   * this function contains the d3 code for binding data to visual elements
   */
  renderVis() {
    let vis = this;
  }
}
