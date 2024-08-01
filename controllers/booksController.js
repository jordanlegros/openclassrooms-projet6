const Book = require('../models/Book');
const fs = require('fs');


//Controleur pour renvoyer un livre
exports.getOneBook = (req, res, next) => {
    console.log(`Tentative de récupération du livre avec ID: ${req.params.id}`);
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book) {
                console.log(`Livre récupéré: ${book._id}`);
                res.status(200).json(book);
            } else {
                // Livre non trouvé
                console.log('Livre non trouvé');
                res.status(404).json({ message: "Livre non trouvé" });
            }
        })
        .catch(error => {
            // Erreur interne du serveur
            console.log(`Erreur de récupération du livre: ${error}`);
            res.status(500).json({ message: "Erreur interne du serveur", error });
        });
};


//Contrôleur pour récupérer tout les livres de la base
exports.getAllBooks = (req, res, next) => {
    console.log('Tentative de récupération de tous les livres');
    
    Book.find()
        .then(books => {
            if (books.length === 0) {
                // Si aucun livre n'est trouvé, renvoyer une réponse 404
                console.log('Aucun livre trouvé');
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            }

            console.log('Liste de tous les livres récupérée');
            res.status(200).json(books);
        })
        .catch(error => {
            // En cas d'erreur lors de la récupération des livres
            console.log(`Erreur de récupération des livres: ${error}`);
            res.status(500).json({ message: "Erreur interne du serveur", error });
        });
};


//Controleur pour récupérer tout les livres de la base
exports.getBestRating = (req, res, next) => {
    console.log('Tentative de récupération des livres avec les meilleures notes');

    // Trouver tous les livres
    Book.find()
        .then(books => {
            if (books.length === 0) {
                // Si aucun livre n'est trouvé, renvoyer une erreur 404
                console.log('Aucun livre trouvé');
                return res.status(404).json({ message: 'Aucun livre trouvé' });
            }

            // Calculer la note moyenne pour chaque livre
            books = books.map(book => {
                // Assurez-vous que les notes sont définies et calculer la moyenne
                const averageRating = book.ratings && book.ratings.length > 0
                    ? book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length
                    : 0;

                return { ...book._doc, averageRating }; // Ajouter la note moyenne à chaque livre
            });

            // Trier les livres par note moyenne décroissante
            books.sort((a, b) => b.averageRating - a.averageRating);

            // Limiter les résultats aux 3 meilleurs livres
            const topBooks = books.slice(0, 3);

            console.log('Liste des livres avec les meilleures notes récupérée');
            res.status(200).json(topBooks);
        })
        .catch(error => {
            // En cas d'erreur lors de la récupération des livres
            console.log(`Erreur de récupération des livres avec les meilleures notes: ${error}`);
            res.status(500).json({ message: 'Erreur interne du serveur', error });
        });
};

//Contrôleur pour ajouter un livre dans la base
exports.createBook = (req, res, next) => {
    try {
        console.log('Tentative de création d\'un nouveau livre');

        // Vérification de la présence des données du livre
        if (!req.body.book) {
            console.log('Aucune donnée "book" reçue dans la requête');
            return res.status(400).json({ message: 'Aucune donnée "book" reçue' });
        }

        const bookObject = JSON.parse(req.body.book);

        // Vérification du contenu du bookObject
        if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre) {
            console.log('Données du livre incomplètes');
            return res.status(400).json({ message: 'Données du livre incomplètes' });
        }

        // Suppression des champs inutiles
        delete bookObject._id;
        delete bookObject._userId;

        // Vérification de la présence du fichier image
        if (!req.file) {
            console.log('Aucun fichier image reçu dans la requête');
            return res.status(400).json({ message: 'Aucun fichier image reçu' });
        }

        // Vérification des informations d'authentification
        if (!req.auth || !req.auth.userId) {
            console.log('Informations d\'authentification manquantes');
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        // Création de l'objet Book
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        // Enregistrement du livre
        book.save()
            .then(() => {
                console.log(`Livre créé : ${book._id}`);
                res.status(201).json({ message: 'Objet enregistré !' });
            })
            .catch(error => {
                console.log(`Erreur de création du livre: ${error}`);
                res.status(400).json({ error });
            });
    } catch (error) {
        console.log(`Erreur lors du traitement de la requête: ${error}`);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};


//Contrôleur pour modifier un livre dans la base
exports.modifyBook = (req, res, next) => {
    console.log(`Tentative de modification du livre avec ID: ${req.params.id}`);
    
    // Vérifier si un fichier image est fourni
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                console.log('Modification non autorisée');
                res.status(403).json({ message: "Accès non autorisé" });
            } else {
                // Si une nouvelle image est téléchargée, supprimer l'ancienne image
                if (req.file) {
                    const oldFilename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${oldFilename}`, (err) => {
                        if (err) console.log(`Erreur de suppression de l'ancienne image: ${err}`);
                        else console.log(`Ancienne image supprimée: ${oldFilename}`);
                    });
                }

                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        console.log(`Livre modifié: ${req.params.id}`);
                        res.status(200).json({ message: 'Objet modifié' });
                    })
                    .catch(error => {
                        console.log(`Erreur de modification du livre: ${error}`);
                        res.status(401).json({ error });
                    });
            }
        })
        .catch((error) => {
            console.log(`Erreur de recherche du livre pour modification: ${error}`);
            res.status(500).json({ error });
        });
};

//Contrôleur pour supprimer un livre dans la base
exports.deleteBook = (req, res, next) => {
    console.log(`Tentative de suppression du livre avec ID: ${req.params.id}`);
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                console.log('Suppression non autorisée');
                res.status(403).json({ message: 'Accès non autorisé' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            console.log(`Livre supprimé: ${req.params.id}`);
                            res.status(200).json({ message: "Objet supprimé" });
                        })
                        .catch(error => {
                            console.log(`Erreur de suppression du livre: ${error}`);
                            res.status(401).json({ error });
                        });
                });
            }
        })
        .catch(error => {
            console.log(`Erreur de recherche du livre pour suppression: ${error}`);
            res.status(500).json({ error });
        });
};

//Contrôleur pour ajouter une note à un livre
exports.addRating = (req, res, next) => {
    const grade  = req.body.rating;
    const userId = req.auth.userId;
    const bookId = req.params.id;

    console.log("grade : " + grade + " userId : " + userId + " bookId : " + bookId);

    console.log(`Tentative d'ajout d'une note pour le livre avec ID: ${bookId} par l'utilisateur: ${userId}`);

    if (!userId) {
        console.log('Utilisateur non authentifié');
        return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (grade < 0 || grade > 5) {
        console.log('Note invalide');
        return res.status(400).json({ message: "Le grade doit être compris entre 0 et 5" });
    }

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                console.log('Livre non trouvé pour ajouter une note');
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            // Vérifie si l'utilisateur a déjà noté ce livre
            const existingRating = book.ratings.find(rating => rating.userId === userId);

            if (existingRating) {
                console.log('Note déjà existante pour cet utilisateur');
                return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
            }

            // Ajoute le nouveau rating
            const newRating = {
                userId: userId,
                grade: grade
            };
            book.ratings.push(newRating);

            // Calcule la nouvelle moyenne des ratings
            const totalRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;

            // Sauvegarde le livre avec le nouveau rating
            book.save()
                .then((updatedBook) => {
                    console.log(`Note ajoutée au livre: ${bookId} par utilisateur: ${userId}`);
                    
                    
                    return res.status(201).json(updatedBook);
                })
                .catch(error => {
                    console.log(`Erreur d'ajout de la note: ${error}`);
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            console.log(`Erreur de recherche du livre pour ajouter une note: ${error}`);
            res.status(500).json({ error });
        });
};
