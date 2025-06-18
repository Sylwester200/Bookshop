const express = require('express');
const Book = require('../models/Book');
const router = express.Router();

// pobranie wszystkich książek
router.get('/', async (_, res) => {
  const books = await Book.find().populate('category', 'name');
  res.json(books);
});

// pobranie książki po ID
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.json(book);
});

// Dodanie nowej książki
router.post('/', async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

// zaktualizowanie książki
router.put('/:id', async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});

// usunięcie książki
router.delete('/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Książka usunięta' });
});

module.exports = router;
