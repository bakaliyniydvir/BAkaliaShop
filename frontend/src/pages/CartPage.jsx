// frontend/src/pages/CartPage.jsx
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useConfirm } from '../hooks/useConfirm'
import GuestOrderForm from '../components/GuestOrderForm'
import { FiTrash2 } from 'react-icons/fi'
import { createPortal } from 'react-dom'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, totalPrice } = useCart()
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(true)
  const [qtyInputs, setQtyInputs] = useState({})
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [confirm, ConfirmUI] = useConfirm()

  const round1 = n => Math.round(n * 10) / 10
  const statusLabels = { new: 'Нове', processing: 'В обробці', done: 'Виконано' }
  const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  // Initialize qtyInputs when cart changes
  useEffect(() => {
    const init = {}
    cart.forEach(i => {
      const id = i.product?._id ?? i.productId?._id
      init[id] = i.quantity
    })
    setQtyInputs(init)
  }, [cart])

  // Compute total for an order (history)
  const computeOrderTotal = order =>
    round1(
      order.products.reduce((sum, p) => {
        const unit = p.price ?? p.productId?.price ?? 0
        return sum + unit * p.quantity
      }, 0)
    )

  // Fetch history for logged-in users
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const resp = await api.get('/orders/my')
      const data = Array.isArray(resp.data)
        ? resp.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : []
      setOrders(data)
    } catch {
      addNotification('Не вдалося завантажити історію замовлень')
    } finally {
      setOrdersLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    if (user) fetchOrders()
    else {
      setOrders([])
      setOrdersLoading(false)
    }
  }, [user, fetchOrders])

  // Cart loading simulation
  useEffect(() => {
    const t = setTimeout(() => setCartLoading(false), 0)
    return () => clearTimeout(t)
  }, [])

  const sendOrder = async guestInfo => {
    setLoading(true);
    try {
      // 🧾 Формуємо замовлення з цінами
      const payload = {
        products: cart.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
          price: round1(product.price)
        }))
      };

      // 👤 Якщо користувач не авторизований — додаємо ім’я та телефон
      if (!user) {
        if (!guestInfo?.name?.trim() || !guestInfo?.phone?.trim()) {
          addNotification('Заповніть ім’я та телефон');
          setLoading(false);
          return;
        }
        payload.customer = {
          name: guestInfo.name.trim(),
          phone: guestInfo.phone.trim()
        };
      }

      // 🔐 Додаємо токен, якщо є
      const headers = {};
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      // 🐞 Debug (можна закоментити в проді)
      console.log('📦 Payload:', payload);
      console.log('📤 Headers:', headers);

      // 🚀 Надсилання замовлення
      await api.post('/orders', payload, { headers });

      // ✅ Успіх
      addNotification('Замовлення успішно створено');
      clearCart();
      if (user) await fetchOrders();
      setShowGuestForm(false);
    } catch (err) {
      console.error('❌ sendOrder error:', err?.response?.data || err.message);
      addNotification(err?.response?.data?.msg || 'Не вдалося оформити замовлення');
    } finally {
      setLoading(false);
    }
  };
  



  // Confirm button
  const handleConfirm = () => {
    if (!cart.length) {
      addNotification('Ваша корзина порожня')
      return
    }
    if (round1(totalPrice) < 2000) {
      addNotification('Мінімальна сума замовлення — 2000 ₴')
      return
    }
    for (const { product, quantity } of cart) {
      const min = product.minOrder || 1
      if (quantity < min) {
        addNotification(`Мінімальна кількість для "${product.name}" — ${min}`)
        return
      }
    }
    if (user) {
      // logged-in user: no guestInfo
      sendOrder()
    } else {
      // guest: show form
      setShowGuestForm(true)
    }
  }

  // Quantity controls
  const changeQty = (productId, currentQty, minOrder = 1, delta) => {
    const next = currentQty + delta
    if (next < minOrder) {
      addNotification(`Мінімальна кількість — ${minOrder}`)
      return
    }
    updateItem(productId, next)
  }
  const handleQtyBlur = (productId, minOrder = 1) => {
    let next = parseInt(qtyInputs[productId], 10) || 0
    if (next < minOrder) {
      addNotification(`Мінімальна кількість — ${minOrder}`)
      next = minOrder
    }
    updateItem(productId, next)
    setQtyInputs(prev => ({ ...prev, [productId]: next }))
  }
  const clearAll = () => {
    if (window.confirm('Очистити корзину?')) clearCart()
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap">
        <motion.button
                           onClick={() => navigate(-1)}
                           className="flex-shrink-0 flex items-center px-4 py-2
                              rounded-lg border border-secondary
                              bg-white text-text-main
                              hover:bg-secondary/10 transition
                              shadow-sm hover:shadow-md"
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                       >
                           <svg
                               className="w-5 h-5 mr-2 text-text-main"
                               fill="none"
                               stroke="currentColor"
                               viewBox="0 0 24 24"
                           >
                               <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth={2}
                                   d="M15 19l-7-7 7-7"
                               />
                           </svg>
                           <span className="font-medium">Назад</span>
                       </motion.button>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Ваша корзина</h1>
      </div>

      {/* Cart Loading / Empty */}
      {cartLoading ? (
        <div className="text-center py-20 text-gray-500">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-product_primary rounded-full mx-auto"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4">Завантаження товарів…</p>
        </div>
      ) : !cart.length ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <span className="text-6xl mb-4">🛒</span>
          <p className="text-lg">Корзина порожня</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <motion.table
              className="table-fixed w-full bg-white shadow-sm rounded"
              initial="hidden" animate="visible" variants={listVariants}
            >
              <colgroup>
                <col className="w-3/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
              </colgroup>
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-3 text-left">Товар</th>
                  <th className="p-3 text-left">Ціна</th>
                  <th className="p-3 text-center">К-ть</th>
                  <th className="p-3 text-center">Сума</th>
                  <th className="p-3 text-center">Дія</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => {
                  const product = item.product ?? item.productId
                  const id = product._id
                  const quantity = item.quantity
                  const unit = round1(product.price)
                  const line = round1(unit * quantity)
                  return (
                    <motion.tr
                      key={id}
                      className="border-t hover:bg-gray-50"
                      variants={itemVariants}
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-4 max-w-full">
                          <img
                            src={product.image || '/images/categories/nophoto.png'}
                            alt={product.name}
                            className="h-12 w-12 flex-shrink-0 object-cover rounded"
                          />
                          <span className="break-words text-sm text-gray-800 max-w-[200px] truncate md:whitespace-normal md:max-w-xs">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-left">{unit} ₴</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => changeQty(id, quantity, product.minOrder, -1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >−</button>
                          <input
                            type="number"
                            min={product.minOrder || 1}
                            step="1"
                            value={qtyInputs[id] ?? quantity}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, '')
                              setQtyInputs(prev => ({ ...prev, [id]: v }))
                            }}
                            onBlur={() => handleQtyBlur(id, product.minOrder)}
                            className="
    w-[4ch] text-center border rounded px-1 py-0.5
    appearance-none
    [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
    [&::-moz-appearance]:textfield
  "
                          />
                          <button
                            onClick={() => changeQty(id, quantity, product.minOrder, 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >+</button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">{line} ₴</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={async () => {
                            const confirmed = await confirm('Видалити товар з корзини?', 'Підтвердження')
                            if (confirmed) removeItem(id)
                          }}
                          className="text-red-600 hover:text-red-700 text-xl p-1 rounded-full transition-colors"
                          aria-label="Видалити товар"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </motion.table>
          </div>

          {/* Mobile Cards */}
          <motion.div className="md:hidden space-y-4" initial="hidden" animate="visible" variants={listVariants}>
            {cart.map(item => {
              const product = item.product ?? item.productId
              const id = product._id
              const quantity = item.quantity
              const unit = round1(product.price)
              const line = round1(unit * quantity)
              return (
                <motion.div key={id} className="bg-white shadow rounded-lg p-4 flex flex-col space-y-3" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold flex-1 min-w-0 break-words">{product.name}</h2>
                    <button
                      onClick={async () => {
                        const confirmed = await confirm('Видалити товар з корзини?', 'Підтвердження')
                        if (confirmed) removeItem(id)
                      }}
                      className="text-red-600 text-2xl font-bold p-1 hover:text-red-800" aria-label="Видалити"
                    >
                      <FiTrash2 className="w-4 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ціна</span>
                      <div className="font-medium">{unit} ₴</div>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => changeQty(id, quantity, product.minOrder, -1)}
                        className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        aria-label="Зменшити"
                      >−</button>
                      <input
                        type="number"
                        min={product.minOrder || 1}
                        step="1"
                        value={qtyInputs[id] ?? quantity}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '')
                          setQtyInputs(prev => ({ ...prev, [id]: v }))
                        }}
                        onBlur={() => handleQtyBlur(id, product.minOrder)}
                        className="
    w-[4ch] text-center border rounded px-1 py-0.5
    appearance-none
    [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
    [&::-moz-appearance]:textfield
  "
                        aria-label="Кількість"
                      />
                      <button
                        onClick={() => changeQty(id, quantity, product.minOrder, 1)}
                        className="h-8 w-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        aria-label="Збільшити"
                      >+</button>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">Сума</span>
                      <div className="font-medium">{line} ₴</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Summary & Actions */}
          <motion.div
            className="mt-6 bg-white shadow-sm rounded p-4 flex flex-col items-center space-y-3 md:flex-row md:justify-between md:space-y-0"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-lg font-semibold">
              Всього: <span className="text-product_primary">{round1(totalPrice)} ₴</span>
            </div>
            {round1(totalPrice) < 2000 && (
              <p className="text-red-500 text-sm">
                Мінімальне замовлення — 2000 ₴. Додайте ще {round1(2000 - totalPrice)} ₴.
              </p>
            )}
            <div className="flex space-x-2">
              <motion.button
                onClick={handleConfirm}
                disabled={loading || round1(totalPrice) < 2000}
                whileTap={{ scale: 0.95 }}
                className="bg-product_primary text-white px-6 py-2 rounded hover:bg-product_primary-hover disabled:opacity-50"
              >
                {loading ? 'Оформляємо…' : 'Підтвердити'}
              </motion.button>
              <button
                onClick={clearAll}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Очистити корзину
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Guest form overlay */}
      {showGuestForm &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <GuestOrderForm
                onSubmit={sendOrder}
                onCancel={() => setShowGuestForm(false)}
                loading={loading}
              />
            </div>
          </div>,
          document.body
        )}


      {/* Order History */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Історія замовлень</h2>
        {ordersLoading ? (
          <div className="text-center py-10">
            <motion.div
              className="w-12 h-12 border-4 border-gray-200 border-t-product_primary rounded-full mx-auto"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="mt-4 text-gray-500">Завантаження історії…</p>
          </div>
        ) : !orders.length ? (
          <p className="text-gray-500">🔐 Для перегляду історії замовлень необхідно зареєструватися або увійти в акаунт</p>
        ) : (
          <div className="max-h-[40rem] overflow-y-auto space-y-4">
            {orders.map(order => {
              const total = computeOrderTotal(order)
              const statusBorder =
                order.status === 'new' ? 'border-yellow-500'
                  : order.status === 'processing' ? 'border-blue-500'
                    : 'border-green-500'
              return (
                <motion.div
                  key={order._id}
                  className={`bg-white rounded shadow-sm p-4 border-l-4 ${statusBorder}`}
                  variants={itemVariants}
                >
                  <div className="flex flex-wrap justify-between mb-2">
                    <span className="font-medium">ID: {order._id}</span>
                    <span className="text-sm text-gray-500">
                      {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}
                    </span>
                  </div>
                  <div className="mb-2"><strong>Статус:</strong> {statusLabels[order.status]}</div>
                  <div className="mb-4">
                    <strong>Сума:</strong> <span className="text-product_primary">{total} ₴</span>
                  </div>
                  <div className="font-medium mb-1">Товари:</div>
                  <ul className="divide-y divide-gray-200">
                    {order.products.map((p, i) => {
                      const prod = p.productId ?? p
                      const unit = round1(p.price ?? prod.price ?? 0)
                      const line = round1(unit * p.quantity)
                      return (
                        <li key={i} className="flex justify-between items-start py-2">
                          <span className="flex-1 break-words">
                            {p.name ?? prod.name} × {p.quantity}
                          </span>
                          <div className="text-right">
                            <div className="font-medium">{line} ₴</div>
                            <div className="text-xs text-gray-600">
                              [{p.quantity}×{unit}₴]
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      {ConfirmUI}
    </div>
  )
}
