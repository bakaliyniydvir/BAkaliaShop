// frontend/src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import dayjs from 'dayjs'
import { FiRefreshCw, FiCheck, FiTrash2, FiX, FiDownload } from 'react-icons/fi'
import { useConfirm } from '../hooks/useConfirm'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'role', direction: 'ascending' })
  const { addNotification } = useNotification()
  const [confirm, ConfirmUI] = useConfirm()

  const fetchUsers = async () => {
    setRefreshing(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch {
      addNotification('Помилка завантаження користувачів')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const computeDays = u =>
    u.role === 'admin'
      ? Infinity
      : Math.max(0, dayjs().diff(dayjs(u.createdAt), 'day'))

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return users
    const t = searchTerm.toLowerCase()
    return users.filter(u =>
      u.surname.toLowerCase().includes(t) ||
      u.phone.includes(t) ||
      u.street.toLowerCase().includes(t)
    )
  }, [users, searchTerm])

  const sortedUsers = useMemo(() => {
    const arr = [...filtered]
    const getKey = u => {
      switch (sortConfig.key) {
        case 'user': return u.surname.toLowerCase()
        case 'phone': return u.phone
        case 'street': return u.street.toLowerCase()
        case 'role': return u.role
        case 'isApproved': return u.isApproved ? 1 : 0
        case 'days': return computeDays(u)
        default: return ''
      }
    }
    arr.sort((a, b) => {
      const aK = getKey(a), bK = getKey(b)
      if (aK < bK) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aK > bK) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
    return arr
  }, [filtered, sortConfig])

  const requestSort = key =>
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    }))
  const getSortIndicator = key =>
    sortConfig.key === key
      ? sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'
      : ''

  const approveUser = async id => {
    try {
      const { data } = await api.patch(`/users/${id}/approve`)
      setUsers(us => us.map(u => u._id === data._id ? data : u))
      addNotification('Користувача підтверджено')
    } catch {
      addNotification('Не вдалося підтвердити користувача')
    }
  }
  const deleteUser = async (id, role) => {
    if (role === 'admin') {
      addNotification('Неможливо видалити адміністратора')
      return
    }

    const confirmed = await confirm('Видалити користувача?', 'Підтвердження')
    if (!confirmed) return

    try {
      await api.delete(`/users/${id}`)
      setUsers(us => us.filter(u => u._id !== id))
      addNotification('Користувача видалено')
    } catch {
      addNotification('Не вдалося видалити користувача')
    }
  }

  const approveReset = async id => {
    try {
      await api.patch(`/auth/forgot-password/${id}/approve`)
      addNotification('Запит на скидання пароля підтверджено')
      fetchUsers()
    } catch {
      addNotification('Не вдалося підтвердити скидання пароля')
    }
  }
  const rejectReset = async id => {
    try {
      await api.patch(`/auth/forgot-password/${id}/reject`)
      addNotification('Запит на скидання пароля відхилено')
      fetchUsers()
    } catch {
      addNotification('Не вдалося відхилити скидання пароля')
    }
  }
  const handleDownloadBackup = async () => {
    try {
      const response = await api.get('/backup', {
        responseType: 'blob',
      })

      const blob = response.data

      // Формуємо назву файлу: backup-03-07-2025_14-32.zip
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      const fileName = `backup-${day}-${month}-${year}_${hours}-${minutes}.zip`

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Помилка завантаження резервної копії:', err)
      addNotification('Помилка завантаження резервної копії')
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Користувач</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadBackup}
            className="p-2 rounded text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <FiDownload size={20} />
          </button>
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            aria-label="Оновити"
            className="p-2 rounded text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FiRefreshCw
              size={20}
              className={`${(loading || refreshing) ? 'animate-spin' : ''} text-green-500`}
            />
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Пошук за прізвищем, телефоном або адресою…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded focus:outline-none"
      />

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          <motion.div
            className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-500">Завантаження користувачів…</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => requestSort('user')}
                  >
                    Прізвище{getSortIndicator('user')}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => requestSort('phone')}
                  >
                    Телефон{getSortIndicator('phone')}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => requestSort('street')}
                  >
                    Адреса{getSortIndicator('street')}
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => requestSort('role')}
                  >
                    Роль{getSortIndicator('role')}
                  </th>
                  <th
                    className="px-4 py-2 text-center cursor-pointer select-none"
                    onClick={() => requestSort('isApproved')}
                  >
                    Підтв.{getSortIndicator('isApproved')}
                  </th>
                  <th
                    className="px-4 py-2 text-center cursor-pointer select-none"
                    onClick={() => requestSort('days')}
                  >
                    Дні{getSortIndicator('days')}
                  </th>
                  <th className="px-4 py-2 text-center">Дії</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map(u => {
                  const days = computeDays(u)
                  return (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{u.surname}</td>
                      <td className="px-4 py-2">
                        <a
                          href={`tel:${u.phone.replace(/[^\d+]/g, '')}`}
                          className="text-sm underline hover:text-blue-800"
                        >
                          {u.phone}
                        </a>
                      </td>
                      <td className="px-4 py-2">{u.street}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2 text-center">
                        {u.isApproved ? <FiCheck className="text-green-500" /> : <FiX className="text-red-500" />}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {days === Infinity ? '∞' : days}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center space-x-3">
                          {u.resetRequested && (
                            <>
                              <button
                                onClick={() => approveReset(u._id)}
                                className="p-2 rounded text-blue-500 hover:text-blue-700 focus:outline-none"
                                title="Підтвердити скидання"
                              >
                                <FiCheck />
                              </button>
                              <button
                                onClick={() => rejectReset(u._id)}
                                className="p-2 rounded text-yellow-500 hover:text-yellow-700 focus:outline-none"
                                title="Відхилити скидання"
                              >
                                <FiX />
                              </button>
                            </>
                          )}
                          {!u.isApproved && (
                            <button
                              onClick={() => approveUser(u._id)}
                              className="p-2 rounded text-green-500 hover:text-green-700 focus:outline-none"
                              title="Підтвердити користувача"
                            >
                              <FiCheck />
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u._id, u.role)}
                              className="p-2 rounded text-red-500 hover:text-red-700 focus:outline-none"
                              title="Видалити користувача"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedUsers.map(u => {
              const days = computeDays(u)
              return (
                <div
                  key={u._id}
                  className="bg-white p-3 rounded shadow flex flex-col space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start sm:gap-3 space-y-2 sm:space-y-0">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{u.surname}</p>
                      <a
                        href={`tel:${u.phone.replace(/[^\d+]/g, '')}`}
                        className="text-sm underline hover:text-blue-800"
                      >
                        {u.phone}
                      </a>
                      <p className="text-xs text-gray-600 truncate">{u.street}</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-end gap-2">
                      {u.resetRequested && (
                        <>
                          <button
                            onClick={() => approveReset(u._id)}
                            className="w-8 h-8 flex items-center justify-center rounded text-blue-500 hover:text-blue-700"
                            title="Підтвердити скидання"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectReset(u._id)}
                            className="w-8 h-8 flex items-center justify-center rounded text-yellow-500 hover:text-yellow-700"
                            title="Відхилити скидання"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!u.isApproved && (
                        <button
                          onClick={() => approveUser(u._id)}
                          className="w-8 h-8 flex items-center justify-center rounded text-green-500 hover:text-green-700"
                          title="Підтвердити"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u._id, u.role)}
                          className="w-8 h-8 flex items-center justify-center rounded text-red-500 hover:text-red-700"
                          title="Видалити"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{u.role}</span>
                    <span>{days === Infinity ? '∞ дн.' : `${days} дн.`}</span>
                  </div>
                </div>
              )
            })}
          </div>

        </>
      )}
      {ConfirmUI}
    </div>
  )
}
