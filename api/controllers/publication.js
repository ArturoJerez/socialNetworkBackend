'use strict'

/**
 * PUBLICACIONES
 * 
 * Nos permite crear, ver, modificar y eliminar publicaciones de los usuarios
 */

 var path = require('path');
 var fs = require('fs');
 var moment = require('moment');
 var mongoosePaginate = require('mongoose-pagination');

 var Publication = require('../models/publication');
 var User = require('../models/user');
 var Follow = require('../models/follow');

 function probando(req, res) {
     res.status(200).send({
         message: 'Hola desde publicaciones'
     });
 }

 module.exports = {
     probando
 }