const mongoose = require('mongoose');

const booksSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      grade: { type: Number, required: true },
    }
  ],
  averageRating: { type: Number, required: true },
});

// Middleware pour calculer et mettre à jour averageRating quand une nouvelle note est ajoutée ou mise à jour
booksSchema.pre('save', function (next) {
  const totalGrades = this.ratings.reduce((total, rating) => total + rating.grade, 0);
  this.averageRating = totalGrades / this.ratings.length;
  next();
});

module.exports = mongoose.model('Book', booksSchema);
