/**
 * Assignment name: Lab 6 - parallel coordinates
 * First name: Pavan
 * Last name: Vanjre Ravindranath
 * Student ID: 801352266
 */
class ParallelCoordinates {
  /**
   * class constructor with basic chart configuration
   * @param {Object} _config
   * @param {Array} _data
   * @param {d3.Scale} _colorScale
   */
  constructor(_config, _data, _colorScale) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 35 },
    };
    this.data = _data;
    this.colorScale = _colorScale;
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
      .text("Parallel Plot");

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("id", "parallelplot")
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left + 40},${
          vis.config.margin.top + 10
        })`
      );

    // Define dimensions and create a scale for each.
    vis.dimensions = [
      "culmen_length_mm",
      "culmen_depth_mm",
      "flipper_length_mm",
      "body_mass_g",
    ];
    vis.yScales = {};
    vis.dimensions.forEach((dim, index) => {
      vis.yScales[dim] = d3.scaleLinear().range([0,vis.height]);

      // Append axis groups
      let axis = d3.axisLeft(vis.yScales[dim]);
      let axisGroup = vis.svg
        .append("g")
        .attr("class", "axis")
        .attr(
          "transform",
          `translate(${(index * vis.width) / vis.dimensions.length}, 0)`
        )
        .call(axis);

      // Append axis titles (now positioned above the axis)
      axisGroup
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", `translate(0, -10)`) 
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(dim);
    });
  }

  /**
   * this function is used to prepare the data and update the scales before we render the actual vis
   */
  updateVis() {
    let vis = this;

    vis.dimensions.forEach((dim) => {
      vis.yScales[dim].domain(d3.extent(vis.data, (d) => +d[dim]));
    });

    vis.renderVis();
  }

  filterBySpecies(species) {
    let vis = this;
    if (species) {
      vis.filteredData = vis.data.filter((d) => d.species === species);
    } else {
      vis.filteredData = null;
    }

    vis.renderVis(); 
  }

  /**
   * this function contains the d3 code for binding data visual elements
   */
  renderVis() {
    let vis = this;
    let dataToUse = vis.filteredData || vis.data;
    vis.svg
      .selectAll(".line")
      .data(dataToUse)
      .join("path")
      .attr("class", (d) => `line ${d.species.replaceAll(" ", "_")}`)
      .attr("d", (d) => {
        return d3.line()(
          vis.dimensions.map((dim) => {
            const x =
              (vis.width / vis.dimensions.length) *
                vis.dimensions.indexOf(dim) +
              vis.width / vis.dimensions.length / 2 -
              93;
            const y = vis.yScales[dim](d[dim]);
            return [x, y];
          })
        );
      })
      .style("fill", "none")
      .style("stroke", (d) => vis.colorScale(d.species))
      .style("stroke-opacity", 0.5)
      .on("mouseover", function (event, d) {
       
        d3.select("#barchart")
          .selectAll(".bar")
          .style("fill-opacity", (bar) => (bar.species === d.species ? 1 : 0.5))
          .style("stroke-width", (bar) => (bar.species === d.species ? 2 : 0))
          .style("stroke", (bar) =>
            bar.species === d.species ? "black" : "none"
          );
      })
      .on("mouseleave", function () {
        
        d3.select("#barchart")
          .selectAll(".bar")
          .style("fill-opacity", 1)
          .style("stroke-width", 0);
      });
  }
}
