const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  /* identiﬁant MongoDB unique de l'utilisateur qui a créé le livre*/
  userId: { type: String, required: true }, 
  title: { type: String, required: true },
  author: { type: String, required: true },
  /*illustration/couverture du livre*/
  imageUrl: { type: String, required: true },
  /*année de publication du livre*/
  year: { type: Number, required: true },
  /*genre du livre*/
  genre: { type: String, required: true },
  /*notes*/
  ratings: [
    {
    /* identiﬁant MongoDB unique de l'utilisateur qui a noté le livre*/
    userId: { type: String, required: true },
    /* note donnée à un livre*/
    grade: { type: Number, required: true, min: 0, max: 5 },
    }
  ],
  /* notes attribuées à un livre*/
  averageRating : { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);