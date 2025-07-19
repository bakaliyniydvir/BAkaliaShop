// frontend/src/pages/CategoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/api'
import { useNotification } from '../context/NotificationContext'
import SearchSort from '../components/SearchSort'
import ProductCard from '../components/ProductCard'
import { categories } from '../constants/categories'

export default function CategoryPage() {
    const { category: slug } = useParams()
    const navigate = useNavigate()
    const { addNotification } = useNotification()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')

    const currentCategory = categories.find(c => c.slug === slug)
    if (!currentCategory) {
        return (
            <p className="p-4 text-red-600">
                Категорія «{slug}» не знайдена
            </p>
        )
    }

    // 2) Fetch only this category’s products
    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const resp = await api.get(
                `/products?category=${encodeURIComponent(slug)}`
            )
            setProducts(resp.data)
        } catch {
            addNotification('Не вдалося завантажити товари цієї категорії')
        } finally {
            setLoading(false)
        }
    }, [slug, addNotification])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // filter + search
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    // sort
    const sorted = [...filtered]
    switch (sort) {
        case 'price_asc':
            sorted.sort((a, b) => a.price - b.price)
            break
        case 'price_desc':
            sorted.sort((a, b) => b.price - a.price)
            break
        case 'date_new':
            sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
            break
        case 'date_old':
            sorted.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            )
            break
        case 'alpha_asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'alpha_desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name))
            break
        default:
            break
    }

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
    }
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="p-4 sm:p-6 bg-base min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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

                <h1 className="flex-1 ml-4 text-2xl sm:text-3xl font-semibold text-primary text-right truncate">
                    {currentCategory.name}
                </h1>
            </div>

            {/* Search & Sort */}
            <SearchSort
                search={search}
                onSearch={setSearch}
                sort={sort}
                onSort={setSort}
            />

            {/* Spinner */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <motion.div
                        className="w-12 h-12 border-4 border-product_primary border-t-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    />
                </div>
            ) : (
                <motion.div
                    className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sorted.map(p => (
                        <motion.div key={p._id} variants={cardVariants}>
                            <ProductCard product={p} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
      
    )
}
