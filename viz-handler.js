var monthNames = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
// http://stackoverflow.com/questions/1810984/number-of-days-in-any-month
function getDaysInMonth(m, y) {
  return /8|3|5|10/.test(--m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
}

var svg0 = d3.select("#gary_chart").append("svg:svg")
      .attr({"width":1400,"height":600});
var svg1 = d3.select("#runkeeper_chart").append("svg:svg")
      .attr({"width":1400,"height":600});
var svg2 = d3.select("#foursquare_chart").append("svg:svg")
      .attr({"width":1400,"height":600});


function chart() {
  var topText, bottomText, accessor;
  function my(selection) {
    selection.each(function(d,i) {
      this.append("text").text(topText).attr("y", 120).attr("x", 0);
      this.append("text").text(bottomText).attr("y", 240).attr("x", 0);
      this.append("text").text("(minutes)").attr("y", 260).attr("x", 0);
      var bigcaption = this.append("text").attr("class", "bigcaption").attr("x", 250).attr("y",330);


      var base = 400;
      var timeScale = d3.time.scale().range([100,970]);
      var medMinutesScale = d3.scale.linear().range([0,60]);
      var axis = d3.svg.axis().scale(timeScale).orient("bottom").ticks(d3.time.month, 3).tickFormat(
        function(d) {
          if(d.getMonth() == 0) {
            return d3.time.format("%y")(d)
          } else {
            return d3.time.format("%b")(d)
          } 
        }
      );
      var mainChartWAxis = this.append("g").attr("transform","translate(0,180)")
      mainChartWAxis.append("g")
        .attr("transform", "translate(0,10)")
        .attr("class", "time axis")
      mainChartWAxis.append("g")
        .attr("transform", "translate(30,-500)")
        .attr("class", "zeros axis")

      var months = this.append("g");

      var foo = d3.nest().key(function(d) { return d3.time.month(new Date(d.time)) })
        .key(function(d) { return d3.time.day(new Date(d.time)) })
        .rollup(function(arr) {
          return d3.sum(arr, function(e) { return e[accessor] })
        })
        .entries(d)

      // find the average metric per month 
      for (var month_elem in foo) {
        var days_meditated = parseFloat(foo[month_elem].values.length);
        foo[month_elem].avg = d3.sum(foo[month_elem].values, function(d) { return d.values }) / days_meditated;
      }

      
      // annotate this with the number of missing days
      for (var month_elem in foo) {
        var m_val = (new Date(foo[month_elem].key)).getMonth() + 1;
        var y_val = (new Date(foo[month_elem].key)).getFullYear();
        var temp = [];
        
        var num_missing_days = getDaysInMonth(m_val, y_val) - foo[month_elem].values.length
        for(var i = 0; i < num_missing_days; i++) { temp.push({}) }
        foo[month_elem].missing_days = temp;
      }
      
      // find the extent of the dates.
      var extent = d3.extent(foo, function(d) { return new Date(d.key) });
      timeScale.domain(extent);

      // find the extent of the averages.
      var scalarExtent = d3.extent(foo, function(d) { return d.avg });
      medMinutesScale.domain([0,scalarExtent[1]]);

      this.selectAll(".time.axis").call(axis);
      var month_g = months.selectAll(".month").data(foo).enter().append("g").attr("class", "month")
        .attr("transform", function(d) { return "translate(" + (timeScale(new Date(d.key))) + ",0)"; })
      month_g.selectAll(".zeroes").data(function(d) { return d.missing_days }).enter().append("circle").attr("r",3)
        .attr("cy", function(d,i) { return 180 - i * 7} ).style("fill", "#BE1336").style("stroke", "#741E2C");
      month_g.append("rect").attr("class","bar").attr("width",8)
        .attr("height", function(d) { return medMinutesScale(d.avg) })
        .attr("x", -4)
        .attr("y", function(d) { return 280 - medMinutesScale(d.avg) })
        .style("fill", "#403075");
      month_g.append("rect").attr("y",20).attr("height", 280).style("fill", "steelblue").attr("width", 18).attr("x", -9).style("opacity",0).attr("rx",6).attr("ry",6)
      .on("mouseover", function(d) { 
        var session_minutes = d3.round(d.avg,2);
        var days_skipped = d.missing_days.length;
        var dat  = new Date(d.key);
        var the_x = timeScale(dat);
        d3.select(this).transition().duration(0).style("opacity",0.2) 
        var mon = monthNames[dat.getMonth()];
        var yea =  dat.getFullYear();
        bigcaption.text(days_skipped + " days skipped, " + session_minutes + " minutes/day in " + mon  + " " + yea)
       })
      .on("mouseout", function() { d3.select(this).transition().duration(300).style("opacity",0) });
    })
  }
  my.topText = function(value) { topText = value; return this; }
  my.bottomText = function(value) { bottomText = value; return this; }
  my.accessor = function(value) { accessor = value; return this; }
  return my;
}
