const Book = require('../models/Book');

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
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
      .catch(error => res.status(400).json({ error }));
  };
