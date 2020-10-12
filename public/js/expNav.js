var actExpSmryBtn = function () {
// Activates the button to visit experiment information page on clicking the box to agree on the experiment conditions
    if($(this).prop('checked') == true) {
        $("#cte a").toggleClass("disabled");
    }else{
        $("#cte a").toggleClass("disabled");
    }
};

var dsplyExpSmry = function () {
    //Display experiment information page
    if ($("#agree").prop('checked') == true) {
        $("#tmcn").hide();
        $("#mainInfo").show();
    } else {
        alert('Please indicate that you have read and agree to the Terms and Conditions and Privacy Policy');
    }
};

var joinGame = function(socketObj, hideElement, showElement, keyMessage, gTime){
    $(hideElement).hide();
    socketObj.emit('start_wait', {"key": keyMessage, "kt": new Date().toISOString(),  "dt": gTime});
    $(showElement).show();
}

var endSession = function(gameObj, socketObj, turkObj, timerObj, playersList, playerId, roomIdx, sessionId, selectIdx, keyMessage, sessionLimit, sessionMessage){

    gameObj.scene.stop("GamePlay");
    timerObj.stop();
    $("#phaser-game").hide();
    let playersUpdateTime = Array();
    for (let player of playersList){
        playersUpdateTime.push(player.updateTime)
    }
    socketObj.emit('end_game', {"key": keyMessage, "s_id":sessionId, "rd_idx":selectIdx, 'rm_id':roomIdx, 'p_id': playerId, "kt": new Date().toISOString(), "dt": playersUpdateTime})
    if (sessionId==sessionLimit){
        turkObj.submit({"p_id":playerId, "rm_id":roomIdx});
        $("#game-over").show();
    }else{
        $("#session-message").text(sessionMessage);
        $("#session-completed").text("No of Games Played: "+sessionId);
        $("#session-over").show();
        sessionId += 1;
    }
    return sessionId
}

var startSession = function(gameObj, socketObj, sessionId, hideElement, showElement, timerElement, keyMessage, gTime){
    $(hideElement).hide();
    $(showElement).css("display", "flex");
    $(timerElement).text(sessionId);
    socketObj.emit('start_game', {"key": keyMessage, "s_id":sessionId, "kt": new Date().toISOString(), "dt": gTime})
    gameObj.scene.start("GamePlay");
}

export {actExpSmryBtn, dsplyExpSmry, endSession, startSession, joinGame};