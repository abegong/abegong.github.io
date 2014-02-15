function genAlertBox(cleaned_json_data, bad_rows){
  var alert_box = $("#alert-prototype").clone().hide();
  if( cleaned_json_data.length > 0 ){
    if( bad_rows.length > 0 ){
//      var message = "[Sad trombone]";
      var message = "Your file successfully loaded "+cleaned_json_data.length+" rows, but also had "+bad_rows.length+" bad rows.";
      alert_box.addClass("warning")
    } else {
      alert_box.addClass("success")
      var message = "Your file successfully loaded, with "+cleaned_json_data.length+" rows.";
    }
  } else {
    var message = "Your file did not load.  Please check the formatting requirements and try again.";
//    var message = "[Sad trombone]";
    alert_box.addClass("warning")
  }

  alert_box
    .html(message)
    .slideDown()
    .append('<a href="#" class="close">&times;</a>');
  $('a', alert_box).click(function(){
    $(this).parent().slideUp(
      400,
      function(){$(this).remove()}
    );
  })
  $("body").prepend(alert_box);

};

function loadDataIntoViz(json_data, filename, gen_alert_box){
  var cleaned_json_data = [];
  var bad_rows = [];
  for( j in json_data ){
    var new_date = new Date(json_data[j]["time"]);
    if( !isNaN(new_date) ){
      cleaned_json_data.push(json_data[j]);
    } else {
      bad_rows.push( {"row":j, "contents":json_data[j]} );
    }
  }

  if( gen_alert_box ){
    genAlertBox(cleaned_json_data, bad_rows);
  }

  //Clear the visualization if it's not already empty
  $("#d3-svg").empty();

  var myChart = chart().topText("Skipped days")
    .bottomText("Session")
    .accessor("minutes");

  var svg0 = d3.select("#d3-svg");
  d3.select(svg0).datum(cleaned_json_data).call(myChart);
};

// Take only the first n columns of a CSV file and discard everything else.
// Assumes that the colums to be retained are numeric or date - not arbitrary strings.
// Adds a header if needed.
// Transformes a newline separated string into another newline separated string.
function processEquanimityCSV(text) {
  var inputArray = text.split('\n');
  
  // truncate at the required number of columns
  var filteredArray = inputArray.map(function (row) {
    return row.split(',', 2).join(',');
  });
  
  // drop lines that do not contain the required number of columns
  var filteredArray = filteredArray.filter(function (row) {
    return (row.split(',').length === 2); 
  });
  
  // drop lines that do not start with a number
  var filteredArray = filteredArray.filter(function (row) {
    return "0123456789".indexOf(row.charAt(0)) >= 0;
  });
  
  // add a header if necessary
  if (filteredArray[0].indexOf("time") === -1) {
     filteredArray.unshift("time,minutes");
  }
  
  output = filteredArray.join('\n');
  return output;
}

function handleFileSelect(evt) {
  var filename = evt.target.files[0];
    
  var reader = new FileReader();
  reader.onload = (function(theFile) {
      return function(e) {
          var text_data = e.target.result;
          var trimmed_data = processEquanimityCSV(text_data);
          var json_data = d3.csv.parse(trimmed_data);
          // var json_data = JSON.parse(text_data);
          loadDataIntoViz(json_data, filename, true);
      };
  })(filename);

  reader.readAsText(filename);
};

$(document).ready(function(){
  $(document).foundation();

  $('#files').bind("change", handleFileSelect);

  d3.select("#gary_chart").append("svg:svg")
    .attr({"id":"d3-svg","width":1400,"height":600});

  d3.json('data/garys_meditation_data.json', function(json_data) {
    loadDataIntoViz(json_data, "garys_meditation_data.json", false);
  });
});
