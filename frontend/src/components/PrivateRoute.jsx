// frontend/src/components/PrivateRoute.jsx
import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function PrivateRoute({ adminOnly = false }) {
  const { user } = useContext(AuthContext)

  // якщо не залогінені — на /register
  if (!user) {
    return <Navigate to="/register" replace />
  }
  // якщо потрібна роль admin, але роль не підходить — на /
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  // інакше виводимо вкладені роути
  return <Outlet />
}
