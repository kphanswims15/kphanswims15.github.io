const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 60, right: 40, bottom: 40, left: 300 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const state = {
  selectedIndustry: null
};

d3.csv("cleaned_gender_pay_gap.csv").then(data => {
  data.forEach(d => {
    d.Male_Median = +d.Male_Median;
    d.Female_Median = +d.Female_Median;
    d.Gap_Percent = +d.Gap_Percent;
  });

  // Filter out invalid rows
  data = data.filter(d => !isNaN(d.Gap_Percent));

  drawOverview(data);

  d3.select("#backButton").on("click", () => {
    state.selectedIndustry = null;
    d3.select("#backButton").style("display", "none");
    drawOverview(data);
  });
});

function drawOverview(data) {
  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const y = d3.scaleBand()
    .domain(data.map(d => d.Industry))
    .range([0, chartHeight])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Gap_Percent)])
    .nice()
    .range([0, chartWidth]);

  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x));

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d.Industry))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.Gap_Percent))
    .attr("fill", "steelblue")
    .on("click", function(event, d) {
      state.selectedIndustry = d.Industry;
      d3.select("#backButton").style("display", "inline");
      drawDetailScene(data, d.Industry);
    });

  // Add annotation for highest gap
  const topGap = data.reduce((a, b) => (a.Gap_Percent > b.Gap_Percent ? a : b));
  g.append("text")
    .attr("class", "annotation")
    .attr("x", x(topGap.Gap_Percent) + 5)
    .attr("y", y(topGap.Industry) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .style("font-size", "12px")
    .text("Highest gap");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Gender Pay Gap by Industry");
}

function drawDetailScene(data, industry) {
  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const selected = data.find(d => d.Industry.trim() === industry.trim());
  if (!selected) {
    console.error("Industry not found:", industry);
    return;
  }

  const x = d3.scaleLinear()
    .domain([0, Math.max(selected.Male_Median, selected.Female_Median)])
    .range([0, chartWidth]);

  const y = d3.scaleBand()
    .domain(["Men", "Women"])
    .range([0, chartHeight])
    .padding(0.4);

  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x));

  const genderData = [
    { group: "Men", value: selected.Male_Median },
    { group: "Women", value: selected.Female_Median }
  ];

  g.selectAll(".detailBar")
    .data(genderData)
    .enter()
    .append("rect")
    .attr("class", "detailBar")
    .attr("y", d => y(d.group))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.value))
    .attr("fill", d => d.group === "Men" ? "steelblue" : "pink");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text(`${industry}: Weekly Earnings Comparison`);
}