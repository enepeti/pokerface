var socket = io();
var makeTable = true;
var roundEnd = false;

socket.on('question', function(data) {
    $('#tda').css("background", "transparent");
    $('#tdb').css("background", "transparent");
    $('#tdc').css("background", "transparent");
    $('#answera').css("background", "transparent");
    $('#answerb').css("background", "transparent");
    $('#answerc').css("background", "transparent");
    $('#roundEnd').css('display', 'none');
    $('#lastPlayer').html('');

    $('#question').html(data.question);
    $('#answera').html(data.answers[0]);
    $('#answerb').html(data.answers[1]);
    $('#answerc').html(data.answers[2]);
});

socket.on('correct', function(correctAnswer) {
    //$('#newQuestion').attr('disabled', false);
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
    $('#roundEnd').css('display', 'block');
    var header = $('#header');
    var th = $('<th>');
    th.html('Jó válaszok száma');
    th.addClass('separatedtable');
    header.append(th);
    th = $('<th>');
    th.html('Eddigi qpapontok');
    th.addClass('separatedtable');
    header.append(th);
    roundEnd = true;
    var score;
    for(score of scores) {
        var nextr = $('#' + score.name);
        var scoretd = $('<td>');
        scoretd.html(score.score.round);
        scoretd.addClass('separatedtable');
        nextr.append(scoretd);
        var globaltd = $('<td>');
        globaltd.html(score.score.global);
        globaltd.addClass('separatedtable');
        nextr.append(globaltd);
        playerrankings.append(nextr);
    }
});

socket.on('last', function(player) {
    $('#lastPlayer').html(player);
});

socket.on('answers', function(answers) {
    $.each(answers, function(index, value) {
        console.log(index + ":" + value.answer + ' ' + value.time);
        if(makeTable) {
            makeTable = false;
            var table = $('#playerrankings');
            var playertr = $('<tr>');
            playertr.attr('id', index);
            var nametd = $('<td>');
            nametd.html(index);
            nametd.addClass('separatedtable');
            playertr.append(nametd);
            table.append(playertr);
        }

        if(roundEnd) {
            roundEnd = false;
            var header = $('#header');
            header.html('');
            var th = $('<th>');
            th.html('Játékos');
            th.addClass('separatedtable')
            header.append(th);
            var nextr = $('#' + index);
            nextr.html('');
            var nametd = $('<td>');
            nametd.html(index);
            nametd.addClass('separatedtable');
            nextr.append(nametd);
        }

        var header = $('#header');
        var th = $('<th>');
        th.html('Válasz');
        th.addClass('separatedtable');
        header.append(th);
        var nextr = $('#' + index);
        var anstd = $('<td>');
        anstd.html(value.answer + ' ' + value.time);
        anstd.addClass('separatedtable');
        nextr.append(anstd);
    });
});

function startProgressBar() {
    $('#progbar').css('display', 'block');
    $('#progbar').attr('value', 100);
    var decrease = function () {
        var current = $('#progbar').attr('value');
        if(current > 0) {
            $('#progbar').attr('value', current - 2);
            setTimeout(decrease, 100);
        } else {
            $('#progbar').css('display', 'none');
        }
    }
    setTimeout(decrease, 100);
}

function newQuestion() {
    //$('#newQuestion').attr('disabled', true);
    socket.emit('new');
}

function newGame() {
    socket.emit('gameover');
    if($('#bored').css('display') == 'block') {
        $('#bored').css('display', 'none');
    } else {
        $('#bored').css('display', 'block');
    }
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

function sendQuestion() {
    socket.emit('broadcast');
    startProgressBar();
}