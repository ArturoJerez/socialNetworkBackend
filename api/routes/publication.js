'use strict'

// Cargar librerias
var express = require('express');
var multiparty = require('connect-multiparty');

// Cargar directorio de publicaciones
var md_upload = multiparty({uploadDir: './uploads/publications'});

// Cargar controlador
var PublicationController = require('../controllers/publication');

// Cargar punto de rutas
var api = express.Router();

// Cargar Middlewares
var md_auth = require('../middlewares/auth');

api.get('/probando-pub', md_auth.ensureAuth, PublicationController.probando);
api.post('/publication', md_auth.ensureAuth, PublicationController.save_publication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.get_publications);
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.get_publication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.remove_publication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.upload_image);
api.get('/get-image-pub/:image_file', PublicationController.get_image_file);

module.exports = api;