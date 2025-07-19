import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    let isMounted = true

    api.get(`/products/${id}`)
      .then(res => {
        if (isMounted) setProduct(res.data)
      })
      .catch(err => {
        console.error(`Помилка завантаження товару з id=${id}:`, err)
        // Optionally show notification here
      })

    return () => {
      isMounted = false
    }
  }, [id])
  

  if (!product) return <p className="p-4">Завантаження...</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <img src={product.image} alt={product.name} className="w-full max-w-md mx-auto my-4" />
      <p className="text-lg">Ціна: {product.price} ₴</p>
      <p className="mt-2">Код: {product.code}</p>
      <p className="mt-2">Категорія: {product.category}</p>
    </div>
  )
}