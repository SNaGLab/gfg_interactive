/**
 * Created by JMP on 8/11/16.
 */
/**
 * Created by JMP on 8/4/16.
 */
// Generated by CoffeeScript 1.9.3
(function() {
    var blocks, currSession;
    jQuery(function() {
        $("body").on('click', 'button', function(event) {
            return currSession.buttonClick(event.target);
        });
        return currSession.start();
    });
  warning = "<span style='color:red; font-size:60px'> " + (String.fromCharCode(9888)) + " </span> This task requires 10-15 minutes of your<br><tab>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; undivided attention <br><br> If you don't have time right now, please come back when you have can focus. <br><br> Otherwise, click continue to begin!";

    blocks = [new BART.instruction(), new BART.runInst(), new BART.run()];

    currSession = new common.Session(blocks);

    currSession.start();

}).call(this);

