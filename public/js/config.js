var phaserConfig = {
    type: Phaser.AUTO,
    width: 620,
    height: 500,
    parent: 'phaser-game',
    backgroundColor:0xffffff,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    } 
};

var getMapData  = function(){

    let mapData = {'cols': 31,'rows': 25,
    'hallwayBoundaryIndexes':[167, 173, 198, 204, 229, 235, 260, 266, 291, 297, 
        322, 328, 353, 359,  377, 378, 379, 380, 381, 382, 383, 384, 390, 391, 
        392, 393, 394, 395, 396, 397,  563, 564, 565, 566, 567, 568, 569, 570, 576, 577, 
        578, 579, 580, 581, 582, 583, 601,607, 632, 638, 663, 669, 694, 700, 725, 
        731, 756, 757, 758, 759, 760, 761, 762],
    "roomWallIndexes":[12, 13, 14, 15, 16, 17, 18, 43, 49, 74, 80, 105, 111, 136, 
        137, 138, 140, 141, 142, 372, 373, 374, 375, 376, 403,407,434,438,465,
        496,500,527,531,558, 559, 560,561,562, 398,399,400,401,402, 429, 433, 
        460, 464, 495, 522, 526, 553, 557, 584, 585,586,587,588],
    "doorIndexes": [139, 469, 491],
    'roomViewBlocksMapping': {'139': [44,45,46,47,48,75,76,77,78,79,106,107,108,109,110],
        "469":[404,405,406,435,436,437,466,467,468,497,498,499,528,529,530], 
        "491":[430,431,432,461,462,463,492,493,494,523,524,525,554,555,556]},
    'noGameBox': [0,1,2,3,4,5,6,7,8,9,10,11, 19,20,21,22,23,24,25,26,27,28,29,30,
        31,32,33,34,35,36,37,38,39,40,41,42,50,51,52,53,54,55,56,57,58,59,60,61,62,
        63,64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 1, 81,82, 83, 84, 85, 86, 87, 88, 89,
        90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104,112, 113, 114, 
        115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 
        131, 132, 133, 134, 135, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 
        154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 174, 175, 176, 
        177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 
        193, 194, 195, 196, 197, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 
        216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 236, 237, 238, 
        239, 240, 241, 242, 243, 244, 245, 246, 247, 248,249, 250, 251, 252, 253, 254, 
        255, 256, 257, 258, 259, 267, 268, 269, 270, 271, 272, 273, 274, 275,276, 277, 
        278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 298, 299, 300, 
        301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 
        317, 318, 319, 320, 321, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 
        340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352,360, 361, 362, 363, 
        364, 365, 366, 367, 368, 369, 370, 371, 589, 590, 591, 592, 593, 594, 595, 596, 597, 
        598, 599, 600,608, 609, 610, 611, 612, 613, 614, 615, 616, 
        617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 639, 640, 
        641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 
        658, 659, 660, 661, 662, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 
        682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 701, 702, 703, 704, 705, 
        706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 
        723, 724, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 
        747, 748, 749, 750, 751, 752, 753, 754, 755, 763, 764, 765, 766, 767, 768, 769, 770, 
        771, 772, 773, 774],
    }
    return mapData
}

var getGameData = function(){
    let gameSetUpData = {"roundCount":"40", "playerX":16, "playerY":23, "leaderX":15, "leaderY":23}
    return gameSetUpData
}

var getRandomConfig = function(){
    let selectIdx = Math.floor(Math.random() * 3)

    let victimSetUpDataList = [[[15, 23, "down"], [15, 23, "down"], [15, 22, "up"], [15, 21, "up"], [15, 20, "up"], [15, 19, "up"],
    [15, 18, "up"], [15, 17, "up"], [15, 16, "up"], [15, 15, "up"], [14, 15, "left"], [13, 15, "left"], [12, 15, "left"], [11, 15, "left"], [10, 15, "left"],
    [10, 15, "left"], [11, 15, "right"], [12, 15, "right"], [13, 15, "right"], [14, 15, "right"], [15, 15, "right"], [15, 15, "down"]],
    [[15, 23, "down"], [15, 23, "down"], [15, 22, "up"], [15, 21, "up"], [15, 20, "up"], [15, 19, "up"],
    [15, 18, "up"], [15, 17, "up"], [15, 16, "up"], [15, 15, "up"], [16, 15, "right"], [17, 15, "right"], [18, 15, "right"],
    [19, 15, "right"], [20, 15, "right"], [19, 15, "left"], [18, 15, "left"], [17, 15, "left"], [16, 15, "left"],[15, 15, "left"], [15, 15, "down"]],
    [[15, 23, "down"], [15, 23, "down"], [15, 22, "up"], [15, 21, "up"], [15, 20, "up"], [15, 19, "up"],
    [15, 18, "up"], [15, 17, "up"], [15, 16, "up"], [15, 15, "up"], [15, 14, "up"], [15, 13, "up"], [15, 12, "up"], [15, 11, "up"],
    [15, 10, "up"], [15, 11, "down"], [15, 12, "down"], [15, 13, "down"], [15, 14, "down"], [15, 15, "down"],[15, 15, "down"]]]

    var victimMapList = [{'139': [], "469":[466], "491":[]}, {'139': [], "469":[], "491":[494]}, {'139': [46], "469":[], "491":[]}]   

    let roomVictimMapping = victimMapList[selectIdx]
    let leaderMovementIndexes = victimSetUpDataList[selectIdx]
    let  victimIndexes  = Array();

    for (let k in roomVictimMapping){
        for (var i = 0; i < roomVictimMapping[k].length; i++) {
            victimIndexes.push(roomVictimMapping[k][i])
        }
    }

    return [selectIdx, leaderMovementIndexes, roomVictimMapping, victimIndexes]
}

const surveyJSON = {"title":"Instruction Attention Check",
"description":"This quiz is based on the instructions of the game that you read on the previous page.",
"focusFirstQuestionAutomatic":false,
"focusOnFirstError":false,
"pages": [{"name": "page1",
      "elements": [{"type": "radiogroup",
                    "name": "q1",
                    "title": "What is the goal of this game?",
                    "isRequired":true,
                    "choices": [{"value": "1", "text": "To rescue the victim."},
                                {"value": "item2", "text": "To escape from the bandit."},
                                {"value": "item3", "text": "To collect all the gold coins."},
                                {"value": "item4", "text": "To figure out the secret word."}],
                    "choicesOrder":"random"},
                    {"type": "radiogroup",
                    "name": "q2",
                    "title": "What does the leader know?",
                    "isRequired":true,
                    "choices": [{"value": "1", "text": "The leader knows where the victim is."},
                                {"value": "item2", "text": "The leader has access to the same information as the player."},
                                {"value": "item3", "text": "The leader knows what parts of the map are dangerous for the player."},
                                {"value": "item4", "text": "There is no leader in this game."}],
                    "choicesOrder":"random"},
                    {"type": "radiogroup",
                    "name": "q3",
                    "title": "What keys do you use to play this game?",
                    "isRequired":true,
                    "choices": [{"value": "item1", "text": "“up”, “down”, “left”, “right”, and “space”."},
                                {"value": "item2", "text": "“up”, “down”, “left”, and “right”."},
                                {"value": "item3", "text": "“up”, “down”, “left”, “right”, and “s”."},
                                {"value": "4", "text": "“up”, “down”, “left”, “right”, and “r”."}],
                    "choicesOrder":"random"}                    
                ]                     
            }],
"questionsOrder":"random",    
"showProgressBar":"both",
"progressBarType":"questions",
"questionTitlePattern":"numTitle",
"completeText": "Check Result",
"questionsOnPageMode":"singlePage"                              
}

var socketURL = "https://asist-api.herokuapp.com/"
// var socketURL  = "http://127.0.0.1:5000"
export {phaserConfig, getMapData, getGameData, socketURL, getRandomConfig, surveyJSON};
