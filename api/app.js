//carga la librería express
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Cargar rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS

// Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes)
app.use('/api', publication_routes)

//exportar
module.exports = app;