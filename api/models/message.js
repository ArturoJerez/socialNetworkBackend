'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = ({
    text: String,
    viewed: String,
    created_at: String,
    emitter: { type: Schema.ObjectId, ref: 'User' }, // Usuario emisor
    receiver: { type: Schema.ObjectId, ref: 'User' } // Usuario receptor
});

module.exports = mongoose.model('Message', MessageSchema);