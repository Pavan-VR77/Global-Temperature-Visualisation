let mainData = null;

let currentFilters = {
  "Select Category": "Average Dec/Jan/Feb Temps",
  "Emission Rate": "RCP 8.5",
  "Time Period": "Historical 1986-2005",
  temperatureScale: "Celsius",
  Probability: "Median",
};

const probabilityMapping = {
  Median: "P50th",
  "1-In-2 Low": "P5th",
  "1-In-20 High": "P95th",
};

document.addEventListener("DOMContentLoaded", function () {
  // Load data files using d3.json
  Promise.all([d3.json("data/custom.geo.json"), d3.json("data/data.json")])
    .then(([geojsonData, data]) => {
      mainData = data;
      setupVisualizations(mainData, geojsonData);
    })
    .catch((error) => console.error("Error loading the data:", error));
});

function setupVisualizations(mainData, geojsonData) {
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

  const geoMap = new GeoMapVisualization(geoMapConfig, mainData, geojsonData);
  const barChart = new AverageTemperatureBarChart(barChartConfig, mainData);

  createInteractionPanel(mainData, geoMap, barChart);
  updateVisualizations(geoMap, barChart); // Call this function here to apply the default filter immediately
}

function createInteractionPanel(data, geoMap, barChart) {
  // Creating multiple dropdowns for different types of data filters
  createDropdown(
    "categorySelect",
    "Select Category",
    [...new Set(data.map((item) => item["Select Category"]))],
    geoMap,
    barChart,
    "Select Category",
    "Average Dec/Jan/Feb Temps"
  );
  createDropdown(
    "emissionSelect",
    "Emission Rate",
    [...new Set(data.map((item) => item["Emission Rate"]))],
    geoMap,
    barChart,
    "Emission Rate",
    "RCP 8.5"
  );
  createDropdown(
    "timePeriodSelect",
    "Time Period",
    [...new Set(data.map((item) => item["Time Period"]))],
    geoMap,
    barChart,
    "Time Period",
    "Historical 1986-2005"
  );
  createDropdown(
    "temperatureScaleSelect",
    "Temperature Scale",
    ["Celsius", "Fahrenheit"],
    geoMap,
    barChart,
    "temperatureScale",
    "Celsius"
  );
  createDropdown(
    "probabilitySelect",
    "Probability",
    ["1-In-2 Low", "Median", "1-In-20 High"],
    geoMap,
    barChart,
    "probability",
    "Median"
  );
}

function createDropdown(id, labelText, options, geoMap, barChart, filterType) {
  const controlsDiv = d3
    .select(".interact-card")
    .append("div")
    .attr("class", "dropdown mb-3");

  controlsDiv
    .append("label")
    .attr("for", id)
    .attr("class", "form-label")
    .text(labelText);

  const select = controlsDiv
    .append("select")
    .attr("id", id)
    .attr("class", "form-select")
    .on("change", function () {
      const selectedOption = d3.select(this).property("value");
      currentFilters[filterType] = selectedOption;
      updateVisualizations(geoMap, barChart);
    });

  select
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)
    .property("selected", (d) => d === currentFilters[filterType]); // Reflect the current filter state
}

function updateVisualizations(geoMap, barChart) {
  console.log(
    "Applying filters sequentially with current settings:",
    currentFilters
  );

  // Start with the full dataset
  let filteredData = mainData;

  // Apply Category filter first
  if (currentFilters["Select Category"]) {
    filteredData = filteredData.filter(
      (item) => item["Select Category"] === currentFilters["Select Category"]
    );
  }

  // Then apply Emission Rate filter on the result of the Category filter
  if (currentFilters["Emission Rate"]) {
    filteredData = filteredData.filter(
      (item) => item["Emission Rate"] === currentFilters["Emission Rate"]
    );
  }

  // Apply Time Period filter next
  if (currentFilters["Time Period"]) {
    filteredData = filteredData.filter(
      (item) => item["Time Period"] === currentFilters["Time Period"]
    );
  }

  // // Apply Temperature Scale; adjust data field based on temperature scale
  // const temperatureKey =
  //   currentFilters["temperatureScale"] === "Celsius"
  //     ? "Temperature C"
  //     : "Temperature F";
  // filteredData = filteredData.map((item) => ({
  //   ...item,
  //   Temperature: item[temperatureKey],
  // }));

  // // Finally, apply Probability filter and map to a common key
  // if (currentFilters["Probability"]) {
  //   const probabilityKey = probabilityMapping[currentFilters["Probability"]];
  //   filteredData = filteredData.map((item) => ({
  //     ...item,
  //     ProbabilityValue: item[probabilityKey],
  //   }));
  // }

  console.log("Filtered Data: ", filteredData);

  // Update the visualizations with the fully filtered dataset
  geoMap.update(filteredData);
  // AverageTemperatureBarChart.update(filteredData);
}
