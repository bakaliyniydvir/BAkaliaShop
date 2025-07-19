import axios from 'axios'
import { notify } from '../utils/notificationService'

const api = axios.create({
  baseURL: __BACKEND_URL__,
  withCredentials: true,
  timeout: 10000 // optional: detect stuck backend faster
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    let msg

    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      msg = 'Сервер спить або недоступний. Спробуйте ще раз пізніше.'
    } else {
      msg = error.response?.data?.message || error.response?.data?.msg || error.message
    }

    notify(msg)
    return Promise.reject(error)
  }
)

export default api
