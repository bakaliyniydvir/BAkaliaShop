// backend/routes/orders.js
const router = require('express').Router()
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const ctrl = require('../controllers/orderController')

// GET all orders (admin)
router.get('/', auth, roles('admin'), ctrl.getAll)

// GET my orders
router.get('/my', auth, ctrl.getMyOrder)

// CREATE new order
router.post('/', auth, ctrl.create)

// UPDATE order status (admin)
router.patch('/:id', auth, roles('admin'), ctrl.updateStatus)

// DELETE entire order (admin)
router.delete('/:id', auth, roles('admin'), ctrl.remove)

// DELETE single product from order (admin)
router.delete(
    '/:orderId/products/:productId',
    auth, roles('admin'),
    ctrl.removeProduct
)

module.exports = router
