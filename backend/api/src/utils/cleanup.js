const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const User = require('../models/User')

mongoose.connect(process.env.MONGO_URI)

const now = new Date()
const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

User.deleteMany({
  role: 'user',
  isApproved: false,
  createdAt: { $lt: cutoff }
})
.then(res => {
  console.log(`❌ Видалено ${res.deletedCount} користувачів`)
  mongoose.disconnect()
})
.catch(err => {
  console.error('Помилка очищення:', err)
  mongoose.disconnect()
})
