// frontend/src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react'
import { useNotification } from '../context/NotificationContext'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, NavLink } from 'react-router-dom'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
         -1.274 4.057-5.064 7-9.542 7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7
         a9.958 9.958 0 012.223-3.607M6.1 6.1A9.958 9.958 0 0112 5c4.478 0 
         8.268 2.943 9.542 7a10.05 10.05 0 01-.777 2.082M3 3l18 18" />
  </svg>
)

export default function RegisterPage() {
  const { register } = useContext(AuthContext)
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [surname, setSurname] = useState('')
  const [settlementType, setSettlementType] = useState('м.')
  const [settlementName, setSettlementName] = useState('')
  const [streetType, setStreetType] = useState('вул.')
  const [streetName, setStreetName] = useState('')
  const [phone, setPhone] = useState('+380')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePhoneChange = e => {
    const digits = e.target.value.replace(/\D/g, '')
    const rest = digits.length > 3 ? digits.slice(3, 12) : ''
    setPhone('+380' + rest)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirmPassword) {
      addNotification('Паролі не співпадають')
      return
    }
    const street = `${settlementType}${settlementName}, ${streetType} ${streetName}`
    try {
      const { data } = await register({surname, street, phone, password})
      addNotification(data.msg || 'Реєстрація пройшла успішно')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.msg || 'Помилка при реєстрації'
      addNotification(msg)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border p-8 rounded-lg shadow max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-text-main">Реєстрація</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Прізвище"
            value={surname}
            onChange={e => setSurname(e.target.value)}
            className="w-full border border-border p-2 rounded text-text-main"
            required
          />

          <div className="flex gap-2">
            <div className="w-[30%]">
              <select
                value={settlementType}
                onChange={e => setSettlementType(e.target.value)}
                className="border border-border p-2 rounded w-full text-text-main bg-white"
              >
                <option value="м.">місто</option>
                <option value="с.">село</option>
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Населений пункт"
                value={settlementName}
                onChange={e => setSettlementName(e.target.value)}
                className="border border-border p-2 rounded w-full text-text-main"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-[30%]">
              <select
                value={streetType}
                onChange={e => setStreetType(e.target.value)}
                className="border border-border p-2 rounded w-full text-text-main bg-white"
              >
                <option value="вул.">вул.</option>
                <option value="просп.">просп.</option>
                <option value="пров.">пров.</option>
                <option value="бульв.">бульв.</option>
                <option value="пл.">пл.</option>
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Назва вулиці"
                value={streetName}
                onChange={e => setStreetName(e.target.value)}
                className="border border-border p-2 rounded w-full text-text-main"
                required
              />
            </div>
          </div>

          <input
            type="tel"
            placeholder="+380XXXXXXXXX"
            value={phone}
            onChange={handlePhoneChange}
            className="border border-border p-2 rounded w-full text-text-main"
            pattern="\+380\d{9}"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-border p-2 rounded w-full pr-10 text-text-main"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Підтвердіть пароль"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border border-border p-2 rounded w-full pr-10 text-text-main"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
              aria-label={showConfirm ? 'Сховати підтвердження' : 'Показати підтвердження'}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="bg-product_primary text-white rounded w-full py-2 hover:bg-product_primary-hover focus:ring focus:ring-product_primary/50 transition"
        >
          Зареєструватися
        </button>

        <div className="text-center text-sm text-text-soft">
          Вже є акаунт?{' '}
          <NavLink to="/login" className="text-product_primary hover:underline">
            Увійти
          </NavLink>
        </div>
      </form>
    </div>  
  )    
}
