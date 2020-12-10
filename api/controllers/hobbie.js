'use strict'

// Cargar Modelos y Servicios
var Hobbie = require('../models/hobbie');

// Registrar hobbies del usuario al acceder a la aplicación
function save_hobbies_user(req, res) {
    var params = req.body;
    const names = ['Libros', 'Peliculas', 'Series', 'Juegos', 'Arte', 'Historia'];
    var hobbies = new Hobbie();
    hobbies.user = req.user.sub;
    const hobbie = [params.namesHobbies];
    hobbies.namesHobbies = hobbie.values();

    // Comprueba que recibe los datos de los hobbies del usuario
    if(hobbie != names.includes(hobbie.length - 1)) {
        res.status(400).send({message: 'No es un campo válido'});
    } else {
        hobbies.save((err, hobbiesSaved) => {
            if(err) return res.status(500).send({message: 'Error al guardar el/los hobbie/s'});
    
            if(hobbiesSaved) {
                res.status(200).send({
                    namesHobbies: [hobbiesSaved], 
                    message: 'Hobbies añadidos'
                });
            } else {
                res.status(400).send({message: 'No se ha podido registrar el/los hobbie/s'});
            }
        });
    }
}

module.exports = {
    save_hobbies_user
}