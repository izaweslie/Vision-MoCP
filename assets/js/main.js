//Vision Api Logic
var api_key = 'AIzaSyBY93fja8yxM9not6Nrd2v6NsRgNpJ4ZvM';

var API_URL = 'https://api.shutterstock.com/v2';
var clientId = "cc7ea-f2b80-dd2ff-22097-cbcae-44883";//$('input[name=client_id]').val();
var clientSecret = "dd14b-4447f-39c62-1052f-cb9cb-24460";//$('input[name=client_secret]').val();
var authorization = 'Basic ' + window.btoa(clientId + ':' + clientSecret);
var shutterImageURL = '';
var imageID = '';
var temporaryObj = '';
var hashtagArr = [];

//Handles the User image upload.
function uploadFiles(event) {
  console.log('uploaded file')
  event.stopPropagation(); // Stop stuff happening
  event.preventDefault(); // Totally stop stuff happening

  //Grab the file and asynchronously convert to base64.
  var file = $('#fileInput')[0].files[0];
  var reader = new FileReader()
  reader.onloadend = processFile
  reader.readAsDataURL(file);
  console.log(reader);
}

//Encodes the new base 64img
function processFile(event) {
  var encodedFile = event.target.result;
  //
  sendFiletoCloudVision(encodedFile);
}

//Gets all the information from the returned json object
function displayJSON(object){
  var labelArr = object.responses[0].labelAnnotations;
  console.log(labelArr)
  // var string = "";
  // for (var i=0; i < labelArr.length; i++){
  //   console.log(labelArr[i].description + " | " + parseInt(labelArr[i].score*100) + "% match");
  //   $('#results').append('<p>'+labelArr[i].description + " | " + parseInt(labelArr[i].score*100) + "% match" + '</p>');
  //   string += labelArr[i].description + ", "
  // }

  var apiString = "";
  for (var i=0; i < 5; i++) {
    console.log(labelArr[i].description + " | " + parseInt(labelArr[i].score*100) + "% match");
    $('#resultsText').append('<p>'+labelArr[i].description + '<br>' + parseInt(labelArr[i].score*100) + "% match" + '</p>');
    apiString += labelArr[i].description + "+"
  }
  //$('#results').append('<p>'+apiString+'</p>')
  // apiString = labelArr[0].description //+'+'+labelArr[1].description+'+'+labelArr[2].description;
  // apiString = apiString.replace(" ", "+");
  console.log("here is" + apiString)
  search({query:labelArr[0].description+"+"+labelArr[1].description+"+"+labelArr[2].description+"+"+labelArr[3].description+"+"+labelArr[4].description});
}

//Sends the file to CloudVision
function sendFiletoCloudVision(file){
  var type = 'LABEL_DETECTION';
  //This will currently only allow jpeg images
  var fileType = file.split(',');
  fileType = fileType[0] + ",";
  console.log(fileType)
  var content = file.replace(fileType, "");
  showImage(content)
    // Strip out the file prefix when you convert to json.
    var json = {
       "requests": [
         { 
           "image": {
             "content": content 
           },
          "features": [
             {
               "type": type,
               "maxResults": 10
             }
          ]
        }
      ]
    }
    //console.log(JSON.stringify(json));
    json = JSON.stringify(json)

  //Vision AJAX Request
  $.ajax({
      type: 'POST',
      url: "https://vision.googleapis.com/v1/images:annotate?key=" + api_key,
      dataType: 'json',
      data: json,
      //Include headers, otherwise you get an odd 400 error.
      headers: {
        "Content-Type": "application/json",
      },
   
      success: function(data, textStatus, jqXHR) {
        displayJSON(data);
        //console.log(data);
        //console.log(textStatus)
        //console.log(jqXHR)
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
  });
}
function search(opts) {
        //console.log("look here" + opts);
        var url = API_URL + '/images/search';
        //console.log(url);
        $.ajax({
          url: url,
          data: opts,
          headers: {
            Authorization: authorization
          }
        })
        .done(function(data) {

          shutterImageURL = data.data[0].assets.preview.url;
          imageID = data.data[0].id;
          //console.log(shutterImageURL)
          //console.log('id = '+imageID)
          var shutterImage = $('<img style="width:100%" src="' + shutterImageURL + '"/>');
          $('.received').append(shutterImage);

        })
        .fail(function(xhr, status, err) {
          alert('Failed to retrieve ' + mediaType + ' search results:\n' + JSON.stringify(xhr.responseJSON, null, 2));
        });
        return;
      }

function showImage(base64){
  var image = $('<img style="height:100vh" src="data:image/jpeg;base64, '+ base64 +'" />');
  $('.uploaded').append(image);
}

function sendFirebase(id){

}

//
$('#uploadImage').on('click', function(event){
  console.log($('#fileInput')[0].files[0])
  if($('#fileInput')[0].files[0] !== undefined){
    uploadFiles(event);
    uploadNow();
  }else{
    alert('please try adding a different file.');
    event.stopPropagation(); // Stop stuff happening
    event.preventDefault(); // Totally stop stuff happening
  }
  
})
//Firebase stuff (hopefully works)

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDDZfcjCdkOOFwVReb0yK0VQL25h7S5yLY",
    authDomain: "octothorpe-mocp.firebaseapp.com",
    databaseURL: "https://octothorpe-mocp.firebaseio.com",
    projectId: "octothorpe-mocp",
    storageBucket: "octothorpe-mocp.appspot.com",
    messagingSenderId: "1057063941890"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

$('#submit').on('click', function(){ 

  // Retrieve user inputs from form
  var hashtagName = $('#hashtag').val().trim();
  var imageURL = shutterImageURL;
  var imagesRef = database.ref('images');
  $('#firebaseShit').empty();

  console.log(Object.keys(temporaryObj).indexOf(imageID));
  if(Object.keys(temporaryObj).indexOf(imageID) == -1){
    console.log('nothing here')
    hashtagArr.push(hashtagName)
    console.log(hashtagArr)
    
  }else{
    console.log('something here')
    var hashdex = Object.keys(temporaryObj).indexOf(imageID);
    //console.log(temporaryObj[imageID].hashtag);
    hashtagArr = temporaryObj[imageID].hashtag;
    hashtagArr.push(hashtagName)
    console.log(hashtagArr)
  }
  imagesRef.child(imageID).set({
    url: imageURL,
    hashtag: hashtagArr
  });
  for(var i=0; i < hashtagArr.length; i++){
    var newParagraph = $('<p>');
    newParagraph.text(hashtagArr[i]);
    $('#firebaseShit').append(newParagraph);
  }
});
database.ref().on('child_added', function(snapshot){
  temporaryObj = snapshot.val();
})


$("#restart").on("click", function(){
  $("#results").html("");
})








