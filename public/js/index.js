import {actExpSmryBtn, dsplyExpSmry, joinQuiz, changeDisplay} from "/js/expNav.js";
import {PlayerDisplay, GameState} from "/js/gameUtils.js"
import {phaserConfig, mapData, gameSetUpData, socketURL} from "/js/config.js"

var room_id = "temp_room";
var playerId = "temp_id";
var gameTimer = new Timer();
var victimCount;
var quizAttempts = 0;
//var controls;
var victimCount = 24


const socket = io(socketURL, {transports: ['websocket']})

var gamePlayState = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function(){
        Phaser.Scene.call(this, {key: 'GamePlay'});        
        this.playersCurrentLoc = [];
        this.mapConfig = mapData;
        this.mapConfig["scene"] = this
        this.gameConfig = gameSetUpData
        
    },

    preload: function() {
        this.load.spritesheet("chirag", "/assets/dude2.png",
        {frameWidth: 32, frameHeight: 48});
        this.load.spritesheet("dude","/assets/dude.png",
            {frameWidth: 32, frameHeight: 48});
        this.load.image("legend", "/assets/legend.png");
        this.load.image("blankTopLeft", "assets/blankTopLeft.png");
        this.load.image("blankTopRight", "assets/blankTopRight.png");
        this.load.image("blankBottomLeft", "assets/blankBottomLeft.png");
        this.load.image("blankBottomRight", "assets/blankBottomRight.png");
        this.load.image("rubbleTopLeft", "assets/rubbleTopLeft.png");
        this.load.image("rubbleTopRight", "assets/rubbleTopRight.png");
        this.load.image("rubbleBottomLeft", "assets/rubbleBottomLeft.png");
        this.load.image("rubbleBottomRight", "assets/rubbleBottomRight.png");

    },
    create: function() {
        // should be bound by the edge of map
        this.cameras.main.setBounds(0, 0, 775, 625).setName('main');
        this.cameras.main.setZoom(4);

        console.log("GamePlay");
        this.gameState = new GameState(this.mapConfig)
        socket.emit("quiz_attempts", {'quiz_attempts': quizAttempts})
        socket.emit("random_victims", {'random_victims_locations': Array.from(this.gameState.set_victims)})

        //this.roundDisplay = this.add.text(0,0, "Round ".concat(String(this.gameConfig.roundCount)), {color: '0x000000', fontSize: '20px'}); 
        //this.gameState.placeAtIndex(32, this.roundDisplay);
        
        this.playerDude = new PlayerDisplay(this, {"x": this.gameConfig.playerX, "y":this.gameConfig.playerY, "name":"dude"});
        this.playersCurrentLoc.push((this.playerDude.y*this.mapConfig.cols)+ this.playerDude.x);
    
        //this.leaderDude = new PlayerDisplay(this, {"x": this.gameConfig.leaderX, "y":this.gameConfig.leaderY, "name":"chirag"});
        //this.playersCurrentLoc.push((this.leaderDude.y*this.mapConfig.cols)+ this.leaderDude.x);

        this.player_list = [this.playerDude, /*this.leaderDude*/];

        // this._randomMap();

        // this.legend = this.add.sprite(310, 380, "legend").setScrollFactor(0);
        // this.legend.setScale(.10);

        // victimCount = 24;
        // this.victimCountText = this.add.text(381, 385, "Victims: 24", {color: '0x9754e3', fontSize: '4px'}).setScrollFactor(0).setResolution(10);

        this.keys = this.input.keyboard.addKeys('W, S, A, D, R, UP, DOWN, LEFT, RIGHT');
        /*this.leaderGuidance = true;
        this.leaderTimer = this.time.addEvent({
            delay: 500,
            callback: this._leaderAnimation,
            args: [],
            callbackScope: this,
            repeat: this.gameConfig.leaderMovementIndexes.length -1
        });*/

        socket.on('player_move', (message)=>{this.gameState.playerMove(message, playerId)});        

        this.cameras.main.startFollow(this.playerDude.physicsObj);
        this.cameras.main.setLerp(0.2);
    },


    update: function() {
        //if ((this.gameConfig.roundCount>0) /*&& (this.leaderGuidance)*/){
            if (Phaser.Input.Keyboard.JustDown(this.keys.LEFT)){
                let newIdx = (this.player_list[playerId].y*this.mapConfig.cols)+ this.player_list[playerId].x - 1;
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Left");
                    this.player_list[playerId].x -= 1;
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"left", 'rm_id':room_id, 'idx': playerId, "k_time":new Date().toISOString(),
                        "event": "player_move", "dTime": this.gameConfig.dTime
                    })
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)){
                let newIdx = (this.player_list[playerId].y*this.mapConfig.cols)+ (this.player_list[playerId].x + 1);
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Right");
                    this.player_list[playerId].x += 1;
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"right", 'rm_id':room_id, 'idx': playerId, "k_time":new Date().toISOString(),
                        "event": "player_move", "dTime": this.gameConfig.dTime
                    })       
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.UP)){
                let newIdx = ((this.player_list[playerId].y-1)*this.mapConfig.cols)+ this.player_list[playerId].x;
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Up");
                    this.player_list[playerId].y -= 1
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"up", 'rm_id':room_id, 'idx': playerId, "k_time":new Date().toISOString(),
                        "event": "player_move", "dTime": this.gameConfig.dTime
                    })
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.DOWN)){             
                let newIdx = ((this.player_list[playerId].y+1)*this.mapConfig.cols)+ this.player_list[playerId].x;
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Down");
                    this.player_list[playerId].y += 1
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"down", 'rm_id':room_id, 'idx': playerId, "k_time":new Date().toISOString(),
                        "event": "player_move", "dTime": this.gameConfig.dTime
                    })
                }
            }
        //}

        /*else if (this.gameConfig.roundCount==0){
            gameTimer.stop()
            $("#phaser-game").hide();
            $("#game-over").show();
            game.scene.stop("GamePlay");
            socket.emit('end_game', {"key": "go_round", "k_time": new Date().toISOString(), "d_time": this.gameConfig.dTime})
        }*/

        if (Phaser.Input.Keyboard.JustDown(this.keys.R)){
            console.log("victim set size: " + this.gameState.set_victims.size);
            let rescueIndexes = this.gameState.getVictimRescueIndexes(this.player_list[playerId].y, this.player_list[playerId].x);
            socket.emit("rescue_attempt", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
            "key":"r", 'rm_id':room_id, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
            "k_time":new Date().toISOString()})
            for(const victimIndex of rescueIndexes){                
                    if (this.gameState.set_victims.has(victimIndex)){            
                        this.gameState.victimObj[String(victimIndex)].fillColor = "0xf6fa78";
                        this.gameState.set_victims.delete(victimIndex);
                        victimCount--;
                        // this.victimCountText.setText("Victims: " + victimCount);
                        socket.emit("rescue_success", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"rs", 'rm_id':room_id, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
                        "victim":victimIndex, "k_time":new Date().toISOString()})
                        if (/*this.gameState.set_victims.size*/ victimCount === 0){
                            console.log("SUCCESS")
                            this.gameConfig.roundCount = -1
                            gameTimer.stop();
                            $("#phaser-game").hide();
                            $("#game-over").show();
                            game.scene.stop("GamePlay");
                            socket.emit('end_game', {"key": "go_victim", "k_time": new Date().toISOString(), "d_time": this.gameConfig.dTime})
                        }
                    }
            }
        }
    },


    _leaderAnimation: function(){
        /*let currentLeaderloc = this.gameConfig.leaderMovementIndexes.length - (this.leaderTimer.getRepeatCount()+1)
        console.log(currentLeaderloc, this.gameConfig.leaderMovementIndexes[currentLeaderloc]);
        this.player_list[1].move(this.gameConfig.leaderMovementIndexes[currentLeaderloc][0], this.gameConfig.leaderMovementIndexes[currentLeaderloc][1],
            this.player_list[1].name+this.gameConfig.leaderMovementIndexes[currentLeaderloc][2])
        this.playersCurrentLoc[1] = (this.player_list[1].y*this.mapConfig.cols)+ this.player_list[1].x;
        if (this.leaderTimer.getRepeatCount()===0){
            console.log(this.playersCurrentLoc);
        }*/
    },


    _drawGameInfo: function(){
        const playerInGameInfo = new PlayerDisplay(this, {"x": 16, "y":23, "name":"dude"});
        playerInGameInfo.physicsObj.x = 310;
        playerInGameInfo.physicsObj.y = 360;

        const leaderInGameInfo = new PlayerDisplay(this, {"x": 15, "y":23, "name":"chirag"});
        leaderInGameInfo.physicsObj.x = 340;
        leaderInGameInfo.physicsObj.y = 360;

        this.add.text(300,360, "Player", {color: '0x000000', fontSize: '4px'}).setScrollFactor(0);
        this.add.text(330,360, "Leader", {color: '0x000000', fontSize: '4px'}).setScrollFactor(0);
        this.add.text(300,370, "Victim", {color: '0x000000', fontSize: '4px'}).setScrollFactor(0);         
        this.add.rectangle(330,370, this.gameState.cw/2, this.gameState.ch/2, 0x9754e3).setScrollFactor(0);
        this.add.text(340,370, "Door", {color: '0x000000', fontSize: '4px'}).setScrollFactor(0);
        this.add.rectangle(360,370, this.gameState.cw/2, this.gameState.ch/2, 0x9dd1ed, 0.3).setScrollFactor(0);
        this.add.text(300,380, "Saved Victim", {color: '0x000000', fontSize: '4px'}).setScrollFactor(0);
        this.add.rectangle(340,380, this.gameState.cw/2, this.gameState.ch/2, 0xf6fa78).setScrollFactor(0);
    },

    _randomMap: function(){
        //no knowledge condition
        this.topLeft = this.add.sprite(344, 350, "blankTopLeft").setScrollFactor(0);
        this.topLeft.setScale(.04);
        this.topRight = this.add.sprite(367.5, 350, "blankTopRight").setScrollFactor(0);
        this.topRight.setScale(.04);
        this.bottomLeft = this.add.sprite(344, 377, "blankBottomLeft").setScrollFactor(0);
        this.bottomLeft.setScale(.04);
        this.bottomRight = this.add.sprite(367.5, 377, "blankBottomRight").setScrollFactor(0);
        this.bottomRight.setScale(.04);

        this.tl = "No knowledge";
        this.tr = "No knowledge";
        this.bl = "No knowledge";
        this.br = "No knowledge";

        if(Math.random() < .3){ // first randomization
            if (Math.random() < .5){ // post accident*/
                this.topLeft = this.add.sprite(344, 350, "rubbleTopLeft").setScrollFactor(0);
                this.topLeft.setScale(.04);
                this.topRight = this.add.sprite(367.5, 350, "rubbleTopRight").setScrollFactor(0);
                this.topRight.setScale(.04);
                this.bottomLeft = this.add.sprite(344, 377, "rubbleBottomLeft").setScrollFactor(0);
                this.bottomLeft.setScale(.04);
                this.bottomRight = this.add.sprite(367.5, 377, "rubbleBottomRight").setScrollFactor(0);
                this.bottomRight.setScale(.04);
                this.tl = "Knowledge";
                this.tr = "Knowledge";
                this.bl = "Knowledge";
                this.br = "Knowledge";
            }
        }else{ // second randomization
            if(Math.random() < .5){ 
                this.topLeft = this.add.sprite(344, 350, "rubbleTopLeft").setScrollFactor(0);
                this.topLeft.setScale(.04);
                this.tl = "Knowledge";
                
            }
            if(Math.random() < .5){
                this.topRight = this.add.sprite(367.5, 350, "rubbleTopRight").setScrollFactor(0);
                this.topRight.setScale(.04);
                this.tr = "Knowledge";
            }
            if(Math.random() < .5){
                this.bottomLeft = this.add.sprite(344, 377, "rubbleBottomLeft").setScrollFactor(0);
                this.bottomLeft.setScale(.04);
                this.bl = "Knowledge";
            }
            if(Math.random() < .5){
                this.bottomRight = this.add.sprite(367.5, 377, "rubbleBottomRight").setScrollFactor(0);
                this.bottomRight.setScale(.04);
                this.br = "Knowledge";
            }
        }
        socket.emit("random_map", {'top_left': this.tl, 'top_right': this.tr, 'bottom_left': this.bl, 'bottom_right': this.br})
        
    },
});

//var controls;
//const game = new Phaser.Game(phaserConfig); //Instantiate the game
var game = new Phaser.Game(phaserConfig); //Instantiate the game
game.scene.add("Gameplay", gamePlayState);


var gameInfoState = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function(){
        Phaser.Scene.call(this, {key: 'GameInfo'});
    },

    preload: function() {

        this.load.image("legend", "/assets/legend.png");
        this.load.image("blankTopLeft", "assets/blankTopLeft.png");
        this.load.image("blankTopRight", "assets/blankTopRight.png");
        this.load.image("blankBottomLeft", "assets/blankBottomLeft.png");
        this.load.image("blankBottomRight", "assets/blankBottomRight.png");
        this.load.image("rubbleTopLeft", "assets/rubbleTopLeft.png");
        this.load.image("rubbleTopRight", "assets/rubbleTopRight.png");
        this.load.image("rubbleBottomLeft", "assets/rubbleBottomLeft.png");
        this.load.image("rubbleBottomRight", "assets/rubbleBottomRight.png");

    },
    create: function() {

        this._randomMap();
        this.legend = this.add.sprite(130, 500, "legend")
        this.legend.setScale(0.5)
        this.victimCountText = this.add.text(40, 410, "Victims: 24", {color: '0x9754e3', fontSize: '15px'}).setResolution(10);
    },


    update: function() {
        this.victimCountText.setText("Victims: " + victimCount);
    },

    _randomMap: function(){
        //no knowledge condition
        this.topLeft = this.add.sprite(123.5, 100, "blankTopLeft")
        this.topRight = this.add.sprite(300, 100, "blankTopRight")
        this.bottomRight = this.add.sprite(300, 303, "blankBottomRight")
        this.bottomLeft = this.add.sprite(123.5, 303, "blankBottomLeft")

        this.topLeft.setScale(0.3)
        this.topRight.setScale(0.3)
        this.bottomRight.setScale(0.3)
        this.bottomLeft.setScale(0.3)

        this.tl = "No knowledge";
        this.tr = "No knowledge";
        this.bl = "No knowledge";
        this.br = "No knowledge";

        if(Math.random() < .3){ // first randomization
            if (Math.random() < .5){ // post accident*/
                this.topLeft = this.add.sprite(123.5, 100, "rubbleTopLeft")
                this.topRight = this.add.sprite(300, 100, "rubbleTopRight")
                this.bottomRight = this.add.sprite(300, 303, "rubbleBottomRight")
                this.bottomLeft = this.add.sprite(123.5, 303, "rubbleBottomLeft")
                this.tl = "Knowledge";
                this.tr = "Knowledge";
                this.bl = "Knowledge";
                this.br = "Knowledge";
            }
        }else{ // second randomization
            if(Math.random() < .5){ 
                this.topLeft = this.add.sprite(123.5, 100, "rubbleTopLeft")
                this.tl = "Knowledge";
            }
            if(Math.random() < .5){
                this.topRight = this.add.sprite(300, 100, "rubbleTopRight")
                this.tr = "Knowledge";
            }
            if(Math.random() < .5){
                this.bottomLeft = this.add.sprite(123.5, 303, "rubbleBottomLeft")
                this.bl = "Knowledge";
            }
            if(Math.random() < .5){
                this.bottomRight = this.add.sprite(300, 303, "rubbleBottomRight")
                this.br = "Knowledge";
            }
        }
        this.topLeft.setScale(0.3)
        this.topRight.setScale(0.3)
        this.bottomRight.setScale(0.3)
        this.bottomLeft.setScale(0.3)
        socket.emit("random_map", {'top_left': this.tl, 'top_right': this.tr, 'bottom_left': this.bl, 'bottom_right': this.br});
    },
});

var gameInformation = new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor:0xffffff,
    scale: {
        _mode: Phaser.Scale.FIT,
        parent: 'phaser-game-info',
        width: 400,
        height: 600,
    },
    dom: {
        createContainer: true
    },
});

gameInformation.scene.add("GameInfo", gameInfoState);

socket.on('connect',()=>{
    socket.on('welcome',(message)=>{
        socket.emit("game_info", {"event": "start_t&c", "time": new Date().toISOString()});
        console.log(message["data"])
    });
})

var dsplyGame = function(){
    $("#mainInfo").hide();
    console.log("join room clicked")
    socket.emit('start_wait', {"key": "sw", "k_time": new Date().toISOString(), "d_time": gameSetUpData.dTime})
    $("#quiz-success").hide();
    $("#join-room").hide();
    $('#wait-room').show();
}

$(document).ready(function() {
    $("#agree").change(actExpSmryBtn);
    $("#cte").on("click", dsplyExpSmry);
    $('#join-room').click(dsplyGame);
});

$("#join-quiz").on("click", function(){
    quizAttempts++;
    joinQuiz(socket);
});

$("#revise-intructions").on("click", function(){
    changeDisplay(socket, "game_info", "#quiz-fail", "#mainInfo", {"event":"revise_instructions"})
});

$("#continue-instructions").on("click", function(){
    changeDisplay(socket, "game_info", "#mainInfo", "#mainInfo2", {"event":"continue-instructions"})
});

/*gameTimer.addEventListener('targetAchieved', function(){
    $('#phaser-game').hide();
    $("#game-over").show();
    game.scene.stop("GamePlay");
    socket.emit('end_game', {"key": "go_time", "k_time": new Date().toISOString()})
});*/

socket.on('wait_data', (message)=>{
    gameSetUpData.dTime = new Date().toISOString();
    room_id = message["rm_id"]
    playerId = message["idx"]
});


socket.on('start_game', (message)=>{
    $("#wait-room").hide();
    // $("#phaser-game").css("display", "flex");
    $("#grid-organise").show();
    $("#game-time").show();
    console.log(message, "Start Game")
    socket.emit('start_game', {"key": "sg", "k_time": new Date().toISOString(), "d_time": gameSetUpData.dTime})
    game.scene.start("GamePlay");
    gameInformation.scene.start("GameInfo");
    gameTimer.start()
});


gameTimer.addEventListener('secondsUpdated', function() {
    $('#timerTime').text(" "+ gameTimer.getTimeValues().toString());
});
/*gameTimer.addEventListener('started', function () {
    $('#timerTime').text(" 00:"+String(gameSetUpData.gameTime)+":00");
});*/
