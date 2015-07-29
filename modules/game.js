var Q = require('q');

module.exports = function (dal) {

    this.answers = [];

    this.getQuestion = function () {
        var deferred = Q.defer();
        function ranodmize (count, asked) {
            var number = Math.floor(Math.random() * count);
            dal.Question.find({asked: asked}).limit(-1).skip(number).exec(function (err, doc) {
                if(doc.count === 1) {
                    dal.Question.update({_id: doc._id}, {asked: true}, function (err) {
                        if(err) {
                            console.log(err);
                        }
                    });
                    deferred.resolve(doc[0]);
                } else {
                    deferred.fail();
                }
            });
        };
        dal.Question.count({asked: false}, function (err, doc) {
            if(doc == 0) {
                dal.Question.count({asked: true}, function (err, doc) {
                    ranodmize(doc, true);
                });
            } else {
                ranodmize(doc, false);
            }
        });
        return deferred.promise;
    };

    this.newAnswers = function (answers, correct) {

    };

    this.closeRound = function () {

    };

    this.num2char = function (num) {
        return num == 0 ? 'a' : (num == 1 ? 'b' : 'c');
    }
};