function pair(array) {
    return array.slice(1).map(function(b, i) {
    return [array[i], b];
  });
}

// Look up for nice labels
var look_up = {
  "mean_height_est" : "Height estimated, cm",
  "mean_height_obs" : "Height observed, cm",
  "mean_bmi_est"    : "BMI estimated, bmi units",
  "mean_bmi_obs"    : "BMI observed, bmi units"
};

//Width and height
var w = 600;
var h = 600;
var marginTop = 20;
var pad = 20;

var look_up_pane_pos = {
  "mean_height_est" : { "top" : marginTop,      "left" : pad },
  "mean_height_obs" : { "top" : marginTop,      "left" : w + pad },
  "mean_bmi_est"    : { "top" : h + marginTop,  "left" : pad },
  "mean_bmi_obs"    : { "top" : h + marginTop,  "left" : w + pad },
};

// color scale 
var color = d3.scale.linear()
              .range(["#4575b4", "#ffffbf", "#a50026"])
              .interpolate(d3.interpolateHcl);

// scale bar scales
var x = d3.scale.linear().range([0, 320]);

// Europe projection
var projection = d3.geo.mercator()
                   .center([13, 50])
                   .rotate([0, 0, 0])
                   .scale(450)
                   .translate([w * 0.6, h * 0.6]);

// Define default path generator
var path = d3.geo.path()
                 .projection(projection);

// Create SVG element
// var svg = d3.select("body")
//       .append("svg")
//       .attr("width", w)
//       .attr("height", h);


// var g = svg.append("g")
//            .attr("class", "key")
//            .attr("transform", "translate(140,100)");

// define xAxis
// var xAxis = d3.svg.axis()
//               .scale(x)
//               .orient("bottom")
//               .tickSize(13);

// // draw scale bar
 // g.selectAll("rect")
 //  .data(pair(x.ticks(20)))
 //  .enter().append("rect")
 //  .attr("height", 8)
 //  .attr("x", function(d) { return x(d[0]); })
 //  .attr("width", function(d) { return x(d[1]) - x(d[0]); })
 //  .style("fill", function(d) { return color(d[0]); });

// -----------------------------------------------------------------------------------------------------------------
var traits = ["mean_height_est", "mean_height_obs", "mean_bmi_est", "mean_bmi_obs"];

var mytrait = d3.select("#chart").selectAll(".trait")
                .data(traits)
                .enter().append("div")
                .attr("class", "trait")
                .style("top", function(d) { return look_up_pane_pos[d].top + "px"; })
                .style("left", function(d, i) { return look_up_pane_pos[d].left + "px"; })
                .append("svg").attr("width", w)
                              .attr("height", h)
                              .attr("class", "geo")
                              .attr("id", function(d) { return d; });



d3.json("final_tj.json", function(error, europe) {
    var subunits = topojson.feature(europe, europe.objects.subunits);


traits.forEach(function(trait) {
      var svg_container = d3.select("#" + trait);
  
      trait_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties[trait]); });
      trait_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties[trait]); });
      
      color.domain([trait_min, trait_max]);
      x.domain([trait_min, trait_max]);


      var g = svg_container.append("g")
                           .attr("class", "key")
                           .attr("transform", "translate(20, 80)");

      var xAxis =         d3.svg.axis()
                            .scale(x)
                            .orient("bottom")
                            .tickSize(13);

 g.selectAll("rect")
  .data(pair(x.ticks(20)))
  .enter().append("rect")
  .attr("height", 8)
  .attr("x", function(d) { return x(d[0]); })
  .attr("width", function(d) { return x(d[1]) - x(d[0]); })
  .style("fill", function(d) { return color(d[0]); });

  g.call(xAxis)
      .append("text")
      .attr("class", "caption")
      .attr("y", -6)
      .text(look_up[trait]);


svg_container.selectAll("path")
       .data(subunits.features)
       .enter().append("path")
       .attr("class", "country")
       .attr("d", path)
       .style("fill", function(d) {
                     var value1 = d.properties[trait];
                     if(value1) {
                      return color(value1);
                    } else {
                      return "#f0f0f0";
                    }

      })



}); // end of forEach
}); // end of d3.json


// // mytrait.select("svg_trait_1")
//        .append("text")
//        .attr("dx", function(d) {return -20; })
//        .text("I am here!!");

// d3.json("final_tj.json", function(error, europe) {
//     var subunits = topojson.feature(europe, europe.objects.subunits);


//     function draw_this(trait) {
//      // Define domain
//      trait_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties[trait]); });
//      trait_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties[trait]); });
//      console.log(trait_min);
//      console.log(trait_max);
//      // domain
//      color.domain([trait_min, trait_max]);
//      x.domain([trait_min, trait_max]);
//      // axis
//      g.call(xAxis)
//       .append("text")
//       .attr("class", "caption")
//       .attr("y", -6)
//       .text(look_up[trait]);

//      svg.selectAll("path")
//        .data(subunits.features)
//        .enter().append("path")
//        .attr("class", "country")
//        .attr("d", path)
//        .style("fill", function(d) {
//                      var value1 = d.properties[trait];
//                      if(value1) {
//                       return color(value1);
//                     } else {
//                       return "#f0f0f0";
//                     }

//       })
//     }

  
//     traits.forEach(function(trait) { console.log(trait); });
//     traits.slice(0,1).forEach(function(trait) { draw_this(trait); });
  

// });