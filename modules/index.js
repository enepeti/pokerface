var _ = require('lodash');

exports.newGame = function (dal, config) {
    var _game = require('./game');
    var game = new _game(dal, config);

    var players = {};
    var currentAnswers = {};
    var currentQuestion;
    var admin = false;
    var viewer = false;
    var correct = 0;
    var timer = 0;

    function toAdmin(msg, payload) {
        if(admin) {
            admin.emit(msg, payload);
        }
        if(viewer) {
            viewer.emit(msg, payload);
        }
    }

    function clearTimer() {
        timer = 0;
        var adminAnswers = {};
        _.forEach(players, function (user, id) {
            if(!currentAnswers[id]) {
                currentAnswers[id] = {answer: 'none', time: 0};
            }
            adminAnswers[user.username] = currentAnswers[id];
        });
        io.emit('correct', game.num2char(correct));
        console.log(adminAnswers);
        toAdmin('answers', adminAnswers);
        var roundEnd = game.newAnswers(currentAnswers, correct);
        if(roundEnd) {
            console.log("Round closed, sending points");
            var tables = [];
            for(var id in roundEnd.round) {
                players[id].emit('score', {round: roundEnd.round[id], global: roundEnd.global[id]});
                tables.push({name: players[id].username, score: {round: roundEnd.round[id], global: roundEnd.global[id]}});
            }
            toAdmin('tables', tables);
            console.log(tables);
        }
    }

    function emitNames() {
        if(admin) {
            var names = [];
            _.forEach(players, function (player, id) {
                if(!player.disconnected) {
                    names.push(player.username);
                }
            });
            console.log("Actual players: " + names);
            toAdmin('players', names);
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
        });
        emitNames();
    }

    function registerPlayer(socket, name) {
        _.forEach(players, function (element, id) {
            if(element.username == name && element.disconnected) {
                console.log("Reconnect: " + name);
                game.updateId(id, socket.id);
                players[socket.id] = socket;
                players[socket.id].username = name;
                delete players[id];
                return;
            }
        });
        if(!players[socket.id]) {
            console.log("New user: " + name);
            players[socket.id] = socket;
            players[socket.id].username = name;
        }
    }

    io.on('connection', function(socket) {
        console.log("User connected");
        socket.on('username', function (msg) {
            registerPlayer(socket, msg);
            emitNames();
        });
        socket.on('disconnect', function (msg) {
            console.log("User disconnected!");
            if(players[socket.id]) {
                players[socket.id].disconnected = true;
                emitNames();
            }
        });
        socket.on('answer', function (msg) {
            if(!currentAnswers[socket.id] && timer != 0) {
                currentAnswers[socket.id] = {answer: msg, time: Date.now() - timer};
            }
        });
        socket.on('admin', function (msg) {
            if(msg === config.adminPass) {
                console.log("Admin on board!");
                admin = socket;
                emitNames();
            }
        });
        socket.on('new', function (msg) {
            if(admin.id == socket.id) {
                console.log("New question request");
                currentAnswers = {};
                game.getQuestion().then(function (q) {
                    console.log("Question randomized");
                    console.log(q);
                    var res = {question: q.question, answers: q.answers};
                    correct = String.fromCharCode('a'.charCodeAt(0) + q.correct);
                    currentQuestion = res;
                    console.log("Sending question to admin");
                    toAdmin('question', res);
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
                var lastName = players[game.last()].username;
                dropPlayer(lastName, false);
                admin.emit('last', lastName);
            }
        });
        socket.on('broadcast', function (msg) {
            if(admin.id == socket.id) {
                console.log("Sending question to players");
                io.emit('question', currentQuestion);
                timer = Date.now();
                setTimeout(clearTimer, config.timeout);
            }
        });
        socket.on('viewer', function (msg) {
            if(msg == config.viewerPass) {
                viewer = socket;
                console.log("Viewer connected");
            }
        });
    });
}