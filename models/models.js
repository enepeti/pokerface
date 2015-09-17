/* Create models from schemas. */

var _question = require('./question');
var _point = require('./point');

module.exports = function(mongoose) {
    _question(mongoose);
    _point(mongoose);
};
