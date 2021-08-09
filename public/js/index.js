import {actExpSmryBtn, dsplyExpSmry} from "/js/expNav.js";
import {PlayerDisplay, GameState} from "/js/gameUtils.js"
import {phaserConfig, mapData, gameSetUpData, socketURL} from "/js/config.js"

var room_id = "temp_room";
var playerId = "temp_id";
var gameTimer = new Timer();
//var controls;
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

        this.roundDisplay = this.add.text(0,0, "Round ".concat(String(this.gameConfig.roundCount)), {color: '0x000000', 
                            fontSize: '20px'}); 
        this.gameState.placeAtIndex(32, this.roundDisplay);
        
        this.playerDude = new PlayerDisplay(this, {"x": this.gameConfig.playerX, "y":this.gameConfig.playerY, "name":"dude"});
        this.playersCurrentLoc.push((this.playerDude.y*this.mapConfig.cols)+ this.playerDude.x);
    
        //this.leaderDude = new PlayerDisplay(this, {"x": this.gameConfig.leaderX, "y":this.gameConfig.leaderY, "name":"chirag"});
        //this.playersCurrentLoc.push((this.leaderDude.y*this.mapConfig.cols)+ this.leaderDude.x);

        this.player_list = [this.playerDude, /*this.leaderDude*/];

        this._randomMap();

        this.legend = this.add.sprite(310, 380, "legend").setScrollFactor(0);
        this.legend.setScale(.10);

        /*this.keys = this.input.keyboard.addKeys('W, S, A, D, R, UP, DOWN, LEFT, RIGHT');
        this.leaderGuidance = true;
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
        if ((this.gameConfig.roundCount>0) && (this.leaderGuidance)){
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
        }

        else if (this.gameConfig.roundCount==0){
            gameTimer.stop()
            $("#phaser-game").hide();
            $("#game-over").show();
            game.scene.stop("GamePlay");
            socket.emit('end_game', {"key": "go_round", "k_time": new Date().toISOString(), "d_time": this.gameConfig.dTime})
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.R)){
            let rescueIndexes = this.gameState.getVictimRescueIndexes(this.player_list[playerId].y, this.player_list[playerId].x);
            socket.emit("rescue_attempt", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
            "key":"r", 'rm_id':room_id, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
            "k_time":new Date().toISOString()})
            for(const victimIndex of rescueIndexes){                
                    if (this.gameState.set_victims.has(victimIndex)){
                        socket.emit("rescue_success", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"rs", 'rm_id':room_id, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
                        "victim":victimIndex, "k_time":new Date().toISOString()})            
                        this.gameState.victimObj[String(victimIndex)].fillColor = "0xf6fa78";
                        this.gameState.set_victims.delete(victimIndex);
                        if (this.gameState.set_victims.size === 0){
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
        this.topLeft = this.add.sprite(344, 353, "blankTopLeft").setScrollFactor(0);
        this.topLeft.setScale(.04);
        this.topRight = this.add.sprite(365, 353, "blankTopRight").setScrollFactor(0);
        this.topRight.setScale(.04);
        this.bottomLeft = this.add.sprite(344, 377, "blankBottomLeft").setScrollFactor(0);
        this.bottomLeft.setScale(.04);
        this.bottomRight = this.add.sprite(365, 377, "blankBottomRight").setScrollFactor(0);
        this.bottomRight.setScale(.04);

        if(Math.random() < .3){ // first randomization
            if (Math.random() < .5){ // post accident*/
                this.topLeft = this.add.sprite(344, 353, "rubbleTopLeft").setScrollFactor(0);
                this.topLeft.setScale(.03);
                this.topRight = this.add.sprite(365, 353, "rubbleTopRight").setScrollFactor(0);
                this.topRight.setScale(.03);
                this.bottomLeft = this.add.sprite(344, 377, "rubbleBottomLeft").setScrollFactor(0);
                this.bottomLeft.setScale(.03);
                this.bottomRight = this.add.sprite(365, 377, "rubbleBottomRight").setScrollFactor(0);
                this.bottomRight.setScale(.03);
            }
        }else{ // second randomization
            if(Math.random() < .5){ 
                this.topLeft = this.add.sprite(344, 353, "rubbleTopLeft").setScrollFactor(0);
                this.topLeft.setScale(.03);
            }
            if(Math.random() < .5){
                this.topRight = this.add.sprite(365, 353, "rubbleTopRight").setScrollFactor(0);
                this.topRight.setScale(.03);
            }
            if(Math.random() < .5){
                this.bottomLeft = this.add.sprite(344, 377, "rubbleBottomLeft").setScrollFactor(0);
                this.bottomLeft.setScale(.03);
            }
            if(Math.random() < .5){
                this.bottomRight = this.add.sprite(365, 377, "rubbleBottomRight").setScrollFactor(0);
                this.bottomRight.setScale(.03);
            }
        }
    },
});

//var controls;
//const game = new Phaser.Game(phaserConfig); //Instantiate the game
var game = new Phaser.Game(phaserConfig); //Instantiate the game
game.scene.add("Gameplay", gamePlayState);


socket.on('connect',()=>{
    socket.on('welcome',(message)=>{
        console.log(message["data"])
    });
})

var dsplyGame = function(){
    $("#mainInfo").hide();
    console.log("join room clicked")
    socket.emit('start_wait', {"key": "sw", "k_time": new Date().toISOString(), "d_time": gameSetUpData.dTime})
    $("#join-room").hide();
    $('#wait-room').show();
}

$(document).ready(function() {
    $("#agree").change(actExpSmryBtn);
    $("#cte").on("click", dsplyExpSmry);
    $('#join-room').click(dsplyGame);
});

gameTimer.addEventListener('targetAchieved', function(){
    $('#phaser-game').hide();
    $("#game-over").show();
    game.scene.stop("GamePlay");
    socket.emit('end_game', {"key": "go_time", "k_time": new Date().toISOString()})
});

socket.on('wait_data', (message)=>{
    gameSetUpData.dTime = new Date().toISOString();
    room_id = message["rm_id"]
    playerId = message["idx"]
});


socket.on('start_game', (message)=>{
    $("#wait-room").hide();
    $("#phaser-game").css("display", "flex");
    console.log(message, "Start Game")
    socket.emit('start_game', {"key": "sg", "k_time": new Date().toISOString(), "d_time": gameSetUpData.dTime})
    game.scene.start("GamePlay");
    gameTimer.start({precision: 'secondTenths', countdown: true, startValues: {minutes: gameSetUpData.gameTime}})
    
});


gameTimer.addEventListener('secondTenthsUpdated', function() {
      $('#timerTime').text(" "+ gameTimer.getTimeValues().toString());
  });


gameTimer.addEventListener('started', function () {
    $('#timerTime').text(" 00:"+String(gameSetUpData.gameTime)+":00");
});