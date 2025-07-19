import React from 'react'
import CategoryCard from './CategoryCard'
import { motion } from 'framer-motion'

export default function CategoryFilter({ categories }) {
  return (
    <section aria-label="Категорії товарів" className="mb-8 px-4 sm:px-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Категорії
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((c, index) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.025, duration: 0.4 }}
          >
            <CategoryCard category={c} index={index} />
          </motion.div>
        ))}

      </div>
    </section>
  )
}
