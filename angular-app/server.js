// server.js

const express = require('express');
var cfenv = require("cfenv");

// Run the app by serving the static files
// in the dist directory
const app = express();
var appEnv = cfenv.getAppEnv();


app.use(express.static(__dirname + '/dist'));

// setting the route

const path = require('path');

app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});


// start the server on the given port and binding host, and print
// url to server when it starts

app.listen(appEnv.port, appEnv.bind, function() {
    console.log("server starting on " + appEnv.url)
});