var blocks, currSession;

jQuery(function() {
    $("body").on('click', 'button', function(event) {
        return currSession.buttonClick(event.target);
    });
    return currSession.start();
});

blocks = [new BARTTask.Instruction(BARTTask.InstructionText[1]), new BARTTask.Task(false,30),new BARTTask.Instruction(BARTTask.InstructionText[1])];

currSession = new common.Session(blocks);

currSession.start();

