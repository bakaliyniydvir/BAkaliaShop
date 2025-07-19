// backend/api/src/controllers/authController.js
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Реєстрація
exports.register = async (req, res) => {
  const { surname, street, phone, password } = req.body
  if (!surname || !street || !phone || !password) {
    return res.status(400).json({ message: 'Всі поля обов’язкові' })
  }
  try {
    if (await User.findOne({ phone })) {
      return res.status(409).json({ message: 'Телефон уже використовується' })
    }
    const hash = await bcrypt.hash(password, 10)
    await new User({ surname, street, phone, password: hash }).save()
    return res
      .status(201)
      .json({ message: 'Зареєстровано. Очікуйте підтвердження адміністратора.' })
  } catch (err) {
    console.error('register error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Телефон має бути унікальним' })
    }
    return res.status(500).json({ message: 'Внутрішня помилка сервера' })
  }
}

// Вхід
exports.login = async (req, res) => {
  const { phone, password } = req.body
  if (!phone || !password) {
    return res.status(400).json({ message: 'Телефон і пароль обов’язкові' })
  }
  try {
    const user = await User.findOne({ phone })
    if (!user) {
      return res.status(400).json({ message: 'Невірні дані' })
    }
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Ваш акаунт ще не підтверджено адміністратором' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ message: 'Невірні дані' })
    }
    const payload = {
      id: user._id,
      role: user.role,
      surname: user.surname,
      phone: user.phone
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ token, user: payload })
  } catch (err) {
    console.error('login error:', err)
    return res.status(500).json({ message: 'Внутрішня помилка сервера' })
  }
}

// Повернути поточного користувача
exports.me = async (req, res) => {
  const { _id, surname, street, phone, role, isApproved } = req.user
  res.json({ user: { _id, surname, street, phone, role, isApproved } })
}

// Запит на скидання пароля — користувач вводить телефон та двічі новий пароль
exports.forgotPassword = async (req, res) => {
  const { phone, newPassword, confirm } = req.body
  if (!phone || !newPassword || !confirm) {
    return res.status(400).json({ message: 'Телефон і обидва паролі обов’язкові' })
  }
  if (newPassword !== confirm) {
    return res.status(400).json({ message: 'Паролі не співпадають' })
  }
  try {
    const user = await User.findOne({ phone })
    if (user) {
      const hash = await bcrypt.hash(newPassword, 10)
      user.resetRequested = true
      user.resetHash = hash
      user.resetRequestedAt = new Date()
      await user.save()
    }
    // Повідомляємо завжди успішно, щоб не вказувати на наявність/відсутність номера
    return res.json({
      message:
        'Якщо номер зареєстровано, адмін отримає запит на скидання пароля.'
    })
  } catch (err) {
    console.error('forgotPassword error:', err)
    return res
      .status(500)
      .json({ message: 'Не вдалося обробити запит на скидання пароля' })
  }
}

// Адмін підтверджує скидання пароля
exports.approveReset = async (req, res) => {
  const { userId } = req.params
  try {
    const user = await User.findById(userId)
    if (!user || !user.resetRequested || !user.resetHash) {
      return res.status(404).json({ message: 'Активний запит не знайдено' })
    }
    user.password = user.resetHash
    user.resetRequested = false
    user.resetHash = undefined
    user.resetRequestedAt = undefined
    await user.save()
    return res.json({ message: 'Пароль успішно змінено' })
  } catch (err) {
    console.error('approveReset error:', err)
    return res
      .status(500)
      .json({ message: 'Не вдалося підтвердити скидання пароля' })
  }
}

// Адмін відхиляє запит на скидання
exports.rejectReset = async (req, res) => {
  const { userId } = req.params
  try {
    const user = await User.findById(userId)
    if (!user || !user.resetRequested) {
      return res.status(404).json({ message: 'Активний запит не знайдено' })
    }
    user.resetRequested = false
    user.resetHash = undefined
    user.resetRequestedAt = undefined
    await user.save()
    return res.json({ message: 'Запит на скидання пароля відхилено' })
  } catch (err) {
    console.error('rejectReset error:', err)
    return res
      .status(500)
      .json({ message: 'Не вдалося відхилити запит' })
  }
}
