import {actExpSmryBtn, dsplyExpSmry} from "/js/expNav.js";
import {PlayerDisplay, GameState} from "/js/gameUtils.js"
import {phaserConfig, mapData, gameSetUpData, socketURL, selectIdx} from "/js/config.js"

var roomIdx = "temp_room";
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
                    let left_x = this.player_list[playerId].x - 1;
                    socket.emit("player_move", {'x': left_x, 'y': this.player_list[playerId].y,
                        "key":"left", 'rm_id':roomIdx, 'idx': playerId, "k_time":new Date().toISOString(),
                        "dTime": this.player_list[playerId].update_time, "rcount": this.gameConfig.roundCount
                    })
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)){
                let newIdx = (this.player_list[playerId].y*this.mapConfig.cols)+ (this.player_list[playerId].x + 1);
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Right");
                    let right_x = this.player_list[playerId].x + 1;
                    socket.emit("player_move", {'x': right_x, 'y': this.player_list[playerId].y,
                        "key":"right", 'rm_id':roomIdx, 'idx': playerId, "k_time":new Date().toISOString(),
                        "dTime": this.player_list[playerId].update_time, "rcount": this.gameConfig.roundCount
                    })         
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.UP)){
                let newIdx = ((this.player_list[playerId].y-1)*this.mapConfig.cols)+ this.player_list[playerId].x;
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Up");
                    let up_y = this.player_list[playerId].y - 1;
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': up_y,
                        "key":"up", 'rm_id':roomIdx, 'idx': playerId, "k_time":new Date().toISOString(),
                        "dTime": this.player_list[playerId].update_time, "rcount": this.gameConfig.roundCount
                    })
                }
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys.DOWN)){             
                let newIdx = ((this.player_list[playerId].y+1)*this.mapConfig.cols)+ this.player_list[playerId].x;
                if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx))){
                    console.log("Move Down");
                    let down_y = this.player_list[playerId].y + 1;
                    socket.emit("player_move", {'x': this.player_list[playerId].x, 'y': down_y,
                        "key":"down", 'rm_id':roomIdx, 'idx': playerId, "k_time":new Date().toISOString(),
                        "dTime": this.player_list[playerId].update_time, "rcount": this.gameConfig.roundCount
                    })
                }
            }
        }
        else if (this.gameConfig.roundCount<=0){
            gameTimer.stop()
            $("#phaser-game").hide();
            $("#game-over").show();
            game.scene.stop("GamePlay");
            socket.emit('end_game', {"key": "go_round", "k_time": new Date().toISOString()});
            turk.submit({"idx":playerId, "rm_id":roomIdx});
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.R)){
            let rescueIndexes = this.gameState.getVictimRescueIndexes(this.player_list[playerId].y, this.player_list[playerId].x);
            socket.emit("rescue_attempt", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
            "key":"r", 'rm_id':roomIdx, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
            "k_time":new Date().toISOString()})
            for(const victimIndex of this.mapConfig.victimIndexes){
                if (rescueIndexes.includes(victimIndex)){                 
                    if (this.gameState.set_victims.has(victimIndex)){
                        socket.emit("rescue_success", {'x': this.player_list[playerId].x, 'y': this.player_list[playerId].y,
                        "key":"rs", 'rm_id':roomIdx, 'idx': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
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
                            socket.emit('end_game', {"key": "go_victim", "k_time": new Date().toISOString()})
                            turk.submit({"idx":playerId, "rm_id":roomIdx});
                        }
                    }
                    
                }
            }
        }
    },


    _leaderAnimation: function(){
        let currentLeaderloc = this.gameConfig.leaderMovementIndexes.length - (this.leaderTimer.getRepeatCount()+1)
        console.log(currentLeaderloc, this.gameConfig.leaderMovementIndexes[currentLeaderloc]);
        socket.emit("player_move", {'x': this.gameConfig.leaderMovementIndexes[currentLeaderloc][0], 'y': this.gameConfig.leaderMovementIndexes[currentLeaderloc][1],
        "key":this.gameConfig.leaderMovementIndexes[currentLeaderloc][2], 'rm_id':roomIdx, 'idx': 1, "k_time":new Date().toISOString(),
        "dTime": this.player_list[1].update_time
    })
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
    turk.submit({"idx":playerId, "rm_id":roomIdx});
});

socket.on('wait_data', (message)=>{
    gameSetUpData.dTime = new Date().toISOString();
    roomIdx = new TextDecoder().decode(message["rm_id"]);
    playerId = message["idx"]
});


socket.on('start_game', (message)=>{
    $("#wait-room").hide();
    $("#phaser-game").css("display", "flex");
    console.log(message, "Start Game");
    socket.emit('start_game', {"key": "sg", "k_time": new Date().toISOString(), "d_time": gameSetUpData.dTime, "random_idx":selectIdx})
    game.scene.start("GamePlay");
    gameTimer.start({precision: 'secondTenths', countdown: true, startValues: {minutes: gameSetUpData.gameTime}})
    
});


gameTimer.addEventListener('secondTenthsUpdated', function() {
      $('#timerTime').text(" "+ gameTimer.getTimeValues().toString());
  });


gameTimer.addEventListener('started', function () {
    $('#timerTime').text(" 00:"+String(gameSetUpData.gameTime)+":00");
});

