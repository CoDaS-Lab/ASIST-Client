
const port = 880; //Specify a port for our web server
const express = require('express'); //load express with the use of requireJs
var path = require('path');
const app = express(); //Create an instance of the express library
var public = path.join(__dirname, 'public');
app.get('/', function(req, res) {
    res.sendFile(path.join(public , 'index.html'));
});

app.use('/', express.static(public));
app.listen(port, function() { //Listener for specified port
    console.log("Server running at: http://localhost:" + port)
});