const express = require('express')
const archiver = require('archiver')
const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')

const auth = require('../middleware/auth')
const roles = require('../middleware/roles')

const router = express.Router()

router.get('/', auth, roles('admin'), async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/zip')
        res.setHeader('Content-Disposition', 'attachment; filename=backup.zip')

        const archive = archiver('zip', { zlib: { level: 9 } })
        archive.on('error', (err) => {
            console.error('❌ Archiver error:', err)
            res.status(500).send('Archiver error')
        })

        archive.pipe(res)

        const [users, products, orders] = await Promise.all([
            User.find().lean(),
            Product.find().lean(),
            Order.find().lean()
        ])

        archive.append(JSON.stringify(users, null, 2), { name: 'users.json' })
        archive.append(JSON.stringify(products, null, 2), { name: 'products.json' })
        archive.append(JSON.stringify(orders, null, 2), { name: 'orders.json' })

        await archive.finalize()
    } catch (err) {
        console.error('❌ Backup error:', err)
        if (!res.headersSent) {
            res.status(500).send('Помилка створення резервної копії')
        }
    }
})

module.exports = router
