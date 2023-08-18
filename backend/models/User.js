const mongoose = require('mongoose');

// pour ne pas avoir plusieurs utillisateurs avec la même adresse mail
const uniqueValidator = require ('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// pour ne pas avoir plusieurs utillisateurs avec la même adresse mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
