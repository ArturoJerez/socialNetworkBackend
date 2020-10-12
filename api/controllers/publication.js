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

// Crea una nueva publicación de usuario
function save_publication(req, res) {
    var params = req.body;
    if(!params.text) return res.status(200).send({message: 'Debes enviar un texto!!'});

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment();

    publication.save((err, publication_saved) => {
        if(err) return res.status(500).send({nesage: 'Error al guardar la publicación'});
        if(!publication_saved) return res.status(404).send({nesage: 'La publicación no ha sido guardada'});
        return res.status(200).send({publication: publication_saved});
    });
}

// Listar todas las publicaciones
function get_publications(req, res) {
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    
    var items_per_page = 4;
    // Busca los usuarios que seguimos
    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error devolver el seguimiento'});
    
        var follows_clean = [];   
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);
    
        // Busca las publicaciones del usuario seguido
        Publication.find({user: {"$in": follows_clean}}).sort('-created_at').populate('user').paginate(page, items_per_page, (err, publications, total) => {
            if(err) return res.status(500).send({message: 'Error al devolver las publicaciones'});
            if(!publications) return res.status(404).send({message: 'No hay publicaciones'});
    
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/items_per_page),
                page: page,
                items_per_page: items_per_page,
                publications
            });
        });
    
    });
}

// Lista una publicación del usuario
function get_publication(req, res) {
    var publicationId = req.params.id;
    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error al devolver la publicacion'});
        if(!publication) return res.status(404).send({message: 'No hay ninguna publicacion'});
        return res.status(200).send({publication});
    })
}

// Elimina una publicación
function remove_publication(req, res) {
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id': publicationId}).deleteOne(err => {
        if(err) return res.status(500).send({message: 'Error al eliminar la publicacion'});
        return res.status(200).send({message: 'Publicación eliminada correctamente'});
    });
}

// Subir imagen/avatar del usuario
function upload_image(req, res) {
    var publicationId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path; // Ruta del archivo a subir
        var file_split = file_path.split('\\');
        var file_name = file_split[2]; // Nombre del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1]; // Extensión del archivo

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            Publication.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
                if(publication) {
                    // Actualizar documento de la publicación
                    Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publication_updated) => {
                        if(err) return res.status(500).send({message: 'Error en la petición'});
                        if(!publication_updated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                        return res.status(200).send({publication: publication_updated});
                    });
                } else {
                    return remove_files_uploaded(res, file_path, 'No tienes permisos para actualizar esta publicación');
                }
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
    var path_file = './uploads/publications/' + image_file;

    fs.exists(path_file, (exists) => {
        if(exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: 'No existe la imagen'});
        }
    })
}

module.exports = {
    probando,
    save_publication,
    get_publications,
    get_publication,
    remove_publication,
    upload_image,
    get_image_file
}