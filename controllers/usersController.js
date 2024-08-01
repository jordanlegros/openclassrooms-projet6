const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//Contrôleur pour ajouter un utilisateur à la base
exports.signup = (req, res, next) => {
    console.log('Tentative de création d\'un nouvel utilisateur');
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => {
                    console.log(`Utilisateur créé : ${user.email}`);
                    res.status(201).json({ message: 'Utilisateur créé' });
                })
                .catch(error => {
                    console.log(`Erreur lors de la création de l'utilisateur : ${error}`);
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            console.log(`Erreur lors du hash du mot de passe : ${error}`);
            res.status(500).json({ error });
        });
};



//Contrôleur pour s'identifier
exports.login = (req, res, next) => {
    console.log('Tentative de connexion pour l\'email :', req.body.email);
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user === null) {
                console.log('Utilisateur non trouvé');
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            console.log('Mot de passe incorrect pour l\'utilisateur :', req.body.email);
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else {
                            console.log('Connexion réussie pour l\'utilisateur :', req.body.email);
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.SECRET_KEY,
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => {
                        console.log(`Erreur lors de la comparaison des mots de passe : ${error}`);
                        res.status(500).json({ error });
                    });
            }
        })
        .catch(error => {
            console.log(`Erreur lors de la recherche de l'utilisateur : ${error}`);
            res.status(500).json({ error });
        });
};
