var _ = require('lodash');

exports.newGame = function (dal, config) {
    var _game = require('./game');
    var game = new _game(dal);

    var players = {};
    var currentAnswers = [];
    var admin = {};
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
        game.newAnswers(currentAnswers, correct);
    }

    io.on('connection', function(socket){
        console.log("User connected");
        players[socket.id] = socket;
        socket.on('username', function (msg) {
            players[socket.id].username = msg;
        });
        socket.on('answer', function (msg) {
            if(!currentAnswers[socket.id] && timer != 0) {
                currentAnswers[socket.id] = {answer: msg, time: Date.now().getTime() - timer.getTime()};
            }
        });
        socket.on('admin', function (msg) {
            if(msg === 'bfb4dm1n') {
                console.log("Admin on board!");
                delete players[socket.id];
                admin = socket;
            }
        });
        socket.on('new', function (msg) {
            if(admin.id == socket.id) {
                game.getQuestion().then(function (q) {
                    var res = {question: q.question, answers: _.shuffle([q.answers.correct, q.answers.wrong1, q.answers.wrong2])};
                    correct = _.findIndex(res.answers, q.answers.correct);
                    console.log("Sending question to every player");
                    io.emit('question', res);
                    timer = Date.now();
                    setTimeout(clearTimer, config.timeout);
                });
            }
        });
    });
}