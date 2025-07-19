const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader) {
    // 🟡 Гість — просто пропускаємо без помилки
    req.user = undefined
    return next()
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    console.error('Auth middleware: Invalid auth header format')
    return res.status(401).json({ msg: 'Невірний формат токена' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      console.error('Auth middleware: User not found')
      return res.status(401).json({ msg: 'Токен більше не дійсний' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware: Invalid token', err)
    return res.status(401).json({ msg: 'Невірний або прострочений токен' })
  }
}
