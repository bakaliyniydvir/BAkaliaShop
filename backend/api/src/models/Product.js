const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  minOrder: { type: Number, required: true, default: 1 },
  image: { type: String },
}, {
  timestamps: true
});

ProductSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Product', ProductSchema);
