var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

function create_dom_element(element_name)  {
  return document.createElementNS('http://www.w3.org/2000/svg', element_name);
}

function create_circle_element(circle_datum)  {
  var circle_elem = create_dom_element('circle');
  circle_elem.setAttribute('cx', circle_datum.cx);
  circle_elem.setAttribute('cy', circle_datum.cy);
  circle_elem.setAttribute('r', circle_datum.r);
  circle_elem.setAttribute('fill', circle_datum.fill);
  return circle_elem;
}

function plot_it()  {
  var path = d3.geoPath()
      .projection(d3.geoConicConformal()
      .parallels([33, 45])
      .rotate([96, -39])
      .fitSize([width, height], nyc_data));

  var projection=d3.geoConicConformal()
      .parallels([33, 45])
      .rotate([96, -39])
      .fitSize([width, height], nyc_data)

  svg.append('g')
      .attr('id','map')
      .selectAll("path")
      .data(nyc_data.features)
      .enter().append("path")
      .attr("d", path)
      .on("mouseenter", function(d) {
          d3.select(this)
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", 0)

          d3.select("#neighborhoodPopover")
          .transition()
          .style("opacity", 1)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px")
          .text(d.properties.neighborhood)

        })
        .on("mouseleave", function(d) {
          d3.select(this)
          .style("stroke-width", .25)
          .style("stroke-dasharray", 1)

          d3.select("#cneighborhoodPopoverountyText")
          .transition()
          .style("opacity", 0);
        });


  svg.append('g')
     .attr('id','airbnb')
     .selectAll('cirlce')
     .data(airbnb_data)
     .enter()
     .append('circle')
     .attr('cx',function(d){ return projection([d.longitude,d.latitude])[0]})
     .attr('cy',function(d){ return projection([d.longitude,d.latitude])[1]})
     .attr('r',0.5)
     .attr('fill','blue')
     .attr('opacity',0.3)

}

