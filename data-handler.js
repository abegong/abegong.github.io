function handleFileSelect(evt) {
  var file = evt.target.files[0];
  console.log(file);
    
  var reader = new FileReader();

    // Closure to capture the file information.
  reader.onload = (function(theFile) {
      return function(e) {
          console.log(e);
          var text_data = e.target.result;
          console.log(text_data);
          var json_data = d3.csv.parse(text_data);
//                var json_data = JSON.parse(text_data);
          console.log(json_data);
          var myChart = chart().topText("Skipped days")
              .bottomText("Session")
              .accessor("minutes");
          d3.select(svg0).datum(json_data).call(myChart);
      };
  })(file);

    // Read in the image file as a data URL.
    reader.readAsText(file);

//        d3.json('garys_meditation_data.json', function(data) {
//            var myChart = chart().topText("Skipped days")
//                        .bottomText("Session")
//                        .accessor("minutes");
//            d3.select(svg0).datum(data).call(myChart);
//        });
};

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

//document.getElementById('files').addEventListener('change', handleFileSelect, false);
$('#files').bind("change", handleFileSelect);
  
//    $('#drop_zone')
//        .bind('dragover', handleDragOver)
//        .bind('drop', handleFileSelect);
