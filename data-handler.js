function loadDataIntoViz(json_data){
  var svg0 = d3.select("#gary_chart").append("svg:svg")
      .attr({"id":"d3-svg","width":1400,"height":600});
  $("#d3-svg").empty();

  var myChart = chart().topText("Skipped days")
    .bottomText("Session")
    .accessor("minutes");

  d3.select(svg0).datum(json_data).call(myChart);
};

function handleFileSelect(evt) {
  var filename = evt.target.files[0];
    
  var reader = new FileReader();
  reader.onload = (function(theFile) {
      return function(e) {
          var text_data = e.target.result;
          var json_data = d3.csv.parse(text_data);
          // var json_data = JSON.parse(text_data);
          console.log(json_data);
          loadDataIntoViz(json_data);
      };
  })(filename);

  reader.readAsText(filename);
};

$(document).ready(function(){
  $('#files').bind("change", handleFileSelect);

  d3.json('data/garys_meditation_data.json', function(json_data) {
    loadDataIntoViz(json_data);
  });
});
