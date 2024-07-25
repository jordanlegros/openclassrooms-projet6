const express = require('express');
const auth = require('../middleware/auth.js');
const booksController = require('../controllers/booksController.js');

const router = express.Router();



//récupération de la liste des livres
router.get('/', booksController.getAllBooks);

//récupération d'un livre spécifique
router.get('/:id', booksController.getOneBook);

//Ajout d'un livre
router.post('/',auth, booksController.createBook);

//modification d'un livre
router.put('/:id',auth, booksController.modifyBook);

//suppression d'un livre
router.delete('/:id', auth, booksController.deleteBook);

module.exports = router;