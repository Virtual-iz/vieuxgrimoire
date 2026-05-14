const Book = require('../models/Book');
const fs = require('fs');

/*Renvoie un tableau de tous les livres de la base de données.*/
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => { 
        res.status(200).json(books);})
    .catch((error) => {
        res.status(400).json({ error: error });});
};

/*Renvoie un tableau des 3 livres avec la meilleure note moyenne. AVANT ID coté routes */
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie par note décroissante
    .limit(3) // Limite à 3 résultats
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
       ...bookObject, 
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
       // initialisation obligatoire (cf modele)
        averageRating: 0,   
        ratings: []         
   });

  book.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

/*Renvoie le livre avec l’_id fourni.*/
exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then((book) => { res.status(200).json(book); })
    .catch((error) => { res.status(404).json({ error: error }); }); 
};

/* Si un ﬁchier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book. 
Le corps de la demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne du corps de la demande basée sur les données soumises avec le ﬁchier.
Corps de requete : EITHER Book as JSON OR { book: string, image: ﬁle }
Réponse attendue { message: string }*/

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // on vérifie si le livre existe
      if (!book) {
        // return pour éviter que le code continue et tente updateOne même après un échec
        return res.status(404).json({ error: new Error("No such book !") });
      }
      // on vérifie si l'utilisation est bon
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      // on vérifie qu'une image existe pour le livre
      if (typeof bookObject.imageUrl === 'undefined') {
        bookObject.imageUrl = book.imageUrl
      }
      // si l'image n'existe pas, on la crée, si elle existe, on la supprime d'abord avant de créer la nouvelle, on enregistre dans la base de données en déﬁnissant correctement son ImageUrl
      if (bookObject.imageUrl !== book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err, info) => {
          console.log(err || info)
        });
      }
      return Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    })

    .then(() => res.status(200).json({ message: 'Objet modifié!' }))

    .catch((error) => {
      res.status(400).json({ error });
    });

  };


/*Supprime le livre avec l'_id fourni ainsi que l’image associée.*/
exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = book.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Book.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};


/*Déﬁnit la note pour le user ID fourni. La note doit être comprise entre 0 et 5.
L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating" aﬁn de ne pas laisser un utilisateur noter deux fois le même livre. Il n’est pas possible de modiﬁer une note. La note moyenne "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête.
Initialise la note moyenne du livre à 0 et le rating avec un tableau vide.*/
exports.createRating = (req, res, next) => {
  const userId = req.auth.userId;
  const { rating } = req.body;

  if (rating < 0 || rating > 5) {  
    return res.status(400).json({ error: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre non trouvé." });
      }

      const alreadyRated = book.ratings.some((r) => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ error: "Vous avez déjà noté ce livre." });
      }
      // Ajout de la note
      book.ratings.push({ userId, grade: rating });
      // Recalcul de la moyenne
      const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      const average = totalRatings / book.ratings.length;
      book.averageRating = parseFloat(average.toFixed(1));
      // Utilisation de async/await , avec gestion d'erreur locale
      (async () => {
        try {
          const savedBook = await book.save({ validateBeforeSave: true });
          res.status(200).json(savedBook);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      })();
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
};

/*
await :
Force l'exécution à attendre que book.save() termine avant de continuer.
Évite les comportements asynchrones imprévisibles (comme envoyer une réponse avant que la sauvegarde ne soit terminée).

try/catch :
Capture toutes les erreurs (y compris les erreurs de validation ou de connexion à MongoDB).
Affiche des logs détaillés (console.error) pour diagnostiquer les problèmes.

const savedBook = ... :
Stocke le résultat de save() dans une variable, ce qui permet de :
Vérifier que la sauvegarde a réussi (via console.log).
Retourner les données mises à jour dans la réponse (res.status(200).json(savedBook)).
*/