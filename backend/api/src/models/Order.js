const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,    // ← дозволено null
    default: null
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  userStreet: {
    type: String,
    required: false,    // ← необов'язково для гостей
    default: ''
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  status: {
    type: String,
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  contact: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Order', orderSchema)
