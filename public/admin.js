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
    if($('#playerSelect').length !== 0) {    //admin and viewer respectively
        updatePlayerList(players, '#playerSelect', '<option>');
    } else {
        updatePlayerList(players, '#players', '<li>');
    }
});

socket.on('tables', function(scores) {
    $('#roundEnd').css('display', 'block');

    newElement('#header', '<th>', 'Jó válaszok száma');
    newElement('#header', '<th>', 'Eddigi qpapontok');

    roundEnd = true;
    var score;
    for(score of scores) {
        var nextr = $('#' + score.name);
        newElement('#' + score.name, '<td>', score.score.round);
        newElement('#' + score.name, '<td>', score.score.global);
    }
});

socket.on('last', function(player) {
    $('#lastPlayer').html(player);
});

socket.on('answers', function(answers) {
    if(roundEnd) {
        newElement('#header', '<th>', 'Játékos', {empty: true});
    }
    newElement('#header', '<th>', 'Válasz');
    $.each(answers, function(index, value) {
        if(makeTable) {
            var table = $('#playerrankings');
            var playertr = $('<tr>');
            playertr.attr('id', index);
            newElement(playertr, '<td>', index);
            table.append(playertr);
        }

        if(roundEnd) {
            newElement('#' + index, '<td>', index, {empty: true});
        }
        newElement('#' + index, '<td>', value.answer + ' ' + value.time);
    });
    makeTable = false;
    roundEnd = false;
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

function updatePlayerList(players, selector, element) {
    var playerSelect = $(selector);
    playerSelect.html('');
    var player;
    for(player of players) {
        var option = $(element);
        option.html(player);
        playerSelect.append(option);
    }
}

function newElement(parent, tag, html, options) {
        if(typeof parent === "string") {
            parent = $(parent);
        }
        if(options && options.empty) {
            parent.html('');
        }
        var anstd = $(tag);
        anstd.html(html);
        anstd.addClass('separatedtable');
        parent.append(anstd);
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

function sendPw(type) {
    var pw = $('#pw').val();
    $('#pw').val('');
    socket.emit(type, pw);
}

function sendQuestion() {
    socket.emit('broadcast');
    startProgressBar();
}