const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'klucz',
  resave: false, // sesja zapisana gdy jest jakaś zmiana
  saveUninitialized: false // nie tworzy pustych sesji
}));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const MONGODB_URI = 'mongodb://127.0.0.1:27017/bookstore?replicaSet=rs0&directConnection=true';
const PORT = 4000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Połączono z bazą MongoDB'))
  .catch(err => console.error('Błąd połączenia z MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Serwer działa poprawnie');
});

app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/categories', require('./routes/categories'));

app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
});
