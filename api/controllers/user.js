'use strict'

// Cargar Librerias
var bcrypt = require('bcrypt-nodejs'); // Cifra las contraseñas
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

// Cargar Modelos y Servicios
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
const { exists } = require('../models/user');
const { deprecate } = require('util');
const { relativeTimeRounding } = require('moment');

// Registro
function save_user(req, res) {
    var params = req.body;
    var user = new User();

    // Comprueba que recibe los datos del nuevo usuario
    if(params.name && params.surname && params.nick 
        && params.email && params.password) {
            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;
            user.hobbies = [];

            User.find({ $or: [ // Comprobar si ya existe un usuario con email o nick
                            {email: user.email.toLowerCase()},
                            {nick: user.nick.toLowerCase()}
                ]}).exec((err, users) => {
                    if(err) return res.status(500).send({message: 'Error en la petición de usuarios'});

                    if(users && users.length >= 1) {
                        return res.status(200).send({message: 'Ya existe un usuario con ese email o nick'});
                    } else { // Cifra la constraseña y guarda los datos
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            user.password = hash;

                            user.save((err, userSaved) => {
                                if(err) return res.status(500).send({message: 'Error al guardar el usuario'});

                                if(userSaved) {
                                    res.status(200).send({
                                        user: userSaved, 
                                        message: 'Nuevo usuario guardado correctamente'
                                    });
                                } else {
                                    res.status(400).send({message: 'No se ha podido registrar el usuario'});
                                }
                            });
                        });
                    }
                });

    } else {
        res.status(200).send({
            message: 'Falta parámetros por enviar'
        });
    }
}

// Login
function login_user(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500).send({message: 'Se ha producido un error en la petición'});

        if(user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if(check) {
                    // Devolver datos del usuario
                    if(params.gettoken) {
                        // Generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Devolver datos del usuario
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                } else {
                    return res.status(404).send({message: 'Identifiación del usuario fallida'});
                }
            });
        } else {
            return res.status(404).send({message: 'Identifiación del usuario fallida'});
        }
    });
}

function get_user(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });
        if (!user) return res.status(404).send({ message: 'El usuario no existe' });
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
 }
  
 async function followThisUser(identity_user_id, user_id) {
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id }).exec()
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id }).exec()
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });
    
        return {
            following: following,
            followed: followed
        };
    } catch (e) {
        console.log(e);
    }
 }

// Devuelve un listado de usuarios paginados
function get_users(req, res) {
    var user_id = req.user.sub;
     
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 8;
     
    User.find().sort('_id').paginate(page,itemsPerPage,(err,users,total)=>{
        if(err) return res.status(500).send({message:"Error en la peticion",err});
        if(!users) return res.status(404).send({message:"No hay Usuarios"});
     
        follow_users_ids(user_id).then((response)=>{
            return res.status(200).send({
                users, 
                users_following: response.following, 
                users_followed: response.followed, 
                total, 
                pages: Math.ceil(total/itemsPerPage)
            });
        });
    });
}
     
async function follow_users_ids(user_id) {
    var following = await Follow.find({'user': user_id}).select({'_id': 0, '__v': 0, 'user': 0}).exec()
        .then((follows) => {
            return follows;
        })
        .catch((err) => {
            return handleError(err);
        });
    
    var followed = await Follow.find({followed: user_id}).select({'_id': 0, '__v': 0, 'followed': 0}).exec()
        .then((follows) => {
            return follows;
        })
        .catch((err) => {
            return handleError(err);
        });
     
    var following_clean = [];
     
    following.forEach((follow)=>{
        following_clean.push(follow.followed);
    });
    var followed_clean = [];
     
    followed.forEach((follow)=>{
        followed_clean.push(follow.user);
    });

    return {
        following: following_clean,
        followed:followed_clean}
}

function get_counters(req, res) {
    var userId = req.user.sub;
    if(req.params.id) {
        userId = req.params.id;
    }
    
    get_count_follows(userId).then((value) => {
        return res.status(200).send(value);
    });
}

async function get_count_follows(user_id) {
    var following = await Follow.countDocuments({"user": user_id}).exec()
    .then((count) => {
        return count;
    })
    .catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.countDocuments({"followed": user_id}).exec()
    .then((count) => {
        return count;
    })
    .catch((err) => {
        return handleError(err);
    });

    var publications = await Publication.countDocuments({"user": user_id}).exec()
    .then((count) => {
        return count;
    })
    .catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

// Modificar datos del usuario
function update_user(req, res) {
    var userId = req.params.id;
    var update = req.body;

    // Borrar la propiedad password
    delete update.password;

    if(userId != req.user.sub) {
        return res.status(500).send({message: 'No tienes permisos para actualizar los datos del usuario'});
    }

    User.find({ $or: [ // Comprobar si ya existe un usuario con email o nick
        {email: update.email.toLowerCase()},
        {nick: update.nick.toLowerCase()}
    ]}).exec((err, users) => {
        console.log(users);
        var user_isset = false;
        users.forEach((user) => {
            if(user && user._id != userId) user_isset = true;
        });

        if(user_isset) return res.status(404).send({message: 'Los datos ya estan en uso'});

        User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});
            if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
            return res.status(200).send({user: userUpdated});
        });
    });

}

// Subir imagen/avatar del usuario
function upload_image(req, res) {
    var userId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[2]; // Nombre del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1]; // Extensión del archivo

        if(userId != req.user.sub) {
            return remove_files_uploaded(res, file_path, 'No tienes permisos para subir una imagen');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // Actualizar documento de usuario logueado
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, user_updated) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
                if(!user_updated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                return res.status(200).send({user: user_updated});
            });
        } else {
            return remove_files_uploaded(res, file_path, 'Extensión no válida');
        }
    } else {
        return res.status(500).send({message: 'No se ha subido niguna imagen'});
    }
}

// Eliminar archivos sin coincidencia en la extensión
function remove_files_uploaded(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

function get_image_file(req, res) {
    var image_file = req.params.image_file;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if(exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    })
}


module.exports = {
    save_user,
    login_user,
    get_user,
    get_users,
    update_user,
    upload_image,
    get_image_file,
    get_counters
}