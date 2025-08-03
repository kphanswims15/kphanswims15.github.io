function drawComparisonScene(data, industry) {
  state.scene = "comparison";
  d3.select("#compareButton").style("display", "none"); // Hide compare button
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

  // Y-axis
  g.append("g").call(d3.axisLeft(y));

  // X-axis (NEW)
  g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x).ticks(6));

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

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .text(`${industry}: Weekly Pay vs. National Average`);
}