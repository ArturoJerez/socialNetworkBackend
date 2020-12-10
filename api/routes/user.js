'use strict'

// Cargar Librerias
var express = require('express');
var UserController = require('../controllers/user');
var HobbieController = require('../controllers/hobbie');

var api = express.Router();
var md_auth = require('../middlewares/auth');
var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/users'});

// USUARIO
api.post('/register', UserController.save_user);
api.post('/login', UserController.login_user);
api.get('/user/:id', md_auth.ensureAuth, UserController.get_user);
api.get('/users/:page?', md_auth.ensureAuth, UserController.get_users);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.update_user);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.upload_image);
api.get('/get-image-user/:image_file', UserController.get_image_file);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.get_counters);

// HOBBIES DE USUARIO
api.post('/save-hobbies', md_auth.ensureAuth, HobbieController.save_hobbies_user);

module.exports = api;