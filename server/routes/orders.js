const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

const router = express.Router();

// Złożenie zamówienia
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId, items } = req.body;

    // Pobranie użytkownika
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('Nieprawidłowy użytkownik');

    // Przygotowanie pozycji i zmniejszenie stock
    let total = 0;
    const orderItems = [];
    for (const { bookId, quantity } of items) {
      const book = await Book.findById(bookId).session(session);
      if (!book) throw new Error(`Książka o ID ${bookId} nie istnieje`);
      if (book.stock < quantity) throw new Error(`Niewystarczający stan dla ${book.title}`);
      book.stock -= quantity;
      await book.save({ session });
      total += book.price * quantity;
      orderItems.push({ book: book._id, quantity, price: book.price });
    }

    // Zapisanie zamówienia
    const order = new Order({
      user: user._id,
      items: orderItems,
      total
    });
    await order.save({ session });

    // Dodanie referencji do użytkownika
    user.orders.push(order._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
});

// Pobranie wszystkich zamówień
router.get('/', async (_, res) => {
  const orders = await Order.find({ status: 'active' })
    .populate('user', 'username')
    .populate('items.book', 'title');
  res.json(orders);
});

// Pobranie zamówień konkretnego użytkownika
router.get('/user/:userId', async (req, res) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate('items.book', 'title');
  res.json(orders);
});

// Anulowanie zamówienia
router.post('/:orderId/cancel', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(req.params.orderId).session(session);
    if (!order || order.status === 'cancelled')
      return res.status(400).json({ message: 'Zamówienie nie istnieje lub już anulowane' });

    // Przywrócenie ilości
    for (const it of order.items) {
      await Book.findByIdAndUpdate(
        it.book,
        { $inc: { stock: it.quantity } },
        { session }
      );
    }

    // Usuięcie referencji z użytkownika
    await User.findByIdAndUpdate(
      order.user,
      { $pull: { orders: order._id } },
      { session }
    );

    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Anulowano', order });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ error: e.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
