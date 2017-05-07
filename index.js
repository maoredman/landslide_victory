var express = require('express');
var app = express();
var util = require('util');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var request = require('request-promise');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.render('index.html');
  // send GET request to db and put data into map
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm(),
      files = [],
      fields = [];

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // every time a file has been uploaded successfully,
  // rename it to its orignal name
  form.on('field', function(field, value) {
    fields.push([field, value]);
  })

  form.on('file', function(field, file) {
    // var fileName = (file.name) ? file.name : '';
    //console.log(file);
    if (file.name) {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
      files.push([field, file]);
    }
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client

  isPerson = false;
  form.on('end', function() {
    var fieldList = fields;
    var file_link = '';
    if (files.length !== 0) {
      file_link = files[0][1].name;
    }

    // console.log("FIELDLIST IS: " + fieldList);

    console.log("FIELDLIST: "+ fieldList);
    console.log("fieldList[0][1]: "+ fieldList[0][1]);
    console.log("fieldList[1][1]: "+ fieldList[1][1]);
    console.log("fieldList[2][1]: "+ fieldList[2][1]);
    console.log("fieldList[3][1]: "+ fieldList[3][1]);
    console.log("fieldList[4][1]: "+ fieldList[4][1]);
    console.log("PHOTOS_LINK: " + file_link);
    console.log("captcha response: " + fieldList[5][1]);


    // ME: POST data to db
    var options = {
    method: 'post',
    body: {
      latitude: fieldList[0][1],
      longitude: fieldList[1][1],
      country: fieldList[2][1],
      date: fieldList[3][1],
      injuries: fieldList[4][1],
      photos_link: file_link,
      response: fieldList[5][1],
    },
    json: true,
    url: 'https://nasa.rails.nctu.me/catalogs/create',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  console.log("about to POST");
  request(options, function (err, res, body) {
    if (err) {
      console.error('error posting json: ', err)
      throw err
    }
    var headers = res.headers;
    var statusCode = res.statusCode;
    console.log('headers: ', headers);
    console.log('statusCode: ', statusCode);
    console.log('body: ', body);
    isPerson = body.success;
  }).then(function(){
    // ME: redirect
    if (isPerson) {
      // TODO
      res.redirect("http://example.com");
    } else {
      res.send('<script>alert("Upload failed, are you a robot?"); window.location.href="/";</script>');
    }
  });
  console.log("finished POST");
  });
  
  console.log("finished end");

  // parse the incoming request containing the form data
  form.parse(req, () => {
    console.log("finished parse");
  });

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
