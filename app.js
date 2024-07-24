const express = require('express');
const mongoose = require('mongoose');
const app = express();

//import des models
const User = require('./models/User');
const Book = require('./models/Book');
const Product = require ('./models/Product');

mongoose.connect('mongodb+srv://userOC:testpass1234@cluster0.8eszoca.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//intercepte le json pour le mettre en req.body
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//récupération de la liste des livres
app.get('/api/books', (req,res,next) =>{
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}));
});

//récupération d'un livre spécifique
app.get('/api/books/:id', (req,res,next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({error}));
});

//Ajout d'un livre
app.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const book = new Book({
      ...req.body
    });
    book.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  });

//modification d'un livre
app.put('/api/books/:id', (req,res,next) => {
    Book.updateOne({_id: req.params.id}, {...req.body, _id :req.params.id})
    .then(book =>res.status(200).json({book}))
    .catch(error => res.status(400).json({error}));
});

//suppression d'un livre
app.delete('/api/books/:id', (req,res,next) => {
    Book.deleteOne({_id:req.params.id})
    .then(() => res.status(200).json({message : 'Objet supprimé'}))
    .catch(error => res.status(400).json({error}));
});





module.exports = app;