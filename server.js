const express = require('express');
const path = require('path');
const app = express();
const public = path.join(__dirname, '/public');
app.use('/', express.static(public));

const game_config = require('./config/game-map_v0.1.json');
console.log("MapCols:", game_config.cols + ' | MapRows:' + game_config.rows)

const survey_config = require('./config/survey_v0.1.json');

const navigation_config = require('./config/navigation-map_v0.1.json');

app.get('/', function(req, res) {
    res.sendFile(path.join(public , 'index.html'));
});

app.get('/socket_url', function(req, res){
    console.log('socket-url route called');
    res.json({ "socketURL": process.env.LOCAL_SOCKET_URL });
});

app.get('/game_config', function(req, res){
    console.log('game_config route called');
    res.json(game_config);
});

app.get('/survey_config', function(req, res){
    console.log('survey_config route called');
    res.json(survey_config);
});

app.get('/navigation_config', function(req, res){
    console.log('navigation_config route called');
    res.json(navigation_config);
});

console.log("Server Address: "+ process.env.IP+ "/"+process.env.PORT)
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started" )
});