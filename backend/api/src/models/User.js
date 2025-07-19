// backend/api/src/models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  surname: { type: String, required: true },
  street: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },

  // нові поля для скидання пароля
  resetRequested: { type: Boolean, default: false },
  resetHash: { type: String }  // тут тимчасово зберігаємо хеш нового пароля
});

module.exports = model('User', userSchema);
