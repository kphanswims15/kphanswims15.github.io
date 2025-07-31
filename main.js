const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 40, bottom: 100, left: 100 };

const state = {
  selectedIndustry: null
};

d3.csv("cleaned_gender_pay_gap.csv").then(data => {
  data.forEach(d => {
    d.Male_Median = +d.Male_Median;
    d.Female_Median = +d.Female_Median;
    d.Gap_Percent = +d.Gap_Percent;
  });
  drawOverview(data);

  d3.select("#backButton").on("click", () => {
    state.selectedIndustry = null;
    d3.select("#backButton").style("display", "none");
    drawOverview(data);
  });
});

function drawOverview(data) {
  svg.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.Industry))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Gap_Percent)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Industry))
    .attr("y", d => y(d.Gap_Percent))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.Gap_Percent))
    .on("click", function(event, d) {
        console.log("Clicked:", d.Industry);
        state.selectedIndustry = d.Industry;
        d3.select("#backButton").style("display", "inline");
        drawDetailScene(data, d.Industry);
      });

  // Optional: annotation
  const topGap = data.reduce((a, b) => (a.Gap_Percent > b.Gap_Percent ? a : b));
  svg.append("text")
    .attr("class", "annotation")
    .attr("x", x(topGap.Industry) + x.bandwidth() / 2)
    .attr("y", y(topGap.Gap_Percent) - 10)
    .text("Highest gap");
}

function drawDetailScene(data, industry) {
    svg.selectAll("*").remove();
  
    // Trim whitespace just in case
    const selected = data.find(d => d.Industry.trim() === industry.trim());
  
    if (!selected) {
      console.error("No matching industry found:", industry);
      return;
    }
  
    console.log("Rendering detail chart for:", selected);
  
    const y = d3.scaleLinear()
      .domain([0, Math.max(selected.Male_Median, selected.Female_Median)])
      .range([height - margin.bottom, margin.top]);
  
    const x = d3.scaleBand()
      .domain(["Men", "Women"])
      .range([margin.left, width - margin.right])
      .padding(0.4);
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
  
    // Bars
    const color = d3.scaleOrdinal()
  .domain(["Men", "Women"])
  .range(["steelblue", "pink"]);

svg.selectAll(".bar")
  .data([
    { group: "Men", value: selected.Male_Median },
    { group: "Women", value: selected.Female_Median }
  ])
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.group))
  .attr("y", d => y(d.value))
  .attr("width", x.bandwidth())
  .attr("height", d => y(0) - y(d.value))
  .attr("fill", d => color(d.group.trim()));
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(`${industry}: Weekly Earnings`);
  }  