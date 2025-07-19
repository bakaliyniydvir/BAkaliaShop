const router = require('express').Router()
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const ctrl = require('../controllers/userController')

router.get('/me', auth, ctrl.getMe)
router.get('/', auth, roles('admin'), ctrl.getAll)
router.patch('/:id/approve', auth, roles('admin'), ctrl.approve)
router.delete('/:id', auth, roles('admin'), ctrl.remove)

module.exports = router
