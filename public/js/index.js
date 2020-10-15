import {actExpSmryBtn, dsplyExpSmry, endSession, startSession, joinGame} from "/js/expNav.js";
import {PlayerDisplay, GameState} from "/js/gameUtils.js"
import {phaserConfig, getMapData, getGameData, socketURL, getRandomConfig} from "/js/config.js"

var gTime = new Date().toISOString();
var roomIdx = "na";
var playerId = "na";
var selectIdx = "na"
var gameTime = 2;
var gameTimer = new Timer();
var sessionId = 1;
var sessionLimit = 5;
var leaderDelay = 500;
const socket = io(socketURL, {transports: ['websocket']})
var gamePlayState = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function(){
        console.log("GamePlay init");
        Phaser.Scene.call(this, {key: 'GamePlay'});
        socket.on('player_move', (message)=>{this._playersMovementDisplay(message)});
        gameTimer.addEventListener('targetAchieved', ()=>{
            gTime = new Date().toISOString()
            this.input.keyboard.removeAllKeys()
            sessionId = endSession(game, socket, turk, gameTimer, this.playerList, playerId, roomIdx, sessionId, selectIdx, "go_time", sessionLimit, "Game Time Over")
        });

        gameTimer.addEventListener('secondTenthsUpdated', function() {
            $('#timerTime').text(" "+ gameTimer.getTimeValues().toString());
        });
      
        gameTimer.addEventListener('started', function () {
                $('#timerTime').text(" 00:"+String(gameTime)+":00");
            });

    },

    preload: function() {
        console.log("GamePlay preload");
        this.playersCurrentLoc = [];
        this.mapConfig = getMapData();
        this.gameConfig = getGameData();
        let randomSelectionValues = getRandomConfig();
        selectIdx = randomSelectionValues[0]
        this.gameConfig["leaderMovementIndexes"] = randomSelectionValues[1]
        this.mapConfig["roomVictimMapping"] = randomSelectionValues[2]
        this.mapConfig["victimIndexes"] = randomSelectionValues[3]
        
        this.load.spritesheet("chirag", "/assets/dude2.png",
        {frameWidth: 32, frameHeight: 48});
        this.load.spritesheet("dude","/assets/dude.png",
            {frameWidth: 32, frameHeight: 48});

    },
    create: function() {
        console.log("GamePlay create");
        this.gameState = new GameState(this.mapConfig, this)
        this.roundDisplay = this.add.text(0,0, "Round ".concat(String(this.gameConfig.roundCount)), {color: '0x000000', 
                            fontSize: '20px'}); 
        this.gameState.placeAtIndex(32, this.roundDisplay);
        this.roundDisplay.text = "Round ".concat(String(this.gameConfig.roundCount))
        
        this.playerDude = new PlayerDisplay(this, {"x": this.gameConfig.playerX, "y":this.gameConfig.playerY, "name":"dude"});
        this.playersCurrentLoc.push((this.playerDude.y*this.mapConfig.cols)+ this.playerDude.x);
    
        this.leaderDude = new PlayerDisplay(this, {"x": this.gameConfig.leaderX, "y":this.gameConfig.leaderY, "name":"chirag"});
        this.playersCurrentLoc.push((this.leaderDude.y*this.mapConfig.cols)+ this.leaderDude.x);
        
        this.playerList = Array();
        this.playerList.push(this.playerDude);
        this.playerList.push(this.leaderDude);
        this._drawGameInfo();

        gameTimer.start({precision: 'secondTenths', countdown: true, startValues: {minutes: gameTime}})

        this.leaderTimer = this.time.addEvent({
            delay: leaderDelay,
            callback: this._leaderAnimation,
            args: [],
            callbackScope: this,
            repeat: this.gameConfig.leaderMovementIndexes.length - 1
        });

        var keys = this.input.keyboard.addKeys('UP, DOWN, RIGHT, LEFT, R')
        keys.UP.on('down', ()=>{this._playerMove(this.playerList[playerId].x, this.playerList[playerId].y - 1, "up")});
        keys.DOWN.on('down', ()=>{this._playerMove(this.playerList[playerId].x, this.playerList[playerId].y + 1, "down")});
        keys.RIGHT.on('down', ()=>{this._playerMove(this.playerList[playerId].x + 1, this.playerList[playerId].y, "right")});
        keys.LEFT.on('down', ()=>{this._playerMove(this.playerList[playerId].x - 1, this.playerList[playerId].y, "left")});
        keys.R.on('down', ()=>{this._victimSave()});
    },


    _playersMovementDisplay (message){
        console.log(message["x"], message["y"], message["p_id"])
        let newIdx = (message["y"]*this.mapConfig.cols)+ message["x"]
        if (message["p_id"] == playerId){
            this.gameConfig.roundCount = message["r"];
            this.roundDisplay.text = "Round ".concat(String(this.gameConfig.roundCount));
            if (this.mapConfig.doorIndexes.includes(newIdx)){
                this.gameState.makeVictimsVisible(this.gameState.roomVictimObj[String(newIdx)]);
                this.gameState.makeRoomVisible(this.gameState.roomViewObj[String(newIdx)]);
            }                
        }
        this.playersCurrentLoc[message["p_id"]] = newIdx
        this.playerList[message["p_id"]].move(message["x"], message["y"], message["key"])

        if (this.gameConfig.roundCount <= 0){
            gTime = new Date().toISOString()
            this.input.keyboard.removeAllKeys()
            sessionId = endSession(game, socket, turk, gameTimer, this.playerList, playerId, roomIdx, sessionId, selectIdx, "go_round", sessionLimit, "All Rounds Used")
        }
    },

    _leaderAnimation: function(){
        let currentLeaderloc = this.gameConfig.leaderMovementIndexes.length - (this.leaderTimer.getRepeatCount()+1)
        socket.emit("player_move", {'x': this.gameConfig.leaderMovementIndexes[currentLeaderloc][0], 'y': this.gameConfig.leaderMovementIndexes[currentLeaderloc][1],
        "s_id":sessionId, "rd_idx":selectIdx, "key":this.gameConfig.leaderMovementIndexes[currentLeaderloc][2], 'rm_id':roomIdx,
        'p_id': 1, "kt":new Date().toISOString(),"dt": this.playerList[1].updateTime
    })
        if (this.leaderTimer.getRepeatCount()===0){
            console.log(this.playersCurrentLoc);
        }
    },

    _drawGameInfo: function(){
        const playerInGameInfo = new PlayerDisplay(this, {"x": 16, "y":23, "name":"dude"});
        playerInGameInfo.physicsObj.x = 115;
        playerInGameInfo.physicsObj.y = 72;

        const leaderInGameInfo = new PlayerDisplay(this, {"x": 15, "y":23, "name":"chirag"});
        leaderInGameInfo.physicsObj.x = 220;
        leaderInGameInfo.physicsObj.y = 72;

        this.add.text(35,66, "Player", {color: '0x000000', fontSize: '17px'});
        this.add.text(140,66, "Leader", {color: '0x000000', fontSize: '17px'});
        this.add.text(35,95, "Victim", {color: '0x000000', fontSize: '17px'});
        this.add.rectangle(115,105, this.gameState.cw, this.gameState.ch, 0x9754e3);
        this.add.text(140,95, "Door", {color: '0x000000', fontSize: '17px'});
        this.add.rectangle(210,105, this.gameState.cw, this.gameState.ch, 0x9dd1ed, 0.3);
        // this.add.text(40,130, "Saved Victim", {color: '0x000000', fontSize: '17px'});
        // this.add.rectangle(190,140, this.gameState.cw, this.gameState.ch, 0xf6fa78);
    },

    _victimSave(){
        let rescueIndexes = this.gameState.getVictimRescueIndexes(this.playerList[playerId].y, this.playerList[playerId].x);
        socket.emit("rescue_attempt", {'x': this.playerList[playerId].x, 'y': this.playerList[playerId].y,"key":"r", 'rm_id':roomIdx,
        'p_id': playerId, "victims_alive": Array.from(this.gameState.set_victims), "kt":new Date().toISOString()})
        for(const victimIndex of this.mapConfig.victimIndexes){
            if (rescueIndexes.includes(victimIndex)){                 
                if (this.gameState.set_victims.has(victimIndex)){
                    socket.emit("rescue_success", {'x': this.playerList[playerId].x, 'y': this.playerList[playerId].y,
                    "key":"rs", 'rm_id':roomIdx, 'p_id': playerId, "victims_alive": Array.from(this.gameState.set_victims), 
                    "victim":victimIndex, "kt":new Date().toISOString()})            
                    this.gameState.victimObj[String(victimIndex)].fillColor = "0xf6fa78";
                    this.gameState.set_victims.delete(victimIndex);
                    if (this.gameState.set_victims.size === 0){
                        console.log("SUCCESS")
                        gTime = new Date().toISOString()
                        this.input.keyboard.removeAllKeys()
                        sessionId = endSession(game, socket, turk, gameTimer, this.playerList, playerId, roomIdx, sessionId, selectIdx, "go_victim", sessionLimit, "Victim Saved")
                    }
                }  
            }
        }
    },

    _playerMove: function(x, y, direction){
        let newIdx = (y*this.mapConfig.cols)+ x;
        if (!(this.gameState.noRoadIndex.has(newIdx)) && !(this.playersCurrentLoc.includes(newIdx)) && (this.gameConfig.roundCount>0)){
            socket.emit("player_move", {'x': x, 'y': y, "s_id":sessionId, "rd_idx":selectIdx,
                "key":direction, 'rm_id':roomIdx, 'p_id': playerId, "kt":new Date().toISOString(),
                "dt": this.playerList[playerId].updateTime, "r": this.gameConfig.roundCount - 1
            });
        }
    }
});

console.log("Game Object");
const game = new Phaser.Game(phaserConfig); //Instantiate the game
game.scene.add("Gameplay", gamePlayState);


socket.on('connect',()=>{
    socket.on('welcome',(message)=>{
        console.log("Message from server "+message["data"])
    });
})

$(document).ready(function() {
    $("#agree").change(actExpSmryBtn);
    $("#cte").on("click", dsplyExpSmry);
    $("#join-room").on("click", function(){
        joinGame(socket, "#mainInfo", "#wait-room", "start_wait", gTime)
    });
    $('#start-session').on("click", function(){
        startSession(game, socket, sessionId, "#session-over", "#phaser-game", "#sessionId", "start_game", gTime);
    });
});

socket.on('wait_data', (message)=>{
    gTime = new Date().toISOString();
    roomIdx = new TextDecoder().decode(message["rm_id"]);
    playerId = message["p_id"]
});

socket.on('start_game', ()=>{
    startSession(game, socket, sessionId, "#wait-room", "#phaser-game", "#sessionId", "start_game", gTime);
});