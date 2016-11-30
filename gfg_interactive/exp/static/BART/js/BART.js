hideButtons = function() {
    $("#leftButton").hide();
    return $("#rightButton").hide();
};

keyText = function(text, key) {
    if (key === 'left') {
        $("#leftText").html(text);
        return $("#leftButton").show();
    } else {
        $("#rightText").html(text);
        return $("#rightButton").show();
    }
};

function Instruct(message,leftKey,rightKey) {
    this.message = message;
    this.leftKey = leftKey != null ? leftKey : null;
    this.rightKey = rightKey != null ? rightKey : "Continue";
}

Instruct.prototype.start = function(exitTrial) {
    this.exitTrial = exitTrial;
    $('#taskContainer').hide();
    $("#inst").html(this.message);
    $("#inst").show();
    hideButtons();
    if (this.leftKey != null) {
        keyText(this.leftKey, 'left');
    }
    return keyText(this.rightKey,'right');
};

Instruct.prototype.buttonClick = function(button) {
    var acc;
    if (button.id == 'leftText' || button.id == 'leftButton') {
        acc = 'BACK';
        this.exitTrial(false);
    }
    else if (button.id === 'rightText' || button.id === 'rightButton') {
        acc = 'FORWARD';
        this.exitTrial();
    }
};


Trial = (function() {
    function Trial(practice) {
        this.practice = practice;
        this.balloonNum = 0;
        this.ended = false;
        this.Tokens = 0;
        if (!practice) {
            $("#InstructionSide").hide();
        }

        this.updateBalloonAndTokenDisplay = function() {
            $("#balloonIm").animate({height: '+=3.25px', width: '+=3px', top: '-=3px'}, 50);
            $("#pumpText").text(String(this.Tokens) + ' tokens');
        };

        this.resetAllDisplay = function() {
            $('#inst').hide();
            $('#taskContainer').show();
            $("#poppedIm").hide();
            $('#resultText').css({opacity: '0'});
            hideButtons();
            $('#ContinueButton').css({opacity:'0'}).hide();
            $("#pumpText").text('0 tokens');
            $("#balloonIm").css({height: '50px', width: '50px', top: '250px'}).show();
            $("#balloonIm").animate({opacity: '1'});
            $('#resultText').css({top: '0px'});
            $('#cashText').text('CASH IN');
            $('#cashBox').animate({opacity:'1'},{queue:false});
        };
    }

    Trial.prototype.start = function(exitTrial) {
        this.exitTrial = exitTrial;
        hideButtons();
        this.resetAllDisplay();
    };

    Trial.prototype.buttonClick = function(button) {
        console.log(button.id);
        if (button.id === 'ContinueButton') {
            this.ended = false;
            this.resetAllDisplay();

        }
        else if (button.id === 'pumpBox') {
            if (!this.ended) {
                this.Tokens ++;
                this.updateBalloonAndTokenDisplay();
            }

        }
    };

    return Trial;
})();
