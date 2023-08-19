const Book = require('../models/Book');

const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');
const SharpMulter = require('sharp-multer');

const storage = SharpMulter({
    destination: (req, file, callback) => callback(null, "images"),
    imageOptions: {
        fileFormat: "jpg",
        quality: 80,
        resize: { width: 500, height: 500 },
    }
});

const upload = multer({ storage });

exports.createBook = async (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: "Multer error." });
        } else if (err) {
            return res.status(400).json({ error: "Error uploading file." });
        }

        let ref = null; // Declare ref outside of the condition

        try {
            const bookObject = JSON.parse(req.body.book);
            delete bookObject._id;
            delete bookObject._userId;

            let imageUrl = null;

            if (req.file) {
                const { buffer, originalname } = req.file;
                const timestamp = new Date().toISOString();
                ref = `${timestamp}-${originalname}.webp`;

                await sharp(buffer)
                    .webp({ quality: 20 })
                    .toFile(`./uploads/${ref}`);

                imageUrl = `${req.protocol}://${req.get('host')}/uploads/${ref}`;
            }

            const book = new Book({
                ...bookObject,
                userId: req.auth.userId,
                imageUrl: imageUrl
            });

            await book.save();
            return res.status(201).json({ message: 'Livre enregistré !' });
        } catch (error) {
            return res.status(400).json({ error });
        }
    });
};



exports.createBook2 = (req, res, next) => {
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

    const userId = req.auth.userId;
    const { rating } = req.body;
    const userRating = { userId: userId, grade: rating };

    Book.findByIdAndUpdate(
        req.params.id,
        { $push: { ratings: userRating } },
        { new: true }
    )
    .then((book) => {
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = sumRatings / book.ratings.length;

        return book.save(); // Renvoie le livre mis à jour pour la prochaine étape
    })
    .then((updatedBook) => {
        console.log(updatedBook);
        res.status(200).json(updatedBook); // Renvoie le livre mis à jour dans la réponse
    })
    .catch((error) => {
        res.status(500).json({ error });
    });
};



