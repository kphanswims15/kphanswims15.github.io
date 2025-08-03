const svg = d3.select("#chart");
const width = +svg.attr("width");
let height = 1000;

const margin = { top: 60, right: 40, bottom: 40, left: 300 };
const state = {
  selectedIndustry: null,
  scene: "overview"
};

d3.csv("cleaned_gender_pay_gap.csv").then(data => {
  data.forEach(d => {
    d.Male_Median = +d.Male_Median;
    d.Female_Median = +d.Female_Median;
    d.Gap_Percent = +d.Gap_Percent;
  });

  drawOverview(data);

  d3.select("#backButton").on("click", () => {
    if (state.scene === "comparison") {
      state.scene = "detail";
      drawDetailScene(data, state.selectedIndustry);
    } else if (state.scene === "detail") {
      state.scene = "overview";
      state.selectedIndustry = null;
      drawOverview(data);
    }
  });
});

function drawOverview(data) {
  state.scene = "overview";
  d3.select("#backButton").style("display", "none");
  d3.select("#compareButton").style("display", "none");

  const newHeight = data.length * 36 + margin.top + margin.bottom;
  svg.attr("height", newHeight);
  height = newHeight;

  svg.selectAll("*").remove();

  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const y = d3.scaleBand()
    .domain(data.map(d => d.Industry))
    .range([0, chartHeight])
    .padding(0.3);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Gap_Percent)]).nice()
    .range([0, chartWidth]);

  g.append("g").call(d3.axisLeft(y).tickSize(0)).selectAll("text").style("font-size", "11px");

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
      state.scene = "detail";
      d3.select("#backButton").style("display", "inline");
      d3.select("#compareButton").style("display", "inline");
      drawDetailScene(data, d.Industry);
    });

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
  state.scene = "detail";
  svg.selectAll("*").remove();
  svg.attr("height", 500);

  const margin = { top: 60, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = 400;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const selected = data.find(d => d.Industry.trim() === industry.trim());
  if (!selected) {
    console.error("Industry not found:", industry);
    return;
  }

  const x = d3.scaleBand()
    .domain(["Men", "Women"])
    .range([0, chartWidth])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([0, Math.max(selected.Male_Median, selected.Female_Median)]).nice()
    .range([chartHeight, 0]);

  g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x));

  g.append("g").call(d3.axisLeft(y));

  const genderData = [
    { group: "Men", value: selected.Male_Median },
    { group: "Women", value: selected.Female_Median }
  ];

  g.selectAll(".detailBar")
    .data(genderData)
    .enter()
    .append("rect")
    .attr("class", "detailBar")
    .attr("x", d => x(d.group))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d.value))
    .attr("fill", d => d.group === "Men" ? "steelblue" : "pink");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text(`${industry}: Weekly Earnings Comparison`);

  d3.select("#compareButton")
    .style("display", "inline")
    .on("click", () => {
      state.scene = "comparison";
      drawComparisonScene(data, industry);
    });
}

function drawComparisonScene(data, industry) {
  state.scene = "comparison";
  d3.select("#compareButton").style("display", "none"); // ✅ Hide button here
  svg.selectAll("*").remove();
  svg.attr("height", 300);

  const margin = { top: 60, right: 40, bottom: 60, left: 100 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = 200;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const selected = data.find(d => d.Industry.trim() === industry.trim());
  const avgMale = d3.mean(data, d => d.Male_Median);
  const avgFemale = d3.mean(data, d => d.Female_Median);

  const chartData = [
    {
      label: "Your Industry",
      male: selected.Male_Median,
      female: selected.Female_Median
    },
    {
      label: "National Average",
      male: avgMale,
      female: avgFemale
    }
  ];

  const x = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => Math.max(d.male, d.female)) * 1.1])
    .range([0, chartWidth]);

  const y = d3.scaleBand()
    .domain(chartData.map(d => d.label))
    .range([0, chartHeight])
    .padding(0.6);

  g.append("g")
    .call(d3.axisLeft(y));

  // Dumbbell lines
  g.selectAll(".line")
    .data(chartData)
    .enter()
    .append("line")
    .attr("x1", d => x(d.female))
    .attr("x2", d => x(d.male))
    .attr("y1", d => y(d.label) + y.bandwidth() / 2)
    .attr("y2", d => y(d.label) + y.bandwidth() / 2)
    .attr("stroke", "#999")
    .attr("stroke-width", 2);

  // Female dots
  g.selectAll(".femaleDot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "femaleDot")
    .attr("cx", d => x(d.female))
    .attr("cy", d => y(d.label) + y.bandwidth() / 2)
    .attr("r", 5)
    .attr("fill", "pink");

  // Male dots
  g.selectAll(".maleDot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "maleDot")
    .attr("cx", d => x(d.male))
    .attr("cy", d => y(d.label) + y.bandwidth() / 2)
    .attr("r", 5)
    .attr("fill", "steelblue");

  // Value labels
  g.selectAll(".valueLabelFemale")
    .data(chartData)
    .enter()
    .append("text")
    .attr("x", d => x(d.female) - 10)
    .attr("y", d => y(d.label) + y.bandwidth() / 2 - 10)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text(d => `$${Math.round(d.female)}`);

  g.selectAll(".valueLabelMale")
    .data(chartData)
    .enter()
    .append("text")
    .attr("x", d => x(d.male) + 10)
    .attr("y", d => y(d.label) + y.bandwidth() / 2 - 10)
    .attr("text-anchor", "start")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .text(d => `$${Math.round(d.male)}`);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .text(`${industry}: Weekly Pay vs. National Average`);
}