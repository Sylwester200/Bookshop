const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
    book: { type: Schema.Types.ObjectId, ref: 'Book' }, 
    quantity: { type: Number, required: true }, 
    price: { type: Number, required: true } 
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'active', enum: ['active', 'cancelled'] }
}, { timestamps: true });

module.exports = model('Order', orderSchema);