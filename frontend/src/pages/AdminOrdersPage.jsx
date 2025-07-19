// frontend/src/pages/AdminOrdersPage.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { AuthContext } from '../context/AuthContext'
import {
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi'
import { useConfirm } from '../hooks/useConfirm'

export default function AdminOrdersPage() {
  const { user } = useContext(AuthContext)
  const { addNotification } = useNotification()

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrders, setExpandedOrders] = useState({})
  // ConfirmModal
  const [confirm, ConfirmUI] = useConfirm()
  const toggleExpand = id =>
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }))
  const isExpanded = id => !!expandedOrders[id]

  const toggleAllExpanded = () => {
    const allExpanded =
      Object.values(expandedOrders).length === filteredOrders.length &&
      Object.values(expandedOrders).every(Boolean)
    if (allExpanded) setExpandedOrders({})
    else {
      const all = {}
      filteredOrders.forEach(o => (all[o._id] = true))
      setExpandedOrders(all)
    }
  }

  const round1 = n => Math.round(n * 10) / 10
  const computeSubtotal = item => round1((item.price ?? 0) * item.quantity)
  const computeTotal = order =>
    round1(order.products.reduce((sum, p) => sum + computeSubtotal(p), 0))

  const statuses = [
    { value: 'new', label: 'Нове' },
    { value: 'processing', label: 'В обробці' },
    { value: 'done', label: 'Виконано' },
  ]

  const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      addNotification('Помилка завантаження замовлень')
    } finally {
      setOrdersLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    if (user?.role === 'admin') fetchOrders()
  }, [user?.role, fetchOrders])

  if (!user) return null
  if (user.role !== 'admin') return <p>Доступ заборонено</p>

  const changeStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/orders/${id}`, { status })
      setOrders(prev => prev.map(o => (o._id === id ? data : o)))
      addNotification('Статус оновлено')
    } catch {
      addNotification('Не вдалося оновити статус')
    }
  }

  const deleteOrder = async id => {
    const confirmed = await confirm('Видалити замовлення?', 'Підтвердження')
    if (!confirmed) return
    try {
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(o => o._id !== id))
      addNotification('Замовлення видалено')
    } catch {
      addNotification('Не вдалося видалити замовлення')
    }
  }

  const removeItem = async (orderId, productId) => {
    const confirmed = await confirm('Видалити цей товар з замовлення?', 'Підтвердження')
    if (!confirmed) return
    try {
      const { data } = await api.delete(`/orders/${orderId}/products/${productId}`)
      setOrders(prev => prev.map(o => (o._id === orderId ? data : o)))
      addNotification('Товар видалено з замовлення')
    } catch {
      addNotification('Не вдалося видалити товар із замовлення')
    }
  }

  const requestSort = key =>
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'asc'
        ? ' ▲'
        : ' ▼'
      : ''

  const sortedOrders = useMemo(() => {
    const arr = [...orders]
    const factor = sortConfig.direction === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortConfig.key) {
        case 'date':
          cmp = new Date(a.createdAt) - new Date(b.createdAt)
          break
        case 'user':
          cmp = (a.userName ?? '').localeCompare(b.userName ?? '')
          break
        case 'total':
          cmp = computeTotal(a) - computeTotal(b)
          break
        case 'status':
          cmp = (a.status ?? '').localeCompare(b.status ?? '')
          break
      }
      return cmp * factor
    })
    return arr
  }, [orders, sortConfig])

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return sortedOrders
    const term = searchTerm.toLowerCase()
    return sortedOrders.filter(o => {
      const info = `${o.userName} ${o.userPhone} ${o.userStreet}`.toLowerCase()
      if (info.includes(term)) return true
      if (computeTotal(o).toString().includes(term)) return true
      if ((o.status ?? '').includes(term)) return true
      if (
        statuses.some(
          s => s.value === o.status && s.label.toLowerCase().includes(term)
        )
      )
        return true
      return o.products.some(p =>
        (p.name ?? '').toLowerCase().includes(term)
      )
    })
  }, [searchTerm, sortedOrders, statuses])

  const totalOrders = filteredOrders.length

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Замовлення</h1>
        <div className="flex items-center space-x-2">
          {/* Toggle All */}
          <button
            onClick={toggleAllExpanded}
            className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            {Object.values(expandedOrders).every(Boolean)
              ? <FiChevronUp className="text-yellow-500" size={20} />
              : <FiChevronDown className="text-yellow-500" size={20} />}
          </button>
          {/* Refresh */}
          <button
            onClick={fetchOrders}
            disabled={ordersLoading}
            className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <FiRefreshCw
              size={20}
              className={`${ordersLoading ? 'animate-spin' : ''
                } text-green-500`}
            />
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Пошук за користувачем, статусом або товаром…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded focus:outline-none"
      />

      {/* Loading State */}
      {ordersLoading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження…</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <motion.div
            className="hidden lg:block overflow-x-auto"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            <table className="w-full table-fixed bg-white rounded shadow-sm text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="w-12 px-4 py-2">#</th>
                  <th
                    onClick={() => requestSort('date')}
                    className="w-32 px-4 py-2 cursor-pointer"
                  >
                    Дата{getSortIndicator('date')}
                  </th>
                  <th
                    onClick={() => requestSort('user')}
                    className="w-40 px-4 py-2 cursor-pointer"
                  >
                    Користувач{getSortIndicator('user')}
                  </th>
                  <th className="w-1/3 px-4 py-2">Товари</th>
                  <th
                    onClick={() => requestSort('total')}
                    className="w-24 px-4 py-2 text-right cursor-pointer"
                  >
                    Сума{getSortIndicator('total')}
                  </th>
                  <th
                    onClick={() => requestSort('status')}
                    className="w-32 px-4 py-2 text-center cursor-pointer"
                  >
                    Статус{getSortIndicator('status')}
                  </th>
                  <th className="w-32 px-4 py-2 text-center">Дія</th>
                </tr>
              </thead>
              <motion.tbody variants={listVariants}>
                {filteredOrders.map((o, idx) => {
                  const number = totalOrders - idx
                  const total = computeTotal(o)
                  return (
                    <motion.tr
                      key={o._id}
                      className="border-t hover:bg-gray-50"
                      variants={itemVariants}
                    >
                      <td className="px-4 py-2">{number}</td>
                      <td className="px-4 py-2">
                        {dayjs(o.createdAt).format('DD.MM.YYYY HH:mm')}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{o.userName}</span>
                          <span className="text-sm text-gray-600">
                            <a
                              href={`tel:${o.userPhone.replace(/[^\d+]/g, '')}`}
                              className="text-sm underline hover:text-blue-800"
                            >
                              {o.userPhone}
                            </a>
                          </span>
                          <span className="text-sm text-gray-600">
                            {o.userStreet}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-normal lg:max-h-64 lg:overflow-y-auto">
                        {isExpanded(o._id) && (
                          <ul className="divide-y divide-gray-200 space-y-1 pr-1">
                            {o.products.map((p, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-start gap-2"
                              >
                                <span className="flex-1 break-words text-sm max-w-[60%]">
                                  {p.name}
                                </span>
                                <div className="flex items-end flex-shrink-0 space-x-2 text-sm">
                                  <div className="text-right whitespace-nowrap">
                                    <div className="font-medium">{computeSubtotal(p)} ₴</div>
                                    <div className="text-xs text-gray-600 font-bold">
                                      [{round1(computeSubtotal(p) / (p.price || 1))}×{p.price}₴]
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeItem(o._id, p.productId)}
                                    className="p-2 rounded hover:bg-gray-100 flex items-center"
                                  >
                                    <FiTrash2 className="text-red-500" size={16} />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>

                      <td className="px-4 py-2 text-right font-semibold">
                        {total} ₴
                      </td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={o.status}
                          onChange={e =>
                            changeStatus(o._id, e.target.value)
                          }
                          className="border px-2 py-1 rounded text-sm"
                        >
                          {statuses.map(s => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => toggleExpand(o._id)}
                            className="p-2 rounded hover:bg-gray-100 flex items-center"
                          >
                            {isExpanded(o._id) ? (
                              <FiChevronUp className="text-yellow-500" size={16} />
                            ) : (
                              <FiChevronDown className="text-yellow-500" size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => deleteOrder(o._id)}
                            className="p-2 rounded hover:bg-gray-100 flex items-center"
                          >
                            <FiTrash2 className="text-red-500" size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </motion.div>

          {/* Mobile Cards */}
          <motion.div
            className="lg:hidden space-y-3"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {filteredOrders.map((o, idx) => {
              const number = totalOrders - idx
              const total = computeTotal(o)
              const statusLabel =
                statuses.find(s => s.value === o.status)?.label || o.status

              return (
                <motion.div
                  key={o._id}
                  className="bg-white rounded shadow-sm p-4"
                  variants={itemVariants}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">
                        {number}. {dayjs(o.createdAt).format('DD.MM.YYYY HH:mm')}
                      </p>
                      <div className="mt-1">
                        <p className="font-medium">{o.userName}</p>
                        <p className="text-sm text-gray-600">
                          <a
                            href={`tel:${o.userPhone.replace(/[^\d+]/g, '')}`}
                            className="text-sm underline hover:text-blue-800"
                          >
                            {o.userPhone}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600">{o.userStreet}</p>
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="font-bold">{o.products.length}</span> тов. ·{' '}
                        <span className="font-bold">{total}₴</span> · {statusLabel}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-2">
                      <button
                        onClick={() => toggleExpand(o._id)}
                        className="p-2 rounded hover:bg-gray-100 flex items-center"
                      >
                        {expandedOrders[o._id] ? (
                          <FiChevronUp className="text-yellow-500" size={16} />
                        ) : (
                          <FiChevronDown className="text-yellow-500" size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteOrder(o._id)}
                        className="p-2 rounded hover:bg-gray-100 flex items-center"
                      >
                        <FiTrash2 className="text-red-500" size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedOrders[o._id] && (
                    <>
                      <ul className="divide-y divide-gray-200 mb-2 text-sm text-gray-700">
                        {o.products.map((p, i) => (
                          <li
                            key={i}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-1 w-full"
                          >
                            {/* Назва товару з перенесенням */}
                            <span className="break-words whitespace-normal text-sm w-full sm:max-w-[55%]">
                              {p.name}
                            </span>

                            {/* Ціна та кнопка видалення */}
                            <div className="flex items-end justify-between sm:justify-end w-full sm:w-auto space-x-2">
                              <div className="text-right whitespace-nowrap text-sm">
                                <div className="font-medium">{computeSubtotal(p)} ₴</div>
                                <div className="text-xs text-gray-600 font-bold">
                                  [{round1(computeSubtotal(p) / (p.price || 1))}×{p.price}₴]
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(o._id, p.productId)}
                                className="p-2 rounded hover:bg-gray-100 flex items-center"
                              >
                                <FiTrash2 className="text-red-500" size={16} />
                              </button>
                            </div>
                          </li>


                        ))}
                      </ul>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span>Всього:</span>
                        <span className="font-semibold">{total} ₴</span>
                      </div>
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o._id, e.target.value)}
                        className="w-full border px-2 py-1 rounded text-sm"
                      >
                        {statuses.map(s => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}
      {ConfirmUI}
    </div>
  )
}
