const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 60, right: 60, bottom: 140, left: 100 };
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

  const x = g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x));
  
  x.selectAll("text")
    .style("text-anchor", "middle")
    .attr("dx", "-0.2em")
    .attr("dy", "0.9em")
    .call(wrap, x.bandwidth());

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Gap_Percent)])
    .nice()
    .range([chartHeight, 0]);

    g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dy", ".35em")
    .call(wrap, x.bandwidth());  

  g.append("g").call(d3.axisLeft(y));

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

  const topGap = data.reduce((a, b) => (a.Gap_Percent > b.Gap_Percent ? a : b));
  g.append("text")
    .attr("class", "annotation")
    .attr("x", x(topGap.Industry) + x.bandwidth() / 2)
    .attr("y", y(topGap.Gap_Percent) - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "red")
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

  const x = d3.scaleBand()
    .domain(["Men", "Women"])
    .range([0, chartWidth])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([0, Math.max(selected.Male_Median, selected.Female_Median)])
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
    .attr("height", d => y(0) - y(d.value))
    .attr("fill", d => d.group === "Men" ? "steelblue" : "pink");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text(`${industry}: Weekly Earnings Comparison`);
}

function wrap(text, width) {
  text.each(function () {
    const text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          lineHeight = 1.1; // ems
    let word,
        line = [],
        lineNumber = 0,
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy") || 0),
        tspan = text.text(null)
                    .append("tspan")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
      }
    }
  });
}
