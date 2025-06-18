const express = require('express');
const Book     = require('../models/Book');
const Order = require('../models/Order');

const router = express.Router();

// sprzedaż i przychód na książke
router.get('/sales-per-book', async (_, res) => {
  const result = await Order.aggregate([
    { $unwind: '$items' },
    { $group: {
        _id: '$items.book',
        totalSold: { $sum: '$items.quantity' },
        revenue:   { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
    }},
    { $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
    }},
    { $unwind: '$book' },
    { $project: {
        _id: 0,
        bookId: '$_id',
        title: '$book.title',
        totalSold: 1,
        revenue: 1
    }}
  ]);
  res.json(result);
});

// sprzedaż wg kategorii
router.get('/sales-per-category', async (_, res) => {
  const report = await Order.aggregate([
    { $unwind: '$items' },
    { $lookup: {
        from: 'books',
        localField: 'items.book',
        foreignField: '_id',
        pipeline: [{ $project: { category: 1, price: '$items.price', qty: '$items.quantity' } }],
        as: 'book'
    }},
    { $unwind: '$book' },
    { $unwind: '$book.category' },
    { $lookup: {
        from: 'categories',
        localField: 'book.category',
        foreignField: '_id',
        as: 'cat'
    }},
    { $unwind: '$cat' },
    { $group: {
        _id: '$cat.name',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        sold:    { $sum: '$items.quantity' }
    }},
    { $sort: { revenue: -1 } }
  ]);
  res.json(report);
});

// niski stan magazynowy
router.get('/low-stock', async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;
  const low = await Book.find({ stock: { $lt: threshold } }).select('title stock');
  res.json(low);
});

module.exports = router;
