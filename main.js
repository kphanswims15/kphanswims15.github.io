
const svg = d3.select("#chart");
const width = +svg.attr("width");
let height = 1000;

const margin = { top: 60, right: 40, bottom: 40, left: 300 };
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
    window.scrollTo({ top: 0, behavior: 'auto' });
    drawOverview(data);
  });
});

function drawOverview(data) {
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
    .domain([0, d3.max(data, d => d.Gap_Percent)])
    .nice()
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
      d3.select("#backButton").style("display", "inline");
      d3.select("#compareButton").style("display", "inline");
      window.scrollTo({ top: 0, behavior: 'auto' });
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
