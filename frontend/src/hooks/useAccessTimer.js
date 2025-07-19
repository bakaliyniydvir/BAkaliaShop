import { useEffect, useState } from 'react'
import api from '../api/api'

export default function useAccessTimer() {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    async function fetchData() {
      const { data } = await api.get('/users/me')
      const start = new Date(data.createdAt)
      setTimeLeft(Math.max(7*24*60*60*1000 - (Date.now() - start), 0))
    }
    fetchData()
  }, [])
  return timeLeft
}
