const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// pobranie wszystkich kategorii
router.get('/', async (_, res) => {
  const cats = await Category.find();
  res.json(cats);
});

// dodanie nowej kategorii
router.post('/', async (req, res) => {
  const cat = new Category({ name: req.body.name });
  await cat.save();
  res.json(cat);
});

// edycja kategorii
router.put('/:id', async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id,
    { name: req.body.name },
    { new: true }
  );
  res.json(cat);
});

// usunięcie kategorii
router.delete('/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Usunięto kategorię' });
});

module.exports = router;
