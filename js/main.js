document.addEventListener("DOMContentLoaded", function () {
  // Load data files using d3.json
  Promise.all([d3.json("data/custom.geo.json"), d3.json("data/data.json")])
    .then(([geojsonData, mainData]) => {
      setupVisualizations(mainData, geojsonData);
    })
    .catch((error) => console.error("Error loading the data:", error));
});

function setupVisualizations(mainData, geojsonData) {
  // Setup configurations for the Geo Map and Bar Chart
  const geoMapConfig = {
    parentElement: "#geoMap",
    containerWidth: 1000,
    containerHeight: 700,
    margin: { top: 20, right: 20, bottom: 20, left: 50 },
  };

  const barChartConfig = {
    parentElement: "#barchart-averages",
    containerWidth: 600,
    containerHeight: 400,
    margin: { top: 30, right: 30, bottom: 60, left: 50 },
  };

  // Instantiate visualizations
  const geoMap = new GeoMapVisualization(geoMapConfig, mainData, geojsonData);
  const barChart = new BarChart(barChartConfig, mainData);

  // Initialize interaction panels with dropdowns
  createInteractionPanel(mainData, geoMap, barChart);
}

function createInteractionPanel(data, geoMap, barChart) {
  // Creating multiple dropdowns for different types of data filters
  createDropdown(
    "categorySelect",
    "Select Category",
    [...new Set(data.map((item) => item["Select Category"]))],
    geoMap,
    barChart,
    "category"
  );
  createDropdown(
    "emissionSelect",
    "Emission Rate",
    [...new Set(data.map((item) => item["Emission Rate"]))],
    geoMap,
    barChart,
    "emission"
  );
  createDropdown(
    "timePeriodSelect",
    "Time Period",
    [...new Set(data.map((item) => item["Time Period"]))],
    geoMap,
    barChart,
    "timePeriod"
  );
  createDropdown(
    "temperatureScaleSelect",
    "Temperature Scale",
    ["Celsius", "Fahrenheit"],
    geoMap,
    barChart,
    "temperatureScale"
  );
  createDropdown(
    "probabilitySelect",
    "Probability",
    ["1-In-2 Low", "Median", "1-In-20 High"],
    geoMap,
    barChart,
    "probability"
  );
}

function createDropdown(id, labelText, options, geoMap, barChart, filterType) {
  // Locate or append a div for the controls
  const controlsDiv = d3
    .select(".interact-card")
    .append("div")
    .attr("class", "dropdown mb-3"); // Bootstrap spacing class

  // Append a label for the dropdown
  controlsDiv
    .append("label")
    .attr("for", id)
    .attr("class", "form-label")
    .text(labelText);

  // Create the dropdown element
  const select = controlsDiv
    .append("select")
    .attr("id", id)
    .attr("class", "form-select") // Bootstrap class for styling select elements
    .on("change", function () {
      const selectedOption = d3.select(this).property("value");
      updateVisualizations(selectedOption, geoMap, barChart, filterType);
    });

  // Append options to the dropdown
  select
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  // Optionally, insert a prompt option as the first item
  select
    .insert("option", ":first-child")
    .attr("selected", true)
    .attr("disabled", true)
    .attr("value", "")
    .text(labelText);
}

function updateVisualizations(selectedOption, geoMap, barChart, filterType) {
  // Method to update both visualizations based on the selected dropdown option and type of filter
  geoMap.update(filterType, selectedOption);
  barChart.update(filterType, selectedOption);
}
