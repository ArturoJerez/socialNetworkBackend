'use strict'

// Cargar librerias
var moment = require('moment');
var mongoose_paginate = require('mongoose-pagination');

// Cargar Modelos
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function probando(req, res) {
    res.status(200).send({message: 'Hola desde modelo message'});
}

// Crea y envía un mensaje a un usuario
function save_message(req, res) {
    var params = req.body;
    if(!params.text || !params.receiver) {
        res.status(200).send({message: 'Faltan datos'});
    }

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, message_saved) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!message_saved) return res.status(404).send({message: 'Error al enviar el mensaje'});
        return res.status(200).send({message: message_saved});
    });
}

// Lista los mensajes recibidos de un usuario
function get_received_messages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    }

    var items_per_page = 4;
    Message.find({receiver: userId}).populate('emitter', 'name surname _id nick image').paginate(page, items_per_page, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});
        return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total/items_per_page),
            page: page,
            messages
        });
    });
}

// Lista los mensajes enviados por un usuario
function get_emitted_messages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    }

    var items_per_page = 4;
    Message.find({emitter: userId}).populate('emitter receiver', 'name surname _id nick image').paginate(page, items_per_page, (err, messages, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!messages) return res.status(404).send({message: 'No hay mensajes'});
        return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total/items_per_page),
            page: page,
            messages
        });
    });
}

// Lista la cantidad de mensajes sin leer
function get_unviewed_messages(req, res) {
    var userId = req.user.sub;
    Message.count({receiver: userId, viewed: 'false'}).exec()
    .then((count) => {
        return res.status(200).send({
            'unviewed': count
        });
    })
    .catch((err) => {
        return handleError(err);
    });
}

function set_viewed_messages(req, res) {
    var userId = req.user.sub;

    Message.update({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {"multi": true}, (err, message_updated) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        return res.status(200).send({
            messages: message_updated
        })
    })
}

module.exports = {
    probando,
    save_message,
    get_received_messages,
    get_emitted_messages,
    get_unviewed_messages,
    set_viewed_messages
}
