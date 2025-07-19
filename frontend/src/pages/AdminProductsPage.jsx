// frontend/src/pages/AdminProductsPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { categories } from '../constants/categories'
import { useNavigate } from 'react-router-dom'
import {
  FiPrinter,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi'
import { useConfirm } from '../hooks/useConfirm'

export default function AdminProductsPage() {
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Search filter
  const [search, setSearch] = useState('')

  // Add-form state
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: categories[0].name,
    minOrder: 1,
  })
  const [file, setFile] = useState(null)

  // Edit-form state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editFile, setEditFile] = useState(null)

  // ConfirmModal
  const [confirm, ConfirmUI] = useConfirm()

  // Load products
  useEffect(() => {
    let mounted = true
    setProductsLoading(true)
    api
      .get('/products')
      .then(r => mounted && setProducts(r.data))
      .catch(() => mounted && addNotification('Помилка завантаження товарів'))
      .finally(() => mounted && setProductsLoading(false))
    return () => { mounted = false }
  }, [addNotification])

  // Refresh products
  const refreshProducts = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.get('/products')
      setProducts(data)
    } catch {
      addNotification('Помилка завантаження товарів')
    } finally {
      setRefreshing(false)
    }
  }

  // Add a product
  const handleAdd = async e => {
    e.preventDefault()
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => body.append(k, v))
      if (file) body.append('image', file)
      const { data: newProd } = await api.post('/products', body)
      setProducts([newProd, ...products])
      setForm({ name: '', price: '', category: categories[0].name, minOrder: 1 })
      setFile(null)
      addNotification('Товар додано')
    } catch {
      addNotification('Помилка при додаванні')
    }
  }

  // Delete a product
  const deleteProduct = async id => {
    const confirmed = await confirm('Видалити товар?', 'Підтвердження')
    if (!confirmed) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p._id !== id))
      addNotification('Товар видалено')
    } catch {
      addNotification('Не вдалося видалити товар')
    }
  }

  // Start editing
  const startEdit = p => {
    setEditingId(p._id)
    setEditForm({
      name: p.name,
      price: p.price,
      category: p.category,
      minOrder: p.minOrder,
    })
    setEditFile(null)
  }
  const cancelEdit = () => setEditingId(null)
  const handleEditChange = e => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  // Save edits
  const saveEdit = async id => {
    try {
      const body = new FormData()
      Object.entries(editForm).forEach(([k, v]) => body.append(k, v))
      if (editFile) body.append('image', editFile)
      const { data: updated } = await api.put(`/products/${id}`, body)
      setProducts(products.map(p => (p._id === id ? updated : p)))
      setEditingId(null)
      addNotification('Товар оновлено')
    } catch {
      addNotification('Не вдалося оновити товар')
    }
  }

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' })
  const requestSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }
  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'asc'
        ? ' ▲'
        : ' ▼'
      : ''
  const sortedProducts = useMemo(() => {
    const arr = [...products]
    arr.sort((a, b) => {
      let A, B
      switch (sortConfig.key) {
        case 'name':
          A = a.name.toLowerCase(); B = b.name.toLowerCase(); break
        case 'category':
          A = a.category.toLowerCase(); B = b.category.toLowerCase(); break
        case 'price':
        case 'minOrder':
          A = a[sortConfig.key]; B = b[sortConfig.key]; break
        case 'updatedAt':
          A = new Date(a.updatedAt).getTime()
          B = new Date(b.updatedAt).getTime(); break
        default:
          return 0
      }
      if (A < B) return sortConfig.direction === 'asc' ? -1 : 1
      if (A > B) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [products, sortConfig])

  // Search filter
  const displayed = useMemo(() => {
    if (!search.trim()) return sortedProducts
    const term = search.toLowerCase()
    return sortedProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    )
  }, [search, sortedProducts])

  return (
    <div className="p-4 flex flex-col min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Товари</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/print')}
            aria-label="Переглянути друковану таблицю"
            className="p-2 rounded text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FiPrinter size={20} className="text-blue-500" />
          </button>
          <button
            onClick={refreshProducts}
            disabled={productsLoading || refreshing}
            aria-label="Оновити товари"
            className="p-2 rounded text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FiRefreshCw
              size={20}
              className={`${(productsLoading || refreshing) ? 'animate-spin' : ''} text-green-500`}
            />
          </button>
        </div>
      </div>

      {/* ADD FORM */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <input
          name="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Назва"
          className="border p-2 rounded focus:outline-none"
          required
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          placeholder="Ціна"
          className="border p-2 rounded focus:outline-none"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded focus:outline-none"
        >
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input
          name="minOrder"
          type="number"
          min="1"
          value={form.minOrder}
          onChange={e => setForm({ ...form, minOrder: e.target.value })}
          placeholder="Мін. кількість"
          className="border p-2 rounded focus:outline-none"
          required
        />
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="border p-2 rounded focus:outline-none col-span-full"
        />
        <button
          type="submit"
          className="col-span-full p-2 rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition"
        >
          Додати товар
        </button>
      </form>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Пошук за назвою або категорією…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full border p-2 rounded focus:outline-none"
      />

      {/* TABLE OR LOADER */}
      {productsLoading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження товарів…</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-center">#</th>
                <th className="p-2 text-center">Фото</th>
                <th
                  onClick={() => requestSort('name')}
                  className="p-2 cursor-pointer select-none"
                >
                  Назва{getSortIndicator('name')}
                </th>
                <th
                  onClick={() => requestSort('category')}
                  className="p-2 cursor-pointer select-none"
                >
                  Категорія{getSortIndicator('category')}
                </th>
                <th
                  onClick={() => requestSort('price')}
                  className="p-2 text-right cursor-pointer select-none"
                >
                  Ціна{getSortIndicator('price')}
                </th>
                <th
                  onClick={() => requestSort('minOrder')}
                  className="p-2 text-center cursor-pointer select-none"
                >
                  Мін. кількість{getSortIndicator('minOrder')}
                </th>
                <th
                  onClick={() => requestSort('updatedAt')}
                  className="p-2 cursor-pointer select-none"
                >
                  Оновлено{getSortIndicator('updatedAt')}
                </th>
                <th className="p-2 text-center">Дія</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((p, idx) => {
                const isEditing = editingId === p._id
                const rowNumber = displayed.length - idx
                return (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-center">{rowNumber}</td>
                    <td className="p-2 text-center">
                      {isEditing ? (
                        <label className="flex items-center justify-center h-8 w-12 border rounded cursor-pointer">
                          Фото
                          <input
                            type="file"
                            onChange={e => setEditFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <img
                          src={p.image || '/images/categories/nophoto.png'}
                          alt={p.name}
                          className="h-8 w-8 object-cover rounded mx-auto"
                        />
                      )}
                    </td>
                    <td className="p-2 align-top max-w-[120px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[380px]">
                      {isEditing ? (
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded focus:outline-none text-sm"
                        />
                      ) : (
                        <span className="block text-sm break-words whitespace-pre-wrap overflow-hidden">
                          {p.name}
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full border p-1 rounded focus:outline-none"
                        >
                          {categories.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : p.category}
                    </td>
                    <td className="p-2 text-right">
                      {isEditing ? (
                        <input
                          name="price"
                          type="number"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="w-20 border p-1 rounded text-right focus:outline-none"
                        />
                      ) : `${p.price} ₴`}
                    </td>
                    <td className="p-2 text-center">
                      {isEditing ? (
                        <input
                          name="minOrder"
                          type="number"
                          min="1"
                          value={editForm.minOrder}
                          onChange={handleEditChange}
                          className="w-16 border p-1 rounded text-center focus:outline-none"
                        />
                      ) : p.minOrder}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex flex-col items-center">
                        <span>{dayjs(p.updatedAt).format('DD.MM.YYYY')}</span>
                        <span className="text-gray-500 text-xs">
                          {dayjs(p.updatedAt).format('HH:mm')}
                        </span>
                      </div>
                    </td>

                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(p._id)}
                              className="p-2 rounded text-green-600 hover:bg-green-100 focus:outline-none"
                              title="Зберегти"
                            >
                              <FiRefreshCw />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded text-gray-600 hover:bg-gray-100 focus:outline-none"
                              title="Відмінити"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(p)}
                              className="p-2 rounded text-blue-600 hover:bg-blue-100 focus:outline-none"
                              title="Редагувати"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="p-2 rounded text-red-600 hover:bg-red-100 focus:outline-none"
                              title="Видалити"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {ConfirmUI}
    </div>
  )
}
