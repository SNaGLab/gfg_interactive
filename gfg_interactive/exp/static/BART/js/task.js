var blocks, currSession;

jQuery(function() {
    $("body").on('click', 'button', function(event) {
        return currSession.buttonClick(event.target);
    });
    return currSession.start();
});

blocks = [new BARTTask.Instruction(BARTTask.warning),new BARTTask.Instruction(BARTTask.InstructionText[0]),new BARTTask.Instruction(BARTTask.InstructionText[1]),new BARTTask.Instruction(BARTTask.InstructionText[2]),new BARTTask.Instruction(BARTTask.InstructionText[3])];

currSession = new common.Session(blocks);

currSession.start();

