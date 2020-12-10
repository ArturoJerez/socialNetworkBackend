'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HobbieSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    namesHobbies: [String]
});

module.exports = mongoose.model('Hobbie', HobbieSchema);