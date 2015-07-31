module.exports = function(mongoose) {
    var Schema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: function f() {
                return new mongoose.Types.ObjectId();
            }
        },
        name: {
            type: String
        },
        point: {
            type: Number
        }
    });

    Schema.statics.createOrUpdate = function(object, callback) {
        statics.upsert(this, object, callback);
    };

    var Model = mongoose.model('Point', Schema);

    return Model;
};
