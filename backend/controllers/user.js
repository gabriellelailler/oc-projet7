const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction de validation du format de l'e-mail
function isValidEmail(email) {
    const emailTested = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailTested.test(email);
  }

exports.signup = (req, res, next) => {
    // vérification du format d'email
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: "Adresse e-mail invalide !" });
    }
    // vérification de la longueur du mot de passe
    if (req.body.password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères !" });
    }

    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Clé identifiant / mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Clé identifiant / mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };