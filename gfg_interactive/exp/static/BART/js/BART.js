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

function Task(practice, max) {
    this.stepText = practice ? 'Finish Instructions' : 'Finish Task';
    this.max = max;
    this.balloon = 0;
}

Task.prototype.start = function(exitTrial) {
    this.exitTrial = exitTrial;
    this.reset();
};


Task.prototype.reset = function() {
    this.balloon++;
    this.pumps = 0;
    this.state = null;
    this.pop_point = Math.floor((Math.random() * 63) + 1);
    $('#inst').hide();
    $('#taskContainer').show();
    $("#poppedIm").hide();
    $('#resultText').css({opacity: '0'});
    hideButtons();

    $("#pumpText").text(String(pumps) + ' tokens');
    $("#balloonIm").css({height: '50px', width: '50px', top: '250px'}).show();
    $("#balloonIm").animate({opacity: '1'});
    $('#resultText').css({top: '0px'});
    $('#cashText').text('CASH IN');
    $('#cashBox').css({backgroundColor: '#009201'});
};


    //
    //
    //
    // this.reset = function () {
    //     this.balloon++;
    //     this.pumps = 0;
    //     this.state = none;
    //     this.pop_point = Math.floor((Math.random() * 63) + 1);
    //     $('#inst').hide();
    //     $('#taskContainer').show();
    //     $("#poppedIm").hide();
    //     $('#resultText').css({opacity: '0'});
    //     hideButtons();
    //
    //     $("#pumpText").text(String(pumps) + ' tokens');
    //     $("#balloonIm").css({height: '50px', width: '50px', top: '250px'}).show();
    //     $("#balloonIm").animate({opacity: '1'});
    //     $('#resultText').css({top: '0px'});
    //     $('#cashText').text('CASH IN');
    //     $('#cashBox').css({backgroundColor: '#009201'});
    // };
    //
    // this.trial = function() {
    //     this.reset();
    //     var balloon = this.balloon;
    //     var pumps = this.pumps;
    //     var popPoint = this.pop_point;
    //     var state = this.state;
    //     var stateText = this.stepText;
    //     $('#pumpBox').click(function(){
    //         if (!state) {
    //             console.log('fuck this');
    //             console.log(this.pumps);
    //             pumps ++;
    //             $("#balloonIm").animate({height: '+=3.25px', width: '+=3px', top: '-=3px'}, 50);
    //             $("#pumpText").text(String(pumps) + ' tokens');
    //             if (balloon > popPoint){
    //                 state = 'Popped';
    //                 pumps = 0;
    //                 $('#resultText').text('Popped');
    //                 $('#resultText').css({color:'red'});
    //                 $("#balloonIm").css({opacity:'0'}).hide();
    //                 $("#pumpText").text(String(pumps) + ' tokens');
    //                 $('#mainContainer').css({backgroundColor: '#FFB7B7'});
    //                 $('#cashBox').css({backgroundColor:'#CAC7CA'});
    //                 if (trial == max){
    //                     $('#cashText').text(stateText).css({opacity: '0'});
    //                 }else {
    //                     $('#cashText').text('Next Balloon').css({opacity: '0'});
    //                 }
    //                 $('#mainContainer').delay(500)
    //                     .animate({backgroundColor:'#f8f7ff'},{duration:750,easing:"linear", queue:false});
    //                 $("#cashText").delay(500).animate({opacity:'1'},{duration:200, easing:"linear", queue:false});
    //                 $('#resultText').delay(500).animate({top: '20px' ,opacity:'1'},{duration:750, easing:'linear',queue:false});
    //             }
    //         }
    //     });
    // };
//
// $('#cashBox').click(function(){
//     if (!popped && !cashed) {
//         cashed = true;
//         $('#resultText')
//             .text('Cashed!')
//             .css({top: '20px', color:'green'});
//         $('#balloonIm').animate({opacity:'0'},{duration:200}).hide();
//         $('#cashBox').css({backgroundColor:'#CAC7CA'});
//
//         if (trial == max){
//             $('#cashText').text(stepText).css({opacity: '0'});
//         }else {
//             $('#cashText').text('Next Balloon').css({opacity: '0'});
//         }
//         $("#cashText").delay(500).animate({opacity:'1'},{duration:750, easing:"linear", queue:false});
//         $('#resultText').delay(500).animate({top: '20px' ,opacity:'1'},{duration:750, easing:'linear',queue:false});
//     } else {
//         if (trial == max){
//             exitTrial();
//         } else {
//             reset();
//         }
//     }
//
// });
// };
//








BARTTask = {
    warning : "<span style='color:red; font-size:60px'> " + (String.fromCharCode(9888)) + " </span> This task requires 10-15 minutes of your undivided attention <br><br> If you don't have time right now, please come back when you have can focus. <br><br> Otherwise, click continue to begin!",
    InstructionText : [
        "Throughout this task, you will be presented with 30 balloons, one at a time. <br><br> You will be asked to inflate these balloons. Every time you choose to iinflate the balloon, it will grow slighty and you will receive one token.",
        "You can choose to stop inflating a balloon at any point and collect your tokens by choosing to 'cash in'. <br><br>once you choose to cash in, you will begin again with a new balloon.",
        "It is your choice to determine how much to pump up the balloon, but be aware that at some point the balloon will explode <br><br>The explosion point varies across balloons, ranging from the first pump to enough pumps to make the balloon fill almost the entire containing box.<br><br> if the balloon explodes, you will lose all of your tokens and move on to the next balloon.",
        "At the end of the task you will view a report of your performance in the task.<br><br> To practice with a few balloons, press continue."
    ],
    Instruction: Instruct,
    Task: Task
};
