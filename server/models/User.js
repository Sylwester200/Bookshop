const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

module.exports = model('User', userSchema);
