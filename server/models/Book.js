const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
  title: String,
  author: String,
  description: String,
  price: Number,
  image: {type: String, required: false },
  stock: Number,
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

module.exports = model('Book', bookSchema);
