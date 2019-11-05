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

// http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson
// d3.json("nyc.json", function(error, nyc) {
//   if (error) throw error;

  
//       // .on("mouseenter", function(d) {
//       //   d3.select(this)
//       //   .style("stroke-width", 1.5)
//       //   .style("stroke-dasharray", 0)

//       //   d3.select("#neighborhoodPopover")
//       //   .transition()
//       //   .style("opacity", 1)
//       //   .style("left", (d3.event.pageX) + "px")
//       //   .style("top", (d3.event.pageY) + "px")
//       //   .text(d.properties.neighborhood)

//       // })
//       // .on("mouseleave", function(d) { 
//       //   d3.select(this)
//       //   .style("stroke-width", .25)
//       //   .style("stroke-dasharray", 1)

//       //   d3.select("#cneighborhoodPopoverountyText")
//       //   .transition()
//       //   .style("opacity", 0);
//       // });
//   console.log(nyc.features)
//   // var point_group = create_dom_element('g');
//   // for(var i = 0; i < points_data.length; i++)  {
//   //   var circle_elem = create_circle_element(points_data[i]);
//   //   point_group.appendChild(circle_elem);
//   // }
// });



function plot_it()  {
  var path = d3.geoPath()
      .projection(d3.geoConicConformal()
      .parallels([33, 45])
      .rotate([96, -39])
      .fitSize([width, height], nyc_data));

  svg.selectAll("path")
      .data(nyc_data.features)
      .enter().append("path")
      .attr("d", path);
}

