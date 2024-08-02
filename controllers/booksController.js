const Book = require('../models/Book');
const fs = require('fs');


//Controleur pour renvoyer un livre
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book) {
                res.status(200).json(book);
            } else {
                // Livre non trouvé
                res.status(404).json({ message: "Book not found" });
            }
        })
        .catch(error => {
            // Erreur interne du serveur
            res.status(500).json({ message: "Internal server error", error });
        });
};


//Contrôleur pour récupérer tout les livres de la base
exports.getAllBooks = (req, res, next) => {
    
    Book.find()
        .then(books => {
            if (books.length === 0) {
                // Si aucun livre n'est trouvé, renvoyer une réponse 404
                return res.status(404).json({ message: 'Book not found' });
            }

            res.status(200).json(books);
        })
        .catch(error => {
            // En cas d'erreur lors de la récupération des livres
            res.status(500).json({ message: "Internal server error", error });
        });
};


//Controleur pour récupérer tout les livres de la base
exports.getBestRating = (req, res, next) => {


    // Trouver tous les livres
    Book.find()
        .then(books => {
            if (books.length === 0) {
                // Si aucun livre n'est trouvé, renvoyer une erreur 404
                return res.status(404).json({ message: 'Book not found' });
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
            res.status(200).json(topBooks);
        })
        .catch(error => {
            // En cas d'erreur lors de la récupération des livres
            res.status(500).json({ message: 'Internal server error', error });
        });
};

//Contrôleur pour ajouter un livre dans la base
exports.createBook = (req, res, next) => {
    try {
        // Vérification de la présence des données du livre
        if (!req.body.book) {
            return res.status(400).json({ message: 'No book data received' });
        }

        const bookObject = JSON.parse(req.body.book);

        // Vérification du contenu du bookObject
        if (!bookObject.title || !bookObject.author || !bookObject.year || !bookObject.genre) {  
            return res.status(400).json({ message: 'Incomplete book data' });
        }

        // Suppression des champs inutiles
        delete bookObject._id;
        delete bookObject._userId;

         // Calculer averageRating
         const ratings = bookObject.ratings || [];
         const totalRatings = ratings.reduce((acc, rating) => acc + rating.grade, 0);
         const averageRating = ratings.length > 0 ? totalRatings / ratings.length : 0;
 

        // Vérification de la présence du fichier image
        if (!req.file) { 
            return res.status(400).json({ message: 'No image file received' });
        }

        // Vérification des informations d'authentification
        if (!req.auth || !req.auth.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Création de l'objet Book
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            averageRating
        });

        // Enregistrement du livre
        book.save()
            .then(() => {
                res.status(201).json({ message: 'Objet enregistré !' });
            })
            .catch(error => {
                res.status(400).json({ error });
            });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


//Contrôleur pour modifier un livre dans la base
exports.modifyBook = (req, res, next) => {
    // Vérifier si un fichier image est fourni
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) { 
                res.status(403).json({ message: "Unauthorized access" });
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
                        res.status(200).json({ message: 'Object modified' });
                    })
                    .catch(error => {
                        res.status(401).json({ error });
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

//Contrôleur pour supprimer un livre dans la base
exports.deleteBook = (req, res, next) => {
    
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized access' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {       
                            res.status(200).json({ message: "Object deleted" });
                        })
                        .catch(error => {    
                            res.status(401).json({ error });
                        });
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//Contrôleur pour ajouter une note à un livre
exports.addRating = (req, res, next) => {
    const grade  = req.body.rating;
    const userId = req.auth.userId;
    const bookId = req.params.id;

  

    if (!userId) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    if (grade < 0 || grade > 5) {
        return res.status(400).json({ message: "The rating must be between 0 and 5." });
    }

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) { 
                return res.status(404).json({ message: "Book not found" });
            }

            // Vérifie si l'utilisateur a déjà noté ce livre
            const existingRating = book.ratings.find(rating => rating.userId === userId);

            if (existingRating) {
                return res.status(400).json({ message: "You have already rated this book" });
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
                    return res.status(201).json(updatedBook);
                })
                .catch(error => {
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};
