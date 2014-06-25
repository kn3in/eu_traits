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
                   .translate([w / 2, h / 2]);

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
    
    height_obs_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties.mean_height_obs); });
    height_obs_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties.mean_height_obs); });
    bmi_obs_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties.mean_bmi_obs); });
    bmi_obs_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties.mean_bmi_obs); });
    height_est_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties.mean_height_est); });
    height_est_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties.mean_height_est); });
    bmi_est_min = d3.min(subunits.features, function(d) { return parseFloat(d.properties.mean_bmi_est); });
    bmi_est_max = d3.max(subunits.features, function(d) { return parseFloat(d.properties.mean_bmi_est); });


    color.domain([height_est_min, height_est_max]);
    x.domain([height_est_min, height_est_max]);

    svg.selectAll("path")
       .data(subunits.features)
       .enter().append("path")
       .attr("class", "country")
       .attr("d", path)
       .style("fill", function(d) {
                     var value1 = d.properties.mean_height_est;
                     if(value1) {
                      return color(value1);
                    } else {
                      return "#f0f0f0";
                    }

      })
      
      g.call(xAxis)
     .append("text")
     .attr("class", "caption")
     .attr("y", -6)
     .text(look_up["mean_height_est"]);
});

// -----------------------------------------------------------------------------------------------------------------

d3.select("select").on("change", function() {
      var trait = this.value;

      // Update domains
      // When one would like to compare observed vs estimated
      // on the same color scale, keep domain from
      // observed data cause estimated domain will be smaller
      // however it will make it more difficult to see
      // for height that observed and estimated patterns follow each other
      // if(trait.valueOf() == "mean_height_est" || trait.valueOf() == "mean_height_obs") {
      //   color.domain([height_max, height_min]);
      //   x.domain([height_max, height_min]);
      // } else {
      //   color.domain([bmi_max, bmi_min]);
      //   x.domain([bmi_max, bmi_min]);
      // }
      
      // Update domain
      switch(trait.valueOf()) {
        case "mean_height_est" :
          color.domain([height_est_min, height_est_max]);
          x.domain([height_est_min, height_est_max]);
          break;
        case "mean_height_obs" :
          color.domain([height_obs_min, height_obs_max]);
          x.domain([height_obs_min, height_obs_max]);
          break;
        case "mean_bmi_est" :
          color.domain([bmi_est_min, bmi_est_max]);
          x.domain([bmi_est_min, bmi_est_max]);
          break;
        case "mean_bmi_obs" :
          color.domain([bmi_obs_min, bmi_obs_max]);
          x.domain([bmi_obs_min, bmi_obs_max]);
          break;
      }

      // update axis 
      g.call(xAxis)
       .selectAll("text.caption")
       .text(look_up[trait]);
      
      // update chrolopleth
      svg.selectAll("path.country")
         .style("fill",  function(d) {
                          var value = d.properties[trait];
                          if (value) {
                                  return color(value);
                          } else {
                                  return "#f0f0f0";
                          }
      })
});
