'use strict'

// Cargar Librerias
//var path = require('path');
//var fs = require('fs');
var mongoose_paginate = require('mongoose-pagination');

// Cargar Modelos
var User = require('../models/user');
var Follow = require('../models/follow');
const follow = require('../models/follow');

function save_follow(req, res) { // Agregar seguimiento a un usuario
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, follow_saved) => {
        if (err) return res.status(500).send({message:'Error al guardar el seguimiento'});
        if (!follow_saved) return res.status(404).send({message:'El seguimiento no se ha guardado'});
        return res.status(200).send({follow: follow_saved});
    });
}

function delete_follow(req, res) { // Eliminar seguimiento del usuario
    var userId = req.user.sub;
    var followId = req.params.id;
    
    Follow.find({'user': userId, 'followed': followId}).remove(err => {
        if (err) return res.status(500).send({message:'Error al dejar de seguir'});
        return res.status(200).send({message:'Se ha eliminado el seguimiento'});
    });
}

// Listar todos los usuarios seguidos
function get_following_users(req, res) {
    var userId = req.user.sub;
    if(req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var items_per_page = 4;
    Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, items_per_page, (err, follows, total) => {
        if (err) return res.status(500).send({message:'Error en el servidor'});
        if (!follows) return res.status(404).send({message:'No sigue a ningún usuario'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/items_per_page),
            follows
        });
    });
}

// Listar todos los usuarios que nos han seguido
function get_followed_users(req, res) {
    var userId = req.user.sub;
    if(req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var items_per_page = 4;
    Follow.find({followed: userId}).populate('user').paginate(page, items_per_page, (err, follows, total) => {
        if (err) return res.status(500).send({message:'Error en el servidor'});
        if (!follows) return res.status(404).send({message:'No te sigue ningún usuario'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/items_per_page),
            follows
        });
    });
}

// Devolver listado de usuarios
function get_all_follows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({user: userId}); // Recoger listado de usuarios que sigo
    if(req.params.followed) {
        find = Follow.find({followed: userId}); // Recoger listado de usuarios que me siguen
    }
    
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({message:'Error en el servidor'});
        if (!follows) return res.status(404).send({message:'No hay usuarios'});
        return res.status(200).send({follows});
    });
}

module.exports = {
    save_follow,
    delete_follow,
    get_following_users,
    get_followed_users,
    get_all_follows
}