const express = require('express');
const path = require('path');
const app = express();
var public = path.join(__dirname, '/public');
app.use('/', express.static(public));
app.get('/', function(req, res) {
    res.sendFile(path.join(public , 'index.html'));
});

app.get('/data', function(req, res){
    console.log('data route called');
    res.json({ "socketURL": process.env.LOCAL_SOCKET_URL });
});

console.log("Server Address: "+ process.env.IP+ "/"+process.env.PORT)
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started" )
});