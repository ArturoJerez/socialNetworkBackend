'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');
var api = express.Router();
var md_auth = require('../middlewares/auth');

api.post('/follow', md_auth.ensureAuth, FollowController.save_follow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.delete_follow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.get_following_users);
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.get_followed_users);
api.get('/follows/:followed?', md_auth.ensureAuth, FollowController.get_all_follows);

module.exports = api;