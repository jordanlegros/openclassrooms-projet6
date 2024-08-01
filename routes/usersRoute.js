const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');


//ajout d'un utilisateur dans la base
router.post('/signup', usersController.signup);

//route d'identification
router.post('/login', usersController.login);

module.exports = router;