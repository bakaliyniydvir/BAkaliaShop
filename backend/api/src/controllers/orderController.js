const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')

// Снапшот товарів
async function snapshotProducts(items) {
  return Promise.all(
    items.map(async item => {
      const prod = await Product.findById(item.productId)
      if (!prod) {
        console.warn('❗ Товар не знайдено:', item.productId)
        return {
          productId: item.productId,
          name: '[товар видалено]',
          price: 0,
          quantity: item.quantity
        }
      }
      return {
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      }
    })
  )
}

// Снапшот користувача
async function snapshotUser(userId) {
  const u = await User.findById(userId, 'surname phone street')
  if (!u) {
    console.warn('⚠️ Користувача не знайдено:', userId)
    return {
      userName: '[користувача видалено]',
      userPhone: '',
      userStreet: ''
    }
  }
  return {
    userName: u.surname,
    userPhone: u.phone,
    userStreet: u.street
  }
}

// GET /orders — всі замовлення
exports.getAll = async (_req, res) => {
  try {
    const raws = await Order.find().sort({ createdAt: -1 }).lean()
    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          return { ...o, products: prods }
        }
        return o
      })
    )
    res.json(orders)
  } catch (err) {
    console.error('orderController.getAll error:', err)
    res.status(500).json({ msg: 'Внутрішня помилка сервера' })
  }
}

// GET /orders/my — замовлення користувача
exports.getMyOrder = async (req, res) => {
  try {
    const raws = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
    const orders = await Promise.all(
      raws.map(async o => {
        if (o.status === 'new') {
          const prods = await snapshotProducts(o.products)
          return { ...o, products: prods }
        }
        return o
      })
    )
    res.json(orders)
  } catch (err) {
    console.error('orderController.getMyOrder error:', err)
    res.status(500).json({ msg: 'Помилка отримання ваших замовлень' })
  }
}

// POST /orders — створити нове замовлення (гость або користувач)
exports.create = async (req, res) => {
  try {
    const { products, customer } = req.body;

    // Перевірка масиву продуктів
    if (req.body.products.some(p => !p.productId || p.quantity === undefined)) {
      return res.status(400).json({ msg: 'Продукти повинні мати productId і quantity' });
    }
    console.log('📥 Incoming body:', req.body);
    console.log('👤 User:', req.user);


    // Спроба створити знімок продуктів
    let frozenProducts;
    try {
      frozenProducts = await snapshotProducts(products);
    } catch (err) {
      console.error('Помилка в snapshotProducts:', err);
      return res.status(400).json({ msg: 'Неможливо обробити продукти' });
    }

    // Базові дані замовлення
    let orderData = {
      products: frozenProducts,
      status: 'new',
      createdAt: new Date()
    };

    if (req.user) {
      // Авторизований користувач
      const user = await User.findById(req.user._id, 'surname phone street');
      if (!user) return res.status(404).json({ msg: 'Користувача не знайдено' });

      Object.assign(orderData, {
        userId: user._id,
        userName: user.surname,
        userPhone: user.phone,
        userStreet: user.street || '',
        contact: user.phone
      });
    } else {
      // Гість
      if (!customer?.name || !customer?.phone) {
        return res.status(400).json({ msg: 'Гість: вкажіть ім’я та телефон' });
      }

      Object.assign(orderData, {
        userId: null,
        userName: customer.name,
        userPhone: customer.phone,
        userStreet: '',
        contact: customer.phone
      });
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('orderController.create error:', err);
    res.status(500).json({ msg: 'Внутрішня помилка сервера' });
  }
};


// PATCH /orders/:id — змінити статус
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ msg: 'Замовлення не знайдено' })

    // Заповнити відсутні поля користувача
    if (!order.userName || !order.userPhone) {
      const snap = await snapshotUser(order.userId)
      Object.assign(order, snap)
    }

    // Заморозити товари
    if (status === 'processing') {
      order.products = await snapshotProducts(order.products)
    }

    order.status = status
    await order.save()
    res.json(order)
  } catch (err) {
    console.error('orderController.updateStatus error:', err)
    res.status(500).json({ msg: 'Помилка оновлення статусу' })
  }
}

// DELETE /orders/:id
exports.remove = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Замовлення видалено' })
  } catch (err) {
    console.error('orderController.remove error:', err)
    res.status(500).json({ msg: 'Помилка видалення замовлення' })
  }
}

// DELETE /orders/:orderId/products/:productId
exports.removeProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params
    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ msg: 'Замовлення не знайдено' })

    order.products = order.products.filter(p => !p.productId.equals(productId))
    await order.save()
    res.json(order)
  } catch (err) {
    console.error('orderController.removeProduct error:', err)
    res.status(500).json({ msg: 'Помилка видалення товару з замовлення' })
  }
}
