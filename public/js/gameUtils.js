class PlayerDisplay {
    constructor(gameScene, Config){
        this.gameScene= gameScene
        this.Config = Config
        this.x = Config.x
        this.y = Config.y
        this.name = Config.name
        this.updateTime = new Date().toISOString();
        this.direction = "down"
        this.physicsObj = gameScene.add.sprite(32, 32, Config.name);
        this.gameScene.gameState.placeAt(this.x, this.y, this.physicsObj);
        this.physicsObj.displayHeight = (this.gameScene.sys.game.scale.gameSize._height/this.gameScene.mapConfig.rows)+3;
        this.physicsObj.scaleX = this.physicsObj.scaleY;
        
        this.gameScene.anims.create(
            {
                "key": this.name+"left",
                "frames":[
                    {"key":this.name, "frame":0}
                ],
                "repeat": -1
            });
        this.gameScene.anims.create(
            {
                "key": this.name+"down",
                "frames":[
                    {"key":this.name, "frame":1}
                ],
                "repeat": -1
            });
        this.gameScene.anims.create(
            {
                "key": this.name+"right",
                "frames":[
                    {"key":this.name, "frame":2}
                ],
                "repeat": -1
            });
        this.gameScene.anims.create(
            {
                "key": this.name+"up",
                "frames":[
                    {"key":this.name, "frame":3}
                ],
                "repeat": -1
            });   

        this.physicsObj.anims.play(this.name+"down");              
    };

    move(x,y, direction){
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.updateTime = new Date().toISOString();
        console.log(this.name, this.x, this.y, direction);
        this.gameScene.gameState.placeAt(this.x, this.y, this.physicsObj);
        this.physicsObj.anims.play(this.name+direction);
    }
 }


class GameState {

    constructor(config, gameScene){
        this._storeMapVariablesFromConfig(config, gameScene);
        this._generateMapVariables();
        this._drawInitiatSetUp();
        // this.map = new GameMap(mapConfig);

    }
    _drawInitiatSetUp(){
        
        this._drawGrid();
        this._drawRectangleBlocks(this.config.hallwayBoundaryIndexes, 0x000000,1);
        this._drawRectangleBlocks(this.config.roomWallIndexes, 0x000000,1);
        this._drawRectangleBlocks(this.config.doorIndexes, 0x9dd1ed, 0.3);
        this._drawRectangleBlocks(this.config.noGameBox, 0xffffff, 1);
        this.scene.add.rectangle(100,150,100,150,0xffffff,1)
        // this._drawText();
        // this._showNumbers();

        this._drawVictims(this.config.roomVictimMapping, 0x9754e3, 0)
        this._blockRoomView(this.config.roomViewBlocksMapping, 0x8a8786, 0.8)
    }
    _storeMapVariablesFromConfig(config, gameScene){
        this.config = config;
        this.scene = gameScene;
        this.game_width = gameScene.sys.game.scale.gameSize._width;
        this.game_height = gameScene.sys.game.scale.gameSize._height;
        this.cw = gameScene.sys.game.scale.gameSize._width / config.cols;
        this.ch = gameScene.sys.game.scale.gameSize._height / config.rows;        
    } 
    _generateMapVariables(){
        this.noRoadIndex = this._generateNoRoadIndexes(this.config.hallwayBoundaryIndexes,
            this.config.roomWallIndexes, this.config.victimIndexes);

        this.set_victims = new Set(this.config.victimIndexes);

    }
    _generateNoRoadIndexes(hallwayBoundaryIndexes,roomWallIndexes, victimIndexes){
        let noRoadIndex = new Set(hallwayBoundaryIndexes);
        victimIndexes.forEach(item => noRoadIndex.add(item));
        roomWallIndexes.forEach(item => noRoadIndex.add(item));
        return noRoadIndex
    }
    _drawGrid() {
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(0.5, 0x000000);
        for (var i = 0; i <= this.game_width; i += this.cw) {
            this.graphics.moveTo(i, 0);
            this.graphics.lineTo(i, this.game_height);
        }
        for (var i = 0; i <= this.game_height; i += this.ch) {
            this.graphics.moveTo(0, i);
            this.graphics.lineTo(this.game_width, i);
        }
        this.graphics.strokePath();
    }

    placeAt(xx, yy, obj) {
        var x2 = this.cw * xx + this.cw / 2;
        var y2 = this.ch * yy + this.ch / 2;
        obj.x = x2;
        obj.y = y2;
    }

    placeAtIndex(index, obj) {

        var yy = Math.floor(index / this.config.cols);
        var xx = index - (yy * this.config.cols);
        this.placeAt(xx, yy, obj);
    }

    _showNumbers() {

        var count = 0;
        for (var i = 0; i < this.config.rows; i++) {
            for (var j = 0; j < this.config.cols; j++) {
                var numText = this.scene.add.text(0, 0, count, {
                    color: '#ff0000'
                });
                numText.setOrigin(0.5, 0.5);
                this.placeAtIndex(count, numText);
                count++;
            }
        }
    }

    _drawRectangleBlocks(locIndexes, colorHex, alpha) {

        for (const idx of locIndexes){
            let rect = this.scene.add.rectangle(20,20, this.cw, this.ch, colorHex, alpha);
            this.placeAtIndex(idx, rect);

        }
    }
    _drawText(){

        this.placeAtIndex(311, this.scene.add.text(0,0, "Room A", {color: '0x000000', fontSize: '20px'}));
        this.placeAtIndex(9, this.scene.add.text(0,0, "Room B", {color: '0x000000', fontSize: '20px'}));
        this.placeAtIndex(337, this.scene.add.text(0,0, "Room C", {color: '0x000000', fontSize: '20px'}));
    }

    _drawVictims(locIndexesObj, colorHex, alpha){
        this.roomVictimObj = new Object(); // all victims in a a room identified by door key 
        this.victimObj = new Object(); //all victims identified by key
        for (let roomIndex in locIndexesObj){
            this.roomVictimObj[roomIndex] = new Array();
            for (let victimIndex of locIndexesObj[roomIndex]){
                let rect = this.scene.add.rectangle(20,20, this.cw, this.ch, colorHex, alpha);
                this.placeAtIndex(victimIndex, rect);
                this.roomVictimObj[roomIndex].push(rect);
                this.victimObj[victimIndex] = rect;
            }
        }
    }
    _blockRoomView(locIndexesObj, colorHex, alpha){
        this.roomViewObj = new Object();
        for (let roomIndex in locIndexesObj){
            this.roomViewObj[roomIndex] = new Array();
            for (let viewIndex of locIndexesObj[roomIndex]){
                let rect = this.scene.add.rectangle(20,20, this.cw, this.ch, colorHex, alpha);
                this.placeAtIndex(viewIndex, rect);
                this.roomViewObj[roomIndex].push(rect);
            }
        }        
    }
    makeVictimsVisible(victimObjArray){
        for (let i=0; i<victimObjArray.length; i++) {
            victimObjArray[i].fillAlpha = 1;
        }
    }

    makeRoomVisible(viewObjArray){
        for (let i=0; i<viewObjArray.length; i++) {
            viewObjArray[i].fillAlpha = 0;
        }      
    }

    getVictimRescueIndexes(x,y){
        let rescueIndexes = new Array();
        for(let i=x-1; i<=x+1; i++){
            for(let j=y-1; j<=y+1; j++){
                rescueIndexes.push((i*this.config.cols)+j);
            }
        }
        return rescueIndexes
    }

    makeVictimsVisible(victimObjArray){
        for (let i=0; i<victimObjArray.length; i++) {
            victimObjArray[i].fillAlpha = 1;
        }
    }

    makeRoomVisible(viewObjArray){
        for (let i=0; i<viewObjArray.length; i++) {
            viewObjArray[i].fillAlpha = 0;
        }      
    }

    getVictimRescueIndexes(x,y){
        let rescueIndexes = new Array();
        for(let i=x-1; i<=x+1; i++){
            for(let j=y-1; j<=y+1; j++){
                rescueIndexes.push((i*this.config.cols)+j);
            }
        }
        return rescueIndexes
    }

    placeAt(xx, yy, obj) {
        var x2 = this.cw * xx + this.cw / 2;
        var y2 = this.ch * yy + this.ch / 2;
        obj.x = x2;
        obj.y = y2;
    }

    placeAtIndex(index, obj) {

        var yy = Math.floor(index / this.config.cols);
        var xx = index - (yy * this.config.cols);
        this.placeAt(xx, yy, obj);
    }
}


export {PlayerDisplay, GameState};