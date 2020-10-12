'use strict'

// Cargar librerias
var express = require('express');

// Cargar Controlador
var MessageController = require('../controllers/message');

// Cargar controlador de rutas
var api = express.Router();

// Cargar Middlewares
var md_auth = require('../middlewares/auth');

api.get('/probando-md', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.save_message);
api.get('/messages-receiver/:page?', md_auth.ensureAuth, MessageController.get_received_messages);
api.get('/messages-emitter/:page?', md_auth.ensureAuth, MessageController.get_emitted_messages);
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.get_unviewed_messages);
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.set_viewed_messages);

module.exports = api;