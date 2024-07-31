const express = require('express');
const auth = require('../middleware/auth.js');
const booksController = require('../controllers/booksController.js');

const router = express.Router();

const multer = require('../middleware/multer-config.js');
const compressImage = require('../middleware/compressImage.js');

// Récupération de la liste des livres
router.get('/', booksController.getAllBooks);

// Récupération du meilleur rating
router.get('/bestrating', booksController.getBestRating);

// Récupération d'un livre spécifique
router.get('/:id', booksController.getOneBook);

// Ajout d'un livre
router.post('/', auth, multer, compressImage, booksController.createBook);

// Modification d'un livre
router.put('/:id', auth, multer, compressImage, booksController.modifyBook);

// Suppression d'un livre
router.delete('/:id', auth, booksController.deleteBook);

// Ajout d'un rating
router.post('/:id/rating', auth, booksController.addRating);

module.exports = router;
