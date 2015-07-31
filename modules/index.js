var _ = require('lodash');

exports.newGame = function (dal, config) {
    var _game = require('./game');
    var game = new _game(dal, config);

    var players = {};
    var currentAnswers = {};
    var admin = false;
    var correct = 0;
    var timer = 0;

    function clearTimer() {
        timer = 0;
        _.forEach(players, function (user, id) {
            if(!currentAnswers[id]) {
                currentAnswers[id] = {answer: 'none', time: 0};
            }
        });
        io.emit('correct', game.num2char(correct));
        var roundEnd = game.newAnswers(currentAnswers, correct);
        if(roundEnd) {
            console.log("Round closed, sending points");
            var tables = [];
            for(var id in roundEnd) {
                players[id].emit('score', roundEnd[id]);
                tables.push({name: players[id].username, score: roundEnd[id]});
            }
            admin.emit('tables', tables);
        }
    }

    function emitNames() {
        if(admin) {
            var names = [];
            _.forEach(players, function (player, id) {
                if(player.username  ) {
                    names.push(player.username);
                }
            });
            console.log("Actual players: " + names);
            admin.emit('players', names);
        }
    }

    function dropPlayer(msg, doPersist) {
        _.forEach(players, function (player, id) {
            if(player.username == msg) {
                if(doPersist) {
                    game.persistPoints(players[id].username, id);
                }
                players[id].disconnect();
                delete players[id];
                return;
            }
        })
        emitNames();
    }

    io.on('connection', function(socket) {  //TODO: disconnect handling
        console.log("User connected");
        players[socket.id] = socket;
        socket.on('username', function (msg) {
            players[socket.id].username = msg;
            emitNames();
        });
        socket.on('answer', function (msg) {
            if(!currentAnswers[socket.id] && timer != 0) {
                currentAnswers[socket.id] = {answer: msg, time: Date.now() - timer};
            }
        });
        socket.on('admin', function (msg) {
            if(msg === 'a') {
                console.log("Admin on board!");
                delete players[socket.id];
                admin = socket;
            }
        });
        socket.on('new', function (msg) {
            if(admin.id == socket.id) {
                console.log("New question request");
                currentAnswers = {};
                game.getQuestion().then(function (q) {
                    console.log("Question randomized");
                    var res = {question: q.question, answers: _.shuffle([q.answers.correct, q.answers.wrong1, q.answers.wrong2])};
                    correct = _.findIndex(res.answers, function (str) {
                        return str == q.answers.correct;
                    });
                    console.log("Sending question to every player");
                    io.emit('question', res);
                    timer = Date.now();
                    setTimeout(clearTimer, config.timeout);
                });
            }
        });
        socket.on('drop', function (msg) {
            if(admin.id == socket.id) {
                console.log("Dropping player: " + msg);
                dropPlayer(msg, true);
            }
        });
        socket.on('autodrop', function (msg) {
             if(admin.id == socket.id) {
                console.log("Autodrop requested");
                dropPlayer(players[game.last()].username, false);
            }
        });
    });
}