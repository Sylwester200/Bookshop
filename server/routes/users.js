const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Rejestracja nowego użytkownika
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Użytkownik już istnieje' });
    const user = new User({ username, password, orders: [] });
    await user.save();
    res.json({ message: 'Zarejestrowano pomyślnie' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logowanie
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ message: 'Nieprawidłowy login lub hasło' });
    res.json({ message: 'Zalogowano pomyślnie', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// wylogowanie
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Nie udało się wylogować' });
    res.clearCookie('connect.sid');   // lub nazwę Twojego cookie z sesją
    res.json({ message: 'Wylogowano pomyślnie' });
  });
});

// Pobranie wszystkich użytkowników
router.get('/', async (_, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

module.exports = router;
