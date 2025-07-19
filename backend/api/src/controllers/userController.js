const mongoose = require('mongoose')
const User = require('../models/User')

exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch {
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.approve = async (req, res) => {
  const id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Невірний ID користувача' })
  }
  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { isApproved: true, approvedAt: new Date() },
      { new: true }
    ).select('-password')
    if (!updated) {
      return res.status(404).json({ msg: 'Користувача не знайдено' })
    }
    res.json(updated)
  } catch {
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.remove = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Користувача видалено' })
  } catch {
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

exports.getMe = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('-password')
    res.json(me)
  } catch {
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}
