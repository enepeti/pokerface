var socket = io();
var lastAnswer = null;
var firstQuestion;
var inPlay = true;

$(document).ready(function () {
    var team = localStorage['team'];
    var name = localStorage['name'];
    if(team || name) {
        $('#team').val(team);
        $('#name').val(name);
    }

    var progressInterval = setInterval(progress, 100);

});

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
        $('#waittext').css("display", "none");
    }

    $('#probar').val(90);
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
    $('#correctAnswers').html('Ebben a körben a jó válaszaid száma: ' + score.round + '<br>Ezzel ' + score.global + ' qpa pontot kockáztatsz.'); 
    $('#correctAnswers').css("display", "block");
    firstQuestion = true;
});

socket.on('dropped', function() {
    inPlay = false;
    localStorage['name'] = null;
    localStorage['team'] = null;
});

socket.on('disconnect', function() {
    if(inPlay) {
        location.reload();
    }
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
    var team = $('#team').val();
    var name = $('#name').val();
    var username = team + '-' + name;
    localStorage['name'] = name;
    localStorage['team'] = team;
    socket.emit('username', username);
    $('#setName').css("display", "none");
    $('#waittext').css("display", "block");
    firstQuestion = true;
}

function progress() {
    var bar = $('#probar');
    if(bar.val() > 0) {
        bar.val(bar.val() - 1);
    }
}