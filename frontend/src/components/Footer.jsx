import React from 'react'
import { Link } from 'react-router-dom'
import { FiPhone, FiMapPin } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Footer() {
  return (
    <AnimatePresence>
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
        className="bg-primary text-accent border-t border-secondary mt-auto w-full"
      >
        <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="shrink-0">
            <img
              src="/images/logo/mainLogo.png"
              alt="Логотип Бакалія"
              loading="lazy"
              className="h-20 w-auto rounded-md transition-opacity hover:opacity-90"
            />
          </Link>

          <div className="space-y-2 text-center md:text-left text-sm text-accent">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <FiPhone className="text-secondary" />
              <a
                href="tel:+380681309308"
                className="hover:underline transition-colors"
              >
                +380 68 130 93 08
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2">
              <FiMapPin className="text-secondary" />
              <span className="hover:underline transition-colors">
                м. Великі Мости
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-center text-accent/80 py-2 border-t border-secondary">
          © {new Date().getFullYear()}{' '}
          <span className="text-danger font-semibold">БА</span>
          <span className="text-secondary font-medium">калія</span>
        </div>
      </motion.footer>
    </AnimatePresence>
  )
}
