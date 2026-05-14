const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books-ctrl');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');


router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBestRating);
router.get('/:id', booksCtrl.getOneBook);
/*Ordre d’exécution : auth → multer → sharp → controller*/
router.post('/', auth, multer, sharp, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.createRating);
router.put('/:id', auth, multer, sharp, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;