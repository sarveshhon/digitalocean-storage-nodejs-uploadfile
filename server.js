// Load dependencies
require('dotenv').config();
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');

const app = express();

const endpoint = "";
const space = "";
const folder = "/"+"";
const resPath = "https://"+space+"."+endpoint+folder+"/";

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // hardcoding credentials is a bad practice
    accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY, // please use env vars instead
}
// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: space+folder,
    acl: 'public-read',
    key: function (request, file, cb) {
      console.log(resPath+file.originalname);
      cb(null, file.originalname);
    }
  })
}).array('upload', 1);

// Views in public directory
app.use(express.static('public'));

// Main, error and success views
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function (request, response) {
  response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function (request, response) {
  response.sendFile(__dirname + '/public/error.html');
});

app.post('/upload', function (request, response, next) {
  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.redirect("/error");
    }
    console.log('File uploaded successfully.');
    response.redirect("/success");
  });
});

app.listen(3001, function () {
  console.log('Server listening on port 3001.');
});