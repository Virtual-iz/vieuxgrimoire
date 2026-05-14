const multer = require('multer');

/* Liste des types d’images autorisés.*/
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

/*enregistrement */
const storage = multer.diskStorage({

  /* dossier de récupération et stockage des fichiers uploadés.*/
  destination: (req, file, callback) => {
    callback(null, 'images');
  },

  filename: (req, file, callback) => {

    /* nom du fichier : nom complet envoyé par l’utilisateur, remplace les espaces par un underscore */
    const name = file.originalname.split('.')[0].split(' ').join('_');

    /*Date.now() : ajoute un timestamp pour garantir un nom unique */
    callback(null, name + Date.now());
  }
});

/*.single('image') : on attend un seul fichier dans le champ "image" du frontend.*/
module.exports = multer({ storage: storage }).single('image');