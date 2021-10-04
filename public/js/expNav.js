import {surveyJSON} from "/js/config.js";

var actExpSmryBtn = function () {
// Activates the button to visit experiment information page on clicking the box to agree on the experiment conditions
    if($(this).prop('checked') == true) {
        $("#cte a").toggleClass("disabled");
    }else{
        $("#cte a").toggleClass("disabled");
    }
};

var changeDisplay = function(socketObj, handlerId, hideElement, showElement, keyData){
    $(hideElement).hide();
    keyData["time"]  = new Date().toISOString();
    socketObj.emit(handlerId, keyData)
    $(showElement).show();
}

var joinQuiz = function(socket){
    changeDisplay(socket, "game_info", "#mainInfo", "#surveyContainer", {"event":"start_quiz"})
    var sendDataToServer = function (survey) {
        let quizResult = true;
        var quizData;
        for (var key in survey.data){
            if (survey.data[key] != "correct"){
                quizResult = false;
                break
            }
        }
        if (quizResult===true){
            quizData = {"event":"quiz_passed", "quiz_data": survey.data}
            changeDisplay(socket, "game_info", "#surveyContainer", "#quiz-success", quizData)
        }else{
            quizData = {"event":"quiz_failed", "quiz_data": survey.data}
            changeDisplay(socket, "game_info", "#surveyContainer", "#quiz-fail", quizData)
        }
    }
    console.log("Quiz load");
    Survey.StylesManager.applyTheme("modern");
    var survey = new Survey.Model(surveyJSON);
    $("#surveyContainer").Survey({
        model: survey,
        onComplete: sendDataToServer
    });    
}

var endSession = function(gameObj, socketObj, timerObj, playerId, roomIdx, sessionId, selectIdx, keyMessage, sessionLimit, sessionMessage){
    gameObj.scene.stop("GamePlay");
    timerObj.stop();
    $("#phaser-game").hide();
    socketObj.emit('end_game', {"event": keyMessage, "s_id":sessionId, "rd_idx":selectIdx, 'rm_id':roomIdx, 
    'p_id': playerId, "time": new Date().toISOString()})
    if (sessionId==sessionLimit){
        $("#exp-close").show();
        gameObj.destroy();
    }else{
        $("#session-message").text(sessionMessage);
        $("#session-completed").text("Number of Games Played: "+sessionId);
        $("#session-over").show();
        sessionId += 1;
    }
    return sessionId
}

var startSession = function(gameObj, socketObj, hideElement, showElement, timerElement, keyData){
    $(hideElement).hide();
    $(showElement).css("display", "flex");
    $(timerElement).text(keyData["s_id"]);
    keyData["time"]  = new Date().toISOString();
    socketObj.emit('start_game', keyData)
    gameObj.scene.start("GamePlay");
}

export {actExpSmryBtn, endSession, startSession, joinQuiz, changeDisplay};