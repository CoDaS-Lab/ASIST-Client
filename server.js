const express = require('express'); 
const app = express();
const path = require('path');
var public = path.join(__dirname, '/public');
app.use('/', express.static(public));
app.get('/', function(req, res) {
    res.sendFile(path.join(public , 'index.html'));
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});
