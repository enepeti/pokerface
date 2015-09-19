var socket = io();

socket.on('question', function(data) {
    $('#tda').css("background", "transparent");
    $('#tdb').css("background", "transparent");
    $('#tdc').css("background", "transparent");
    $('#answera').css("background", "transparent");
    $('#answerb').css("background", "transparent");
    $('#answerc').css("background", "transparent");
    $('#roundEnd').css('display', 'none');
    $('#lastPlayer').html('');
    $('#playerrankings').html('');

    $('#question').html(data.question);
    $('#answera').html(data.answers[0]);
    $('#answerb').html(data.answers[1]);
    $('#answerc').html(data.answers[2]);
});

socket.on('correct', function(correctAnswer) {
    $('#newQuestion').attr('disabled', false);
    $('#td' + correctAnswer).css("background", "green");
    $('#answer' + correctAnswer).css("background", "green");
});

socket.on('players', function(players) {
    var playerSelect = $('#playerSelect');
    playerSelect.html('');
    var player;
    for(player of players) {
        var option = $('<option>');
        option.html(player);
        playerSelect.append(option);
    }
});

socket.on('tables', function(scores) {
    var playerrankings = $('#playerrankings');
    playerrankings.html('');
    $('#roundEnd').css('display', 'block');
    var score;
    for(score of scores) {
        var tr = $('<tr>');
        var nametd = $('<td>');
        var scoretd = $('<td>');
        nametd.html(score.name);
        scoretd.html(score.score);
        tr.append(nametd, scoretd);
        playerrankings.append(tr);
    }
});

socket.on('last', function(player) {
    $('#lastPlayer').html(player);
});

function newQuestion() {
    $('#newQuestion').attr('disabled', true);
    socket.emit('new');
}

function newGame() {
    socket.emit('gameover');
}

function dropPlayer() {
    var playername = $('#playerSelect').val();
    socket.emit('drop', playername);
}

function dropLast() {
    socket.emit('autodrop');
}

function sendPw() {
    var pw = $('#pw').val();
    $('#pw').val('');
    socket.emit('admin', pw);
}