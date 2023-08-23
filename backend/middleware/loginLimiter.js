const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute (60 secondes * 1000 millisecondes)
    max: 15, // Limite à 15 requêtes par fenêtre
    message: "Trop de tentatives de connexion. Réessayez plus tard.",
});

module.exports = loginLimiter;