const express = require('express');
const mongoose = require('mongoose');
const app = express();


mongoose.connect('mongodb+srv://userOC:testpass1234@cluster0.8eszoca.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req,res,next) => {
    console.log('Requete reçue');
    next();
});

app.use((req,res,next) => {
    res.status(201);
    next();
})

app.use((req,res,next) => {
    res.json({message:'requete bien reçue'});
    next();
});


app.use((req,res) =>{
    console.log('Reponse envoyée avec succes');
});


module.exports = app;