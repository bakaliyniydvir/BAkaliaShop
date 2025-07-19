import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function PrintPage() {
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({
        key: 'category',
        direction: 'ascending'
    })

    const sizeOptions = [
        'text-[4px]',   // Extra extra small
        'text-[6px]',   // Extra extra small
        'text-[9px]',   // Extra small
        'text-[10px]',
        'text-[11px]',
        'text-[12px]',  // Standard small print
        'text-[14px]',  // Default readable print size
        'text-[16px]',  // Comfortable for body text
        'text-[18px]',
        'text-[20px]',  // Section titles
        'text-[24px]',  // Headings
    ]
    const [sizeIndex, setSizeIndex] = useState(2)
    const textSizeClass = sizeOptions[sizeIndex]
    const decreaseSize = () => sizeIndex > 0 && setSizeIndex(i => i - 1)
    const increaseSize = () =>
        sizeIndex < sizeOptions.length - 1 && setSizeIndex(i => i + 1)

    useEffect(() => {
        let isMounted = true
        setLoading(true)

        api.get('/products')
            .then(({ data }) => {
                if (isMounted) setProducts(data)
            })
            .catch((err) => {
                console.error('Помилка завантаження товарів:', err)
                // Optional: show user-friendly notification
                // addNotification?.('Не вдалося завантажити товари')
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])


    const sortedProducts = useMemo(() => {
        const arr = [...products]
        arr.sort((a, b) => {
            let aKey = a[sortConfig.key]
            let bKey = b[sortConfig.key]
            if (sortConfig.key === 'price' || sortConfig.key === 'minOrder') {
                aKey = aKey ?? 0
                bKey = bKey ?? 0
                return sortConfig.direction === 'ascending'
                    ? aKey - bKey
                    : bKey - aKey
            }
            return sortConfig.direction === 'ascending'
                ? String(aKey).localeCompare(String(bKey))
                : String(bKey).localeCompare(String(aKey))
        })
        return arr
    }, [products, sortConfig])

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return sortedProducts
        const term = searchTerm.toLowerCase()
        return sortedProducts.filter(
            p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
        )
    }, [sortedProducts, searchTerm])

    const getSortIndicator = key =>
        sortConfig.key === key
            ? sortConfig.direction === 'ascending'
                ? ' ▲'
                : ' ▼'
            : ''

    const requestSort = key =>
        setSortConfig(prev =>
            prev.key === key
                ? {
                    key,
                    direction:
                        prev.direction === 'ascending' ? 'descending' : 'ascending'
                }
                : { key, direction: 'ascending' }
        )

    return (
        <div className="print-page p-4 relative">
            {/* Watermark only for print */}
            <div className="print:block hidden fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="w-full h-full flex items-center justify-center opacity-10 text-7xl font-bold text-gray-400 rotate-45 select-none">
                    Бакалійний Двір
                </div>
            </div>

            {/* Панель керування */}
            <div className="print:hidden flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ← Назад
                </button>
                <input
                    type="text"
                    placeholder="Пошук за назвою або категорією…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border p-2 rounded w-full md:w-1/3"
                />
                <div className="flex justify-between items-center flex-wrap gap-2 mt-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={decreaseSize}
                            disabled={sizeIndex === 0}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            A-
                        </button>
                        <button
                            onClick={increaseSize}
                            disabled={sizeIndex === sizeOptions.length - 1}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                            A+
                        </button>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        🖨 Друкувати
                    </button>
                </div>

            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-20">
                    <motion.div
                        className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                    <p className="mt-4 text-gray-500">Завантаження товарів…</p>
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-md shadow">
                    <table
                        className={`min-w-full table-auto border ${textSizeClass}`}
                    >
                        <thead>
                            <tr className="text-primary print:bg-white">
                                <th className="border p-2 text-center">№</th>
                                <th
                                    onClick={() => requestSort('name')}
                                    className="border p-2 text-left cursor-pointer hover:bg-primary/10 transition"
                                >
                                    Назва{getSortIndicator('name')}
                                </th>
                                <th
                                    onClick={() => requestSort('category')}
                                    className="border p-2 text-left cursor-pointer hover:bg-primary/10 transition"
                                >
                                    Категорія{getSortIndicator('category')}
                                </th>
                                <th
                                    onClick={() => requestSort('minOrder')}
                                    className="border p-2 text-left cursor-pointer hover:bg-primary/10 transition"
                                >
                                    Мін. кількість{getSortIndicator('minOrder')}
                                </th>
                                <th
                                    onClick={() => requestSort('price')}
                                    className="border p-2 text-left cursor-pointer hover:bg-primary/10 transition"
                                >
                                    Ціна{getSortIndicator('price')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p, index) => (
                                <tr key={p._id} className="even:bg-accent/20">
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2">{p.name}</td>
                                    <td className="border p-2">{p.category}</td>
                                    <td className="border p-2">{p.minOrder}</td>
                                    <td className="border p-2">{p.price} ₴</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            )}

        </div>
    )
}
