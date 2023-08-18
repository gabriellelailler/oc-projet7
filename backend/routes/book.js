const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBook);
router.post('/', bookCtrl.createBook);
router.get('/bestrating', bookCtrl.getThreeBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;