const Book = require('../models/Book');
const fs = require('fs');


exports.getThreeBook = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 }) // Tri par averageRating décroissant
    .limit(3) // Limite à trois résultats
    .then(books => {
        console.log("Best rated books fetched:", books);
        res.status(200).json(books);
    })
    .catch(error => {
        console.error("Error fetching best rated books:", error);
        res.status(400).json({ error });
    });
};

exports.getAllBook = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: 'Livre non trouvé' });
            }
        })
        .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' })})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.createRating = (req, res, next) => {
    const ratingObject = JSON.parse(req.body.rating);
    const grade = ratingObject.grade;

    // Vérification de la validité de la note
    if (grade < 0 || grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                throw new Error('Livre non trouvé');
            }

            // Vérification si l'utilisateur a déjà noté ce livre
            const userHasRated = book.ratings.some(rating => rating.userId.toString() === req.auth.userId);
            if (userHasRated) {
                throw new Error('L\'utilisateur a déjà noté ce livre');
            }

            // Ajout de la nouvelle notation au tableau des notations
            book.ratings.push({
                userId: req.auth.userId,
                grade: grade,
            });

            // Calcul de la nouvelle moyenne de notations pour le livre
            const totalGrades = book.ratings.reduce((total, rating) => total + rating.grade, 0);
            book.averageRating = totalGrades / book.ratings.length;

            // Enregistrement des modifications apportées au livre
            return book.save();
        })
        .then(updatedBook => {
            res.status(201).json(updatedBook);
        })
        .catch(error => {
            res.status(400).json({ error: error.message });
        });
};

