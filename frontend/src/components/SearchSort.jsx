import React from 'react'
import { motion } from 'framer-motion'

export default function SearchSort({ search, onSearch, sort, onSort }) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Пошук товарів..."
        className="w-full sm:flex-1 border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        whileFocus={{ scale: 1.02 }}
      />

      <motion.select
        value={sort}
        onChange={e => onSort(e.target.value)}
        className="w-full sm:w-auto border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        whileTap={{ scale: 0.97 }}
      >
        <option value="">Сортування</option>
        <option value="price_asc">Ціна: зростання</option>
        <option value="price_desc">Ціна: спадання</option>
        <option value="date_new">Дата: новіші</option>
        <option value="date_old">Дата: старіші</option>
        <option value="alpha_asc">Назва: А → Я</option>
        <option value="alpha_desc">Назва: Я → А</option>
      </motion.select>
    </motion.div>
  )
}