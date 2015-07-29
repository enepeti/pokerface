module.exports = function(mongoose) {
    var Schema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: function f() {
                return new mongoose.Types.ObjectId();
            }
        },
        question: {
            type: String
        },
        answers: {
            correct: {
                type: String
            },
            wrong1: {
                type: String
            },
            wrong2: {
                type: String
            }
        },
        asked: {
            type: Boolean
        }
    });

    Schema.statics.createOrUpdate = function(object, callback) {
        statics.upsert(this, object, callback);
    };

    var Model = mongoose.model('Question', Schema);

    return Model;
};
