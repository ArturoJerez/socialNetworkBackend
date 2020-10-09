//carga la librería express
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Cargar rutas


// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS

// Rutas
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hola Mundo desde la raíz'
    })
})

app.get('/pruebas', (req, res) => {
    res.status(200).send({
        message: 'Acción de pruebas'
    })
})

//exportar
module.exports = app;