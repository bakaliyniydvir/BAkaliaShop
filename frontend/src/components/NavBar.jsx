// frontend/src/components/NavBar.jsx
import React, { useContext, useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiShoppingCart,
  FiBox,
  FiClipboard,
  FiUsers,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
} from 'react-icons/fi'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const { cart } = useCart()
  const [open, setOpen] = useState(false)
  const prevCount = useRef(cart.length)
  const [bounce, setBounce] = useState(false)

  // bounce animation when cart grows
  useEffect(() => {
    if (cart.length > prevCount.current) {
      setBounce(true)
      const t = setTimeout(() => setBounce(false), 600)
      return () => clearTimeout(t)
    }
    prevCount.current = cart.length
  }, [cart.length])

  const toggleMenu = () => setOpen(o => !o)
  const closeMenu = () => setOpen(false)

  const links = [
    { to: '/', label: 'Головна', Icon: FiHome },
    {
      to: '/cart',
      label: 'Кошик',
      Icon: FiShoppingCart,
      badge: cart.length,
    },
    ...(user?.role === 'admin'
      ? [
        { to: '/admin/products', label: 'Товари', Icon: FiBox },
        { to: '/admin/orders', label: 'Замовлення', Icon: FiClipboard },
        { to: '/admin/users', label: 'Користувачі', Icon: FiUsers },
      ]
      : []),
  ]

  return (
    <>
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-primary text-accent border-b border-secondary"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut'}}
      >
        <div className="max-w-7xl mx-auto flex items-center h-16 px-4">
          {/* Logo */}
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-2 flex-shrink-0"
          >
            <img
              src="/images/logo/mainLogo.png"
              alt="Logo"
              loading='lazy'
              className="h-8 md:h-10 rounded"
            />
            <span className="inline-block bg-text-main px-3 py-1 rounded-lg shadow-lg">
              <span className="text-[16px] sm:text-[18px] md:text-[20px] font-bold tracking-tight">
                <span className="text-danger">БА</span>
                <span className="text-accent">калія</span>
              </span>
            </span>

          </NavLink>

          <div className="flex-1" />

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center space-x-8">
            {links.map(({ to, label, Icon, show, badge }) =>
              show !== false ? (
                <NavLink key={to} to={to} onClick={closeMenu}>
                  {({ isActive }) => (
                    <div className="relative flex items-center space-x-1 px-3 py-2 whitespace-nowrap">
                      <motion.div
                        animate={to === '/cart' && bounce ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.6 }}
                        className="relative"
                      >
                        <Icon
                          size={20}
                          className={isActive ? 'text-secondary' : 'text-accent'}
                        />
                        {to === '/cart' && badge > 0 && (
                          <span
                            className={`
                              absolute top-0 right-0
                              transform translate-x-1/2 -translate-y-1/2
                              bg-danger text-white text-xs
                              w-5 h-5 flex items-center justify-center rounded-full
                            `}
                          >
                            {badge}
                          </span>
                        )}
                      </motion.div>
                      <span
                        className={
                          isActive
                            ? 'text-secondary'
                            : 'text-accent hover:text-secondary'
                        }
                      >
                        {label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="underline"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ) : null
            )}

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center space-x-4 whitespace-nowrap">
                
                <div className="flex items-center space-x-2 max-w-[140px] overflow-hidden">
                  <FiUser className="text-secondary flex-shrink-0" />
                  <div
                    className="text-accent font-semibold text-xs leading-tight whitespace-nowrap overflow-hidden truncate"
                    title={user.surname}
                  >
                    {user.surname.split(' ')[0]}
                  </div>
                </div>




                <motion.button
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                  className="flex items-center space-x-1 px-4 py-2
                             border border-secondary text-secondary
                             hover:bg-secondary hover:text-accent rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLogOut />
                  <span>Вихід</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-6 whitespace-nowrap">
                <NavLink to="/login" onClick={closeMenu}>
                  {({ isActive }) => (
                    <motion.div
                      className="flex items-center space-x-1 px-3 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiLogIn
                        size={20}
                        className={isActive ? 'text-secondary' : 'text-accent'}
                      />
                      <span
                        className={
                          isActive
                            ? 'text-secondary'
                            : 'text-accent hover:text-secondary'
                        }
                      >
                        Вхід
                      </span>
                    </motion.div>
                  )}
                </NavLink>
                <NavLink to="/register" onClick={closeMenu}>
                  {({ isActive }) => (
                    <motion.div
                      className="flex items-center space-x-1 px-3 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiUserPlus
                        size={20}
                        className={isActive ? 'text-secondary' : 'text-accent'}
                      />
                      <span
                        className={
                          isActive
                            ? 'text-secondary'
                            : 'text-accent hover:text-secondary'
                        }
                      >
                        Реєстрація
                      </span>
                    </motion.div>
                  )}
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile user + burger */}
          <div className="flex items-center space-x-4 xl:hidden">
            {user && (
              <div className="flex items-center space-x-1 whitespace-nowrap">
                <div className="flex items-center space-x-2 max-w-[140px] overflow-hidden">
                  <FiUser className="text-secondary flex-shrink-0" />
                  <div
                    className="text-accent font-semibold text-xs leading-tight whitespace-nowrap overflow-hidden truncate"
                    title={user.surname}
                  >
                    {user.surname.split(' ')[0]}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="text-accent hover:text-secondary focus:outline-none"
            >
              {open ? (
                <FiX size={24} />
              ) : (
                <div className="relative">
                  <FiMenu size={24} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-danger text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu under header */}
      <AnimatePresence>
        {open && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            />
            {/* sliding panel */}
            <motion.nav
              className="fixed top-16 right-0 bottom-0 w-4/5 max-w-xs bg-primary text-accent p-6 z-50 flex flex-col space-y-4 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {links.map(({ to, label, Icon, show, badge }) =>
                show !== false ? (
                  <NavLink key={to} to={to} onClick={closeMenu}>
                    {({ isActive }) => (
                      <motion.div
                        className="flex items-center space-x-2 px-2 py-2 whitespace-nowrap rounded hover:bg-secondary/10"
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={to === '/cart' && bounce ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ duration: 0.6 }}
                          className="relative"
                        >
                          <Icon
                            size={20}
                            className={isActive ? 'text-secondary' : 'text-accent'}
                          />
                          {to === '/cart' && badge > 0 && (
                            <span
                              className={`
                                absolute top-0 right-0
                                transform translate-x-1/2 -translate-y-1/2
                                bg-danger text-white text-xs
                                w-5 h-5 flex items-center justify-center rounded-full
                              `}
                            >
                              {badge}
                            </span>
                          )}
                        </motion.div>
                        <span className={isActive ? 'text-secondary' : 'text-accent'}>
                          {label}
                        </span>
                      </motion.div>
                    )}
                  </NavLink>
                ) : null
              )}

              {user ? (
                <motion.button
                  onClick={() => {
                    logout()
                    closeMenu()
                  }}
                  className="mt-auto flex items-center space-x-1 px-4 py-2 whitespace-nowrap border border-secondary text-secondary hover:bg-secondary hover:text-accent rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiLogOut size={20} />
                  <span>Вихід</span>
                </motion.button>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center px-2 py-2 space-x-2 whitespace-nowrap rounded hover:bg-secondary/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiLogIn className="text-accent" size={20} />
                      <span className="text-accent">Вхід</span>
                    </motion.div>
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center px-2 py-2 space-x-2 whitespace-nowrap rounded hover:bg-secondary/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiUserPlus className="text-accent" size={20} />
                      <span className="text-accent">Реєстрація</span>
                    </motion.div>
                  </NavLink>
                </>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
