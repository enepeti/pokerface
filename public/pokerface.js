var socket = io();
var lastAnswer = null;
var firstQuestion;

socket.on('question', function(data) {
    $('#answerButtona').css("background", "transparent");
    $('#answerButtonb').css("background", "transparent");
    $('#answerButtonc').css("background", "transparent");
    $('#answera').css("background", "transparent");
    $('#answerb').css("background", "transparent");
    $('#answerc').css("background", "transparent");
    
    $('#question').html(data.question);
    $('#answera').html(data.answers[0]);
    $('#answerb').html(data.answers[1]);
    $('#answerc').html(data.answers[2]);
    lastAnswer = null;
    
    if(firstQuestion) {
        firstQuestion = false;
        $('#questionaire').css("display", "block");
        $('#correctAnswers').css("display", "none");
    }
});

socket.on('correct', function(correctAnswer) {
    if(lastAnswer) {
        $('#answerButton' + lastAnswer).css("background", "red");
        $('#answer' + lastAnswer).css("background", "red");
    }
    lastAnswer = true;
    $('#answerButton' + correctAnswer).css("background", "green");
    $('#answer' + correctAnswer).css("background", "green");
});

socket.on('score', function(score) {
    $('#correctAnswers').html('Ebben a körben a jó válaszaid száma: ' + score); 
    $('#correctAnswers').css("display", "block");
    firstQuestion = true;
});

function sendAnswer(ansLetter) {
    if(!lastAnswer) {
        socket.emit('answer', ansLetter);
        $('#answerButton' + ansLetter).css("background", "yellow");
        $('#answer' + ansLetter).css("background", "yellow");
        lastAnswer = ansLetter;
    }
}

function sendName() {
    var name = $('#team').val() + '-' + $('#name').val();
    socket.emit('username', name);
    $('#setName').css("display", "none");
    firstQuestion = true;
}