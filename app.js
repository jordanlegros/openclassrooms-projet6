const express = require('express');
const mongoose = require('mongoose');
const app = express();

//import des routers
const booksRoute = require('./routes/booksRoute');
const usersRoute = require('./routes/usersRoute');

mongoose.connect('mongodb+srv://userOC:testpass1234@cluster0.8eszoca.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));




// Middleware CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Autorise uniquement localhost:3000
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
});



//intercepte le json pour le mettre en req.body
app.use(express.json());


app.use('/api/books', booksRoute);
app.use('/api/auth', usersRoute);




module.exports = app;