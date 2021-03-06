import {actExpSmryBtn, dsplyExpSmry} from "/js/expNav.js";
import {PlayerDisplay, GameState} from "/js/gameUtils.js"
import {phaserConfig, mapData, gameSetUpData, socketURL} from "/js/config.js"

var room_id = "temp_room";
var playerId = "temp_id";
var gameTimer = new Timer();
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

    },
    create: function() {
        console.log("GamePlay");
        this.gameState = new GameState(this.mapConfig)

        this.roundDisplay = this.add.text(0,0, "Round ".concat(String(this.gameConfig.roundCount)), {color: '0x000000', 
                            fontSize: '20px'}); 
        this.gameState.placeAtIndex(32, this.roundDisplay);
        
        this.playerDude = new PlayerDisplay(this, {"x": this.gameConfig.playerX, "y":this.gameConfig.playerY, "name":"dude"});
        this.playersCurrentLoc.push((this.playerDude.y*this.mapConfig.cols)+ this.playerDude.x);
    
        this.leaderDude = new PlayerDisplay(this, {"x": this.gameConfig.leaderX, "y":this.gameConfig.leaderY, "name":"chirag"});
        this.playersCurrentLoc.push((this.leaderDude.y*this.mapConfig.cols)+ this.leaderDude.x);

        this.player_list = [this.playerDude, this.leaderDude];

        this._drawGameInfo();

        this.keys = this.input.keyboard.addKeys('W, S, A, D, R, UP, DOWN, LEFT, RIGHT');
        this.leaderGuidance = true;
        this.leaderTimer = this.time.addEvent({
            delay: 500,
            callback: this._leaderAnimation,
            args: [],
            callbackScope: this,
            repeat: this.gameConfig.leaderMovementIndexes.length -1
        });

        socket.on('player_move', (message)=>{this.gameState.playerMove(message, playerId)});

 
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
            for(const victimIndex of this.mapConfig.victimIndexes){
                if (rescueIndexes.includes(victimIndex)){                 
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
        }
    },


    _leaderAnimation: function(){
        let currentLeaderloc = this.gameConfig.leaderMovementIndexes.length - (this.leaderTimer.getRepeatCount()+1)
        console.log(currentLeaderloc, this.gameConfig.leaderMovementIndexes[currentLeaderloc]);
        this.player_list[1].move(this.gameConfig.leaderMovementIndexes[currentLeaderloc][0], this.gameConfig.leaderMovementIndexes[currentLeaderloc][1],
            this.player_list[1].name+this.gameConfig.leaderMovementIndexes[currentLeaderloc][2])
        this.playersCurrentLoc[1] = (this.player_list[1].y*this.mapConfig.cols)+ this.player_list[1].x;
        if (this.leaderTimer.getRepeatCount()===0){
            console.log(this.playersCurrentLoc);
        }
    },


    _drawGameInfo: function(){
        const playerInGameInfo = new PlayerDisplay(this, {"x": 16, "y":23, "name":"dude"});
        playerInGameInfo.physicsObj.x = 120;
        playerInGameInfo.physicsObj.y = 72;

        const leaderInGameInfo = new PlayerDisplay(this, {"x": 15, "y":23, "name":"chirag"});
        leaderInGameInfo.physicsObj.x = 230;
        leaderInGameInfo.physicsObj.y = 72;

        this.add.text(38,66, "Player", {color: '0x000000', fontSize: '17px'});
        this.add.text(150,66, "Leader", {color: '0x000000', fontSize: '17px'});
        this.add.text(38,95, "Victim", {color: '0x000000', fontSize: '17px'});          
        this.add.rectangle(120,105, this.gameState.cw, this.gameState.ch, 0x9754e3);
        this.add.text(150,95, "Door", {color: '0x000000', fontSize: '17px'});
        this.add.rectangle(227,105, this.gameState.cw, this.gameState.ch, 0x9dd1ed, 0.3);
        this.add.text(40,130, "Saved Victim", {color: '0x000000', fontSize: '17px'});
        this.add.rectangle(190,140, this.gameState.cw, this.gameState.ch, 0xf6fa78);
    },

});


const game = new Phaser.Game(phaserConfig); //Instantiate the game
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

