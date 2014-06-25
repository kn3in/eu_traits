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
var w = 1000;
var h = 1000;

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
                   .scale(600)
                   // .translate([w / 2, h / 2]);

// Define default path generator
var path = d3.geo.path()
                 .projection(projection);

// Create SVG element
var svg = d3.select("body")
      .append("svg")
      .attr("width", w)
      .attr("height", h);


var g = svg.append("g")
           .attr("class", "key")
           .attr("transform", "translate(140,100)");

// globals so we can change domain w/o rescanning array 
var height_obs_max;
var height_obs_min;
var bmi_obs_max;
var bmi_obs_min;
var height_est_max;
var height_est_min;
var bmi_est_max;
var bmi_est_min;



// define xAxis
var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickSize(13);

// draw scale bar
 g.selectAll("rect")
  .data(pair(x.ticks(20)))
  .enter().append("rect")
  .attr("height", 8)
  .attr("x", function(d) { return x(d[0]); })
  .attr("width", function(d) { return x(d[1]) - x(d[0]); })
  .style("fill", function(d) { return color(d[0]); });

// -----------------------------------------------------------------------------------------------------------------

d3.json("final_tj.json", function(error, europe) {
    var subunits = topojson.feature(europe, europe.objects.subunits);
    var traits = ["mean_height_est", "mean_height_obs", "mean_bmi_est", "mean_bmi_obs"]

    function draw_this(trait) {
     // Define domain
     trait_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties.trait); });
     trait_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties.trait); });
     // domain
     color.domain([trait_min, trait_max]);
     x.domain([trait_min, trait_max]);
     // axis
     g.call(xAxis)
      .append("text")
      .attr("class", "caption")
      .attr("y", -6)
      .text(look_up[trait]);

     svg.selectAll("path")
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
    }

    traits.each(trait draw_this(trait));

});