// backend/api/src/routes/products.js
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const ctrl = require('../controllers/productController')

// Public: list all products, optionally filtered by ?category=<slug>
router.get('/', ctrl.getAll)

// Public: list products by category slug
router.get('/category/:slug', ctrl.getByCategory)

// Admin: create product
router.post('/', auth, roles('admin'), ctrl.create)

// Admin: update product
router.put('/:id', auth, roles('admin'), ctrl.update)

// Admin: delete product
router.delete('/:id', auth, roles('admin'), ctrl.remove)

module.exports = router
