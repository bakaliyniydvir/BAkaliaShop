// frontend/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import ScrollToTopButton from './components/ScrollToTopButton'

import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminProducts from './pages/AdminProductsPage'
import AdminOrders from './pages/AdminOrdersPage'
import AdminUsers from './pages/AdminUsersPage'
import PrintPage from './pages/PrintPage'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar />

      <ScrollToTop /> {/* 👈 обов’язково всередині Router, але над Routes */}

      <main className="flex-grow w-full max-w-[1300px] mx-auto px-4 py-6">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin-only */}
          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/admin/print" element={<PrintPage />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  )
}

