// backend/api/src/routes/auth.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const ctrl = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// 1) Користувач робить запит на скидання:
router.post('/forgot-password', ctrl.forgotPassword);

// 2) Захищені / адмінські
router.get('/me', auth, ctrl.me);
router.patch('/forgot-password/:userId/approve', auth, roles('admin'), ctrl.approveReset);
router.patch('/forgot-password/:userId/reject', auth, roles('admin'), ctrl.rejectReset);

module.exports = router;
