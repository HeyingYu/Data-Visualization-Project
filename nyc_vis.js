var svg = d3.select("svg")
    width = +svg.attr("width"),
    height = +svg.attr("height");

var svg1 = d3.select('#scatter_plot').attr("transform", "translate(" + 550 + "," + -850 + ")");
var brush2 = d3.brush().extent([[0,0],[height,width]]).on("brush end", scatter_brushed)


var clicked_flag = true;
function process_data(){
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
  var brush = d3.brush().extent([[0,0],[height,width]]).on("brush end", updateChart)
  svg .append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .attr("fill","white")
      .on("brush", brush)
      .on("dblclick",clicked)


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
     .attr('latitude',function(d){return d.latitude})
     .attr('longitude',function(d){return d.longitude})
     .attr('room_type', function(d){ return d.room_type})
     .attr('id',function(d,i) {return i})
  svg.on("dblclick",clicked)
  plot_scatter()
  svg1.call(brush2)





  function clicked(){
      if(clicked_flag == true){
          var width_=width/2,height_=height/2,x_ = -width/2,y_ = -height_,k=1,path_stroke_width = 1.5,
              circle_stroke_width = 0.1,r=1.3;
          clicked_flag = false;
          }
      else{
          var extent = d3.mouse(this)
          var center_x = extent[0],center_y = extent[1]
          var width_=width/2,height_=height/2,x_ = -center_x,y_ = -center_y,k=6,path_stroke_width = 1.5/6,
              circle_stroke_width = 1.5/6,r=1.3/2
          clicked_flag = true
      }

      g   .transition()
          .duration(750)
          .attr("transform", "translate(" + width_ + "," + height_ +
                ")scale(" + k + ")translate(" + x_ + "," + y_ + ")")
          .style("stroke-width", path_stroke_width);

      svg .selectAll("circle"). transition()
          . duration(750)
          .attr("transform", "translate(" + width_ + "," + height_ +
                ")scale(" + k + ")translate(" + x_ + "," + y_ + ")")
          .style("stroke-width", circle_stroke_width)
          .attr('r',r)
  }

  function updateChart() {
      var projection=d3.geoConicConformal()
        .parallels([33, 45])
        .rotate([96, -39])
        .fitSize([width, height], nyc_data)

      var extent = d3.event.selection
      var myCircles = svg.selectAll('circle')
//      myCircles.attr('fill',function(d){
//         return d3.hcl(hue_scale(d.price),chroma_scale(d.price),luminance_scale(d.price)
//      })
      var selectedCircles = myCircles.filter(function(d)  {
          var cur_long = projection([d.longitude,d.latitude])[0];
          var cur_lat = projection([d.longitude,d.latitude])[1];
          // Is the circle in the selection?
          var isBrushed = extent[0][0] <= cur_long && extent[1][0] >= cur_long && // Check X coordinate
                          extent[0][1] <= cur_lat && extent[1][1] >= cur_lat  // And Y coordinate
          return isBrushed;
          })

      selectedCircles.attr('fill', d => d3.hcl(10,40,65))
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
  var x_range_pad = 50, y_range_pad = 130;
  var width = svg1.attr('width'), height = svg1.attr('height');

  var att_scale = d3.scaleBand().domain(selected_atts).range([y_range_pad,height-x_range_pad]).paddingInner(0.2);
  var plot_height = att_scale.bandwidth();
  var x_quantitative_scales = {}, y_quantitative_scales = {};
  selected_atts.forEach((att,i) =>  {
    var extent = d3.extent(airbnb_data, d => d[att]);
    x_quantitative_scales[att] = d3.scaleLinear().domain([extent[0],extent[1]]).range([0,plot_height]).nice();
    y_quantitative_scales[att] = d3.scaleLinear().domain([extent[0],extent[1]]).range([plot_height,0]).nice();
  });


  svg1.selectAll('cols').data(selected_atts).enter().append('g').attr('class','column')
    .attr('transform', d => 'translate('+att_scale(d)+',0)')
    .selectAll('rows').data((d,i) => {
      var unique_rows = selected_atts.filter((_,j) => i <= j);
      return unique_rows.map(d_new => [d,d_new]);
    })
    .enter().append('g')
    .attr('transform', d => 'translate(20,'+att_scale(d[1])+')').attr('class', 'splom')
    .selectAll('points').data(att => {
      return airbnb_data.map(
      function(d,i){
           return [d[att[0]], d[att[1]],i]
      })
    })
    .enter().append('circle')
    .attr('r', 1).attr('fill', d3.hcl(20,60,70)).attr('opacity', 0.4)

  svg1.selectAll('.splom').each(function(att)  {
    var scale_x = x_quantitative_scales[att[0]], scale_y = y_quantitative_scales[att[1]];
    d3.select(this).selectAll('circle').attr('cx', d => scale_x(d[0])).attr('cy', d => scale_y(d[1])).attr('id',d=>d[2])
    d3.select(this).append('g').attr('transform', 'translate(0,0)').call(d3.axisLeft(scale_y).ticks(4))
    a = d3.select(this).append('g').attr('transform', 'translate(0,'+plot_height+')').call(d3.axisBottom(scale_x).ticks(4))
  })
  create_axes_example1(svg1,(height-x_range_pad+20),att_scale)
}


function scatter_brushed(){
  var width = svg1.attr('width'), height = svg1.attr('height');
  var extent = d3.event.selection
  var  flag = ture;
  var selected_column
  var column_group = svg1.selectAll('.column').filter(function(d){
        var currentx = d3.select(this).attr("transform");
        translate_x = currentx.slice(currentx.indexOf("(")+1, currentx.indexOf(")")).split(",")[0]
        if (extent[0][0] <= translate_x && flag ==true)
           console.log(translate_x)
           flag = false
           return true
           }
        else {
           selected_column = d3.select(this)
           return false
        }
  })


//      var myCircles = svg.selectAll('circle')
//      var selectedCircles = myCircles.filter(function(d)  {
//          var cur_long = projection([d.longitude,d.latitude])[0];
//          var cur_lat = projection([d.longitude,d.latitude])[1];
//          // Is the circle in the selection?
//          var isBrushed = extent[0][0] <= cur_long && extent[1][0] >= cur_long && // Check X coordinate
//                          extent[0][1] <= cur_lat && extent[1][1] >= cur_lat  // And Y coordinate
//          return isBrushed;
//          })
//
//      selectedCircles.attr('fill', d => d3.hcl(10,40,65))
//
}