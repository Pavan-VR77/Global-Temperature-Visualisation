/**
 * Assignment name: Lab 6 - bar chart
 * First name: Pavan
 * Last name: Vanjre Ravindranath
 * Student ID: 801352266
 */
class BarChart {
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
    const filteredData = {};

    this.data.forEach((item) => {
      const country = item.Country;

      // Initialize the object for the country if it doesn't exist
      if (!filteredData[country]) {
        filteredData[country] = { country, RCP45: null, RCP85: null };
      }

      // Assign the temperature to the correct RCP category
      // This assumes that 'Emission Rate' field holds the RCP value and it's either 'RCP 4.5' or 'RCP 8.5'
      const rcpValue = item["Emission Rate"].trim();
      if (rcpValue === "RCP 4.5") {
        filteredData[country].RCP45 = item["Temperature C"];
      } else if (rcpValue === "RCP 8.5") {
        filteredData[country].RCP85 = item["Temperature C"];
      }
    });
    console.log("filteredData", filteredData);
    const ModifiedDataArray = Object.values(filteredData).slice(0, 7);
    const barWidth = 30;
    const barSpacing = 10;
    const numBars = Object.values(ModifiedDataArray).length;
    // Ensure the totalWidth is enough for all bars and spacing
    vis.totalWidth = numBars * (barWidth + barSpacing);

    console.log("ModifiedDataArray", ModifiedDataArray);
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

    const x0Scale = d3
      .scaleBand()
      .rangeRound([10, 1200 - 20])
      .paddingInner(0.1);

    const x1Scale = d3.scaleBand().padding(0.05);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(ModifiedDataArray, (d) => Math.min(d.RCP45, d.RCP85)),
        d3.max(ModifiedDataArray, (d) => Math.max(d.RCP45, d.RCP85)),
      ])
      .rangeRound([vis.height, 0]);

    // Set the domain for the scales
    x0Scale.domain(ModifiedDataArray.map((d) => d.country));
    x1Scale.domain(["RCP45", "RCP85"]).rangeRound([0, x0Scale.bandwidth()]);

    // Create the x-axis
    const div = vis.svg.append("g").append("div").attr("id", "askdn");

    vis.svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(30," + vis.height + ")")
      .call(d3.axisBottom(x0Scale));

    // Create the y-axis
    vis.svg
      .append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(30,0)")
      .call(d3.axisLeft(yScale));

    // Bind data to the bars
    const bars = vis.svg
      .selectAll(".bar")
      .data(ModifiedDataArray)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(" + x0Scale(d.country) + ",0)");

    // Create the bars for RCP 4.5
    bars
      .selectAll(".bar.rcp45")
      .data((d) => [d])
      .enter()
      .append("rect")
      .attr("class", "bar rcp45")
      .attr("x", (d) => x1Scale("RCP45"))
      .attr("y", (d) => yScale(d.RCP45))
      .attr("width", x1Scale.bandwidth())
      .attr("height", (d) => vis.height - yScale(d.RCP45))
      .attr("fill", "orange");

    // Create the bars for RCP 8.5
    bars
      .selectAll(".bar.rcp85")
      .data((d) => [d])
      .enter()
      .append("rect")
      .attr("class", "bar rcp85")
      .attr("x", (d) => x1Scale("RCP85"))
      .attr("y", (d) => yScale(d.RCP85))
      .attr("width", x1Scale.bandwidth())
      .attr("height", (d) => vis.height - yScale(d.RCP85))
      .attr("fill", "steelblue");
  }

  /**
   * this function is used to prepare the data and update the scales before we render the actual vis
   */
  updateVis() {
    let vis = this;
  }

  /**
   * this function contains the d3 code for binding data to visual elements
   */
  renderVis() {
    let vis = this;
  }
}
