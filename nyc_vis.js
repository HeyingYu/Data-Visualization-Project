var svg = d3.select("svg")
    width = +svg.attr("width"),
    height = +svg.attr("height");

var brush = d3.brush().extent([[0,0],[height,width]]).on("brush end", updateChart),idleTimeout,idleDelay = 350;
var idleTimeout
function idled() { idleTimeout = null; }
  svg .append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill","white")
      .on("click", brush);

function create_dom_element(element_name)  {
  return document.createElementNS('http://www.w3.org/2000/svg', element_name);
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
    price_domain = [all_mins['price'],all_maxs['price']]
    hue_scale = d3.scaleLinear().range([60,114]).domain(price_domain)
    chroma_scale = d3.scaleLinear().range([35,32]).domain(price_domain)
    luminance_scale = d3.scaleLinear().range([81,27]).domain(price_domain)
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

  g = svg.append('g')
      .attr('id','map')

  g   .selectAll("path")
      .data(nyc_data.features)
      .enter().append("path")
      .attr("d", path)

  g   .on("mouseenter", function(d) {
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

  g   .call(brush)


  g      .on("mouseleave", function(d) {
          d3.select(this)
          .style("stroke-width", .25)
          .style("stroke-dasharray", 1)

          d3.select("#cneighborhoodPopoverountyText")
          .transition()
          .style("opacity", 0);
  })




  var myCircle =svg.append('g')
     .attr("id","data")
     .selectAll('cirlce')
     .data(airbnb_data)
     .enter()
     .append('circle')
     .attr('cx',function(d){ return projection([d.longitude,d.latitude])[0]})
     .attr('cy',function(d){ return projection([d.longitude,d.latitude])[1]})
     .attr('r',1.3)
     .attr('fill',function(d){ return d3.hcl(hue_scale(d.price),chroma_scale(d.price),luminance_scale(d.price))})
     .attr('stroke',"black")
     .attr("stroke-width",0.1)
     .attr('stroke',"black")
     .attr('opacity',0.5)
     .attr('minimum_nights', function(d){ return d.minimum_nights})
     .attr('availability_365', function(d){ return d.availability_365})
     .attr('neighbourhood_group', function(d){ return d.neighbourhood_group})
     .attr('number_of_reviews', function(d){ return d.number_of_reviews})
     .attr('reviews_per_month', function(d){ return d.reviews_per_month})
     .attr('price', function(d){ return d.price})
     .attr('room_type', function(d){ return d.room_type})


  svg.on("dblclick",function(){
      g   .transition()
      .duration(750)
      .attr("transform", "translate(" + width/2 + "," + height/2 +
            ")scale(" + 1 + ")translate(" + -width/2 + "," + -height/2 + ")")
      .style("stroke-width", 1.5);

     svg .selectAll("circle"). transition()
           . duration(750)
           .attr("transform", "translate(" + width/2 + "," + height/2 +
            ")scale(" + 1 + ")translate(" + -width/2 + "," + -height/2 + ")")
           .style("stroke-width", 0.1)
           .attr('r',1.3)
  });

   plot_scatter()
}







function updateChart() {

  var projection=d3.geoConicConformal()
      .parallels([33, 45])
      .rotate([96, -39])
      .fitSize([width, height], nyc_data)
  // Get the selection coordinate
    extent = d3.event.selection
//
  var myCircles = svg.selectAll('circle')
  var selectedCircles = myCircles.filter(function(d)  {
    var cur_long = projection([d.longitude,d.latitude])[0];
    var cur_lat = projection([d.longitude,d.latitude])[1];
    // Is the circle in the selection?
    var isBrushed = extent[0][0] <= cur_long && extent[1][0] >= cur_long && // Check X coordinate
              extent[0][1] <= cur_lat && extent[1][1] >= cur_lat  // And Y coordinate
    return isBrushed;
  })
  selectedCircles.attr('fill', d => d3.hcl(10,40,65))


  g   .selectAll("path")
      .classed("active", null);

  center_x = (extent[0][0]+extent[1][0])/2
  center_y = (extent[0][1]+extent[1][1])/2

  g   .transition()
      .duration(750)
      .attr("transform", "translate(" + width/2 + "," + height/2 +
            ")scale(" + 6 + ")translate(" + -center_x + "," + -center_y + ")")
      .style("stroke-width", 1.5 / 6);

  myCircles . transition()
           . duration(750)
           .attr("transform", "translate(" + width/2 + "," + height/2 +
            ")scale(" + 6 + ")translate(" + -center_x + "," + -center_y + ")")
           .style("stroke-width", 1.5 / 6)
           .attr('r',1.3/2)
  drawScatterPlot(selectedCircles)
}









function sortNumber(a, b) {
  return a - b;
}


// Function that is triggered when brushing is performed
function drawScatterPlot(selectedCircles) {
  var cur_price = [];
  var cur_reviews = [];
  var cur_availability = [];
  var length = selectedCircles._groups[0].length
  if (selectedCircles._groups[0].length != 0) {
    for (i = 0; i < length; i++) {
      cur_price.push(parseInt(selectedCircles._groups[0][i].getAttribute('price')));
      cur_reviews.push(parseInt(selectedCircles._groups[0][i].getAttribute('reviews_per_month')));
      cur_availability.push(parseInt(selectedCircles._groups[0][i].getAttribute('availability_365')));
    }
    cur_price.sort(sortNumber)
    cur_reviews.sort(sortNumber)
    cur_availability.sort(sortNumber)
    // calculate quantiles
    var min = d3.min(cur_price);
    var min_reviews = d3.min(cur_reviews);
    var min_availability = d3.min(cur_availability);
    var q25 = cur_price[Math.floor(length*.25) - 1];
    var q25_reviews = cur_reviews[Math.floor(length*.25) - 1];
    var q25_availability = cur_availability[Math.floor(length*.25) - 1];
    var q50 = cur_price[Math.floor(length*.5) - 1];
    var q50_reviews = cur_reviews[Math.floor(length*.5) - 1];
    var q50_availability = cur_availability[Math.floor(length*.5) - 1];
    var q75 = cur_price[Math.floor(length*.75) - 1];
    var q75_reviews = cur_reviews[Math.floor(length*.75) - 1];
    var q75_availability = cur_availability[Math.floor(length*.75) - 1];
    var max = d3.max(cur_price);
    var max_reviews = d3.max(cur_reviews);
    var max_availability = d3.max(cur_availability);

    var price_metrics = [min, q25, q75, max, q50]
    var review_metrics = [min_reviews, q25_reviews, q75_reviews, max_reviews, q50_reviews]
    var availability_metrics = [min_availability, q25_availability, q75_availability, max_availability, q50_availability]
    console.log(availability_metrics)

    var chart = new CanvasJS.Chart("PricePlot", {
      animationEnabled: true,
      title:{
        text: "Price Destribution"
      },
      axisY: {
        title: "Price Per Night (in USD)",
        prefix: "$",
        interval: 100
      },
      data: [{
        type: "boxAndWhisker",
        upperBoxColor: "#FFC28D",
        lowerBoxColor: "#9ECCB8",
        color: "black",
        yValueFormatString: "$#,##0",
        dataPoints: [
          { label: "Price", y: price_metrics }
        ]
      }]
    });
    chart.render();

    var reviewchart = new CanvasJS.Chart("ReviewPlot", {
      animationEnabled: true,
      title:{
        text: "Reviews Per Month Destribution"
      },
      axisY: {
        title: "Review Per Month",
        prefix: "#",
        interval: 3
      },
      data: [{
        type: "boxAndWhisker",
        upperBoxColor: "#FFC28D",
        lowerBoxColor: "#9ECCB8",
        color: "black",
        yValueFormatString: "$#,##0",
        dataPoints: [
          { label: "Review", y: review_metrics }
        ]
      }]
    });
    reviewchart.render();


    var availabilitychart = new CanvasJS.Chart("AvailabilityPlot", {
      animationEnabled: true,
      title:{
        text: "Availability Destribution"
      },
      axisY: {
        title: "Availability per year",
        prefix: "#",
        interval: 60
      },
      data: [{
        type: "boxAndWhisker",
        upperBoxColor: "#FFC28D",
        lowerBoxColor: "#9ECCB8",
        color: "black",
        yValueFormatString: "$#,##0",
        dataPoints: [
          { label: "Availability", y: availability_metrics }
        ]
      }]
    });
    availabilitychart.render();
  }

}

function create_axes_example1(base_svg, y_shift, att_scale)  {
  base_svg.append('g').attr('id', 'leftaxis')
    .attr('transform', 'translate(106,0)').call(d3.axisLeft(att_scale))

  d3.select('#leftaxis').selectAll('path').remove()
  d3.select('#leftaxis').selectAll('line').remove()

  base_svg.append('g').attr('id', 'bottomaxis')
    .attr('transform', 'translate(0,'+y_shift+')').call(d3.axisBottom(att_scale))

  d3.select('#bottomaxis').selectAll('path').remove()
  d3.select('#bottomaxis').selectAll('line').remove()
}


function plot_scatter()  {
  var svg1 = d3.select('#scatter_plot');
  var x_range_pad = 50, y_range_pad = 130;
  var width = svg1.attr('width'), height = svg1.attr('height');

  console.log("ba")

  var att_scale = d3.scaleBand().domain(selected_atts).range([y_range_pad,height-x_range_pad]).paddingInner(0.2);
  var plot_height = att_scale.bandwidth();
  var x_quantitative_scales = {}, y_quantitative_scales = {};
  selected_atts.forEach((att,i) =>  {
    var extent = d3.extent(airbnb_data, d => d[att]);
    x_quantitative_scales[att] = d3.scaleLinear().domain([extent[0],extent[1]]).range([0,plot_height]).nice();
    y_quantitative_scales[att] = d3.scaleLinear().domain([extent[0],extent[1]]).range([plot_height,0]).nice();
  });

  svg1.selectAll('cols').data(selected_atts).enter().append('g')
    .attr('transform', d => 'translate('+att_scale(d)+',0)')
    .selectAll('rows').data((d,i) => {
      var unique_rows = selected_atts.filter((_,j) => i <= j);
      return unique_rows.map(d_new => [d,d_new]);
    })
    .enter().append('g')
    .attr('transform', d => 'translate(20,'+att_scale(d[1])+')').attr('class', 'splom')
    .selectAll('points').data(att => {
      return airbnb_data.map(d => [d[att[0]], d[att[1]]]);
    })
    .enter().append('circle')
    .attr('r', 1).attr('fill', d3.hcl(20,60,70)).attr('opacity', 0.4)

  svg1.selectAll('.splom').each(function(att)  {
    var scale_x = x_quantitative_scales[att[0]], scale_y = y_quantitative_scales[att[1]];
    d3.select(this).selectAll('circle').attr('cx', d => scale_x(d[0])).attr('cy', d => scale_y(d[1]))
    d3.select(this).append('g').attr('transform', 'translate(0,0)').call(d3.axisLeft(scale_y).ticks(4))
    d3.select(this).append('g').attr('transform', 'translate(0,'+plot_height+')').call(d3.axisBottom(scale_x).ticks(4))
  })

  create_axes_example1(svg1,(height-x_range_pad+20),att_scale)
}

