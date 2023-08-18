const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Books');
const User = require('./models/Users');

const app = express();

mongoose.connect('mongodb+srv://gabriellelailler:test@cluster0.wcktxy1.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !', error));

app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.get('/api/books', (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
  });


app.get('/api/books/:id', (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book) {
            res.status(200).json(book);
            } else {
            res.status(404).json({ message: 'Livre non trouvé' });
            }
        })
        .catch(error => res.status(404).json({ error }));
  });

app.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const thing = new Book({
      ...req.body
    });
    thing.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  });

module.exports = app;