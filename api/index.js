//cargar el servicio de mongoose para la base de datos
var mongoose = require('mongoose');
var app = require('./app');

// Conexión DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social_network', { useMongoClient: true })
    .then(() => {
        console.log("La conexión a la base de datos social_network se ha realizado correctamente.")

        // Crear servidor
        app.listen(3800, () => console.log("Servidor corriendo en http://localhost:3800"));
    })
    .catch(err => console.log(err));