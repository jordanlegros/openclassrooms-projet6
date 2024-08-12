const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
require('dotenv').config();

//import des routers
const booksRoute = require('./routes/booksRoute');
const usersRoute = require('./routes/usersRoute');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


// Middleware de journalisation des requêtes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Autorise uniquement localhost:3000
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
});



//intercepte le json pour le mettre en req.body, on parse le json en objet javascript accessible via req.body
app.use(express.json());

//définition des routes
app.use('/api/books', booksRoute);
app.use('/api/auth', usersRoute);
app.use('/images', express.static(path.join(__dirname, 'images')));




module.exports = app;