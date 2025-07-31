const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 60, right: 60, bottom: 140, left: 100 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const state = {
    selectedIndustry: null;
};

function drawOverview(data) {
    // Clear existing content
    svg.selectAll("*").remove();
  
    // Create a group with margin transform
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Set up x and y scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.Industry))
      .range([0, chartWidth])
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Gap_Percent)])
      .nice()
      .range([chartHeight, 0]);
  
    // Draw X axis with rotated labels
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");
  
    // Draw Y axis
    g.append("g").call(d3.axisLeft(y));
  
    // Draw bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Industry))
      .attr("y", d => y(d.Gap_Percent))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.Gap_Percent))
      .attr("fill", "steelblue")
      .on("click", function(event, d) {
        state.selectedIndustry = d.Industry;
        d3.select("#backButton").style("display", "inline");
        drawDetailScene(data, d.Industry);
      });
  
    // Optional annotation for largest gap
    const topGap = data.reduce((a, b) => (a.Gap_Percent > b.Gap_Percent ? a : b));
    g.append("text")
      .attr("class", "annotation")
      .attr("x", x(topGap.Industry) + x.bandwidth() / 2)
      .attr("y", y(topGap.Gap_Percent) - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .style("font-size", "12px")
      .text("Highest gap");
  
    // Chart title
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
        .attr("transform", `translate(${margin.left}, ${marigin.top})`);

    const selected 
}
  
