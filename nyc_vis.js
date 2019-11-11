var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// initialize brush
var brush = d3.brush()

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

function process_data(){
    var width = 460,
    height = 1000;
    var svg1 = d3.select('body').append('svg').attr('width', width).attr('height', height).attr('id','data');
    all_mins = {}, all_maxs = {};

    ['price'].forEach(key => {
    all_mins[key] = d3.min(airbnb_data, d => parseInt(d[key]));
    all_maxs[key] = d3.max(airbnb_data, d => parseInt(d[key]));
    });
    price_scale = d3.scaleLinear().domain([all_mins['price'],all_maxs['price']]).range([height-50,0])
    var name_scale=d3.scalePoint()
                     .domain(airbnb_data.map(function(d,i){return i}))
                     .range([50,width])
    svg1.append('g')
        .attr('id','airbnb')
        .selectAll('cirlce')
        .data(airbnb_data)
        .enter()
        .append('circle')
        .attr('cx',function(d,i){ return name_scale(i)})
        .attr('cy',function(d){ return price_scale(d.price)})
        .attr('fill','black')
        .attr('r',0.5)
        .attr('opacity',0.8)

    X_axis_scale = d3.axisBottom().scale(name_scale)
    Y_axis_scale=d3.axisLeft().scale(price_scale)

    svg1.append('g')
        .attr('transform', 'translate('+0+','+(height-50)+')')
        .attr('id','Axis_X')
        .call(X_axis_scale)


    svg1.append('g')
        .attr('transform', 'translate('+50+','+0+')')
        .attr('id','Axis_Y')
        .call(Y_axis_scale)
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


  var myCircle = svg.append('g')
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

  // setup brush - its geometric extent, and add it to our lines group
  brush.extent([[0,0],[height,width]]).on("start end", updateChart)
  d3.select('#dataviz_brushing').call(brush)

  // setup_vis()

}


// Function that is triggered when brushing is performed
function updateChart() {
  var projection=d3.geoConicConformal()
      .parallels([33, 45])
      .rotate([96, -39])
      .fitSize([width, height], nyc_data)
  // Get the selection coordinate
  extent = d3.event.selection

  var myCircles = svg.selectAll('circle')
  myCircles.attr('fill', 'blue');

  myCircles.filter(function(d)  {
    var cur_long = projection([d.longitude,d.latitude])[0];
    var cur_lat = projection([d.longitude,d.latitude])[1];
    // Is the circle in the selection?
    var isBrushed = extent[0][0] <= cur_long && extent[1][0] >= cur_long && // Check X coordinate
              extent[0][1] <= cur_lat && extent[1][1] >= cur_lat  // And Y coordinate
    return isBrushed;
    }).attr('fill', d => d3.hcl(10,40,65))
}


