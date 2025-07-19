module.exports = (requiredRole) => (req, res, next) => {
  if (req.user.role !== requiredRole)
    return res.status(403).json({ msg: 'Доступ заборонено' });
  next();
};
