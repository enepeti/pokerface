var Q = require('q');
var _ = require('lodash');

module.exports = function (dal, config) {

    var roundPoints = {};
    var averageTime = {};
    var globalPoints = {};
    var questionCounter = 0;
    var roundCounter = 0;
    var roundStart = true;

    this.getQuestion = function () {
        var deferred = Q.defer();
        dal.Question.find({asked: false}).sort({position: 1}).limit(-1).exec(function (err, doc) {
            if(err) {
                console.log("DB error during question randomization");
            } else {
                if(doc.length > 0) {
                    dal.Question.update({_id: doc[0]._id}, {asked: true}, function (err) { });
                    deferred.resolve(doc[0]);
                } else {
                    dal.Question.findOne(function (err, doc) {
                        console.log(doc);
                        deferred.resolve(doc);
                    });
                }
            }
        });
        return deferred.promise;
    };

    this.newAnswers = function (answers, correct) {
        console.log('Counting answers');
        if(roundStart) {
            roundPoints = {};
            averageTime = {};
            roundStart = false;
        }
        var numsave = this.num2char;
        _.forEach(answers, function (ans, id) {
            if(!averageTime[id]) {
                averageTime[id] = 0;
            }
            if(!roundPoints[id]) {
                roundPoints[id] = 0;
            }
            if(ans.answer == numsave(correct)) {
                averageTime[id] = (averageTime[id] * roundPoints[id] + ans.time) / (roundPoints[id] + 1);
                roundPoints[id] += 1;
            }
        });
        questionCounter++;
        if(questionCounter == config.questionCounts[roundCounter]) {
            return this.closeRound();
        }
        return false;
    };

    this.closeRound = function () {
        console.log("Closing round");
        questionCounter = 0;
        roundCounter++;
        _.forEach(roundPoints, function (rp, id) {
            if(!globalPoints[id]) {
                globalPoints[id] = 0;
            }
            globalPoints[id] += config.weights[roundCounter] * rp;
        });
        roundStart = true;
        return {round: roundPoints, global: globalPoints};
    }

    this.persistPoints = function (name, id) {
        new dal.Point({name: name, point: globalPoints[id]}).save();
    }

    this.last = function () {
        console.log("Counting last player");
        var lastPoints = 100;
        var lastId = 0;
        for(var id in roundPoints) {
            if(roundPoints[id] < lastPoints) {
                lastPoints = roundPoints[id];
                lastId = id;
            } else if(roundPoints[id] == lastPoints) {
                if(globalPoints[id] < globalPoints[lastId]) {
                    lastPoints = roundPoints[id];
                    lastId = id;
                } else if(globalPoints[id] == globalPoints[lastId]) {
                    if(averageTime[id] > averageTime[lastId]) {
                        lastPoints = roundPoints[id];
                        lastId = id;
                    }
                }
            }
        }
        return lastId;
    }

    this.updateId = function (oldId, newId) {
        globalPoints[newId] = globalPoints[oldId];
        delete globalPoints[oldId];
        averageTime[newId] = averageTime[oldId];
        delete averageTime[oldId];
        roundPoints[newId] = roundPoints[oldId];
        delete roundPoints[oldId];
    }

    this.num2char = function (num) {
        return num == 0 ? 'a' : (num == 1 ? 'b' : 'c');
    }
};