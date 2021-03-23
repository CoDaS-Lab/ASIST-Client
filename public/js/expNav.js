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


export {actExpSmryBtn, dsplyExpSmry};
