import React, { useState } from 'react'
import { useNotification } from '../context/NotificationContext'

export default function GuestOrderForm({ onSubmit, onCancel, loading }) {
    const [name, setName] = useState('')
    const [phoneDigits, setPhoneDigits] = useState('')
    const { addNotification } = useNotification()

    const handleNameChange = e => setName(e.target.value)

    const handlePhoneChange = e => {
        let digits = e.target.value.replace(/\D/g, '')
        if (digits.startsWith('380')) digits = digits.slice(3)
        else if (digits.startsWith('0')) digits = digits.slice(1)
        setPhoneDigits(digits.slice(0, 9))
    }

    const handleSubmit = e => {
        e.preventDefault()
        if (!name.trim() || phoneDigits.length !== 9) {
            addNotification('Будь ласка, заповніть ім’я і повний телефон: +380XXXXXXXXX')
            return
        }
        onSubmit({ name: name.trim(), phone: '+380' + phoneDigits })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl p-6 text-center animate-fade-in"
        >
            <h2 className="text-xl font-bold text-text-main">Ваші контактні дані</h2>

            <div className="mt-4 text-left">
                <label className="block mb-1 font-medium text-text-main">Прізвище</label>
                <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Прізвище"
                    className="w-full border border-secondary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition"
                    required
                />
            </div>

            <div className="mt-4 text-left">
                <label className="block mb-1 font-medium text-text-main">Телефон</label>
                <div className="flex">
                    <span className="inline-flex items-center px-3 bg-secondary text-white rounded-l-md font-mono">
                        +380
                    </span>
                    <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phoneDigits}
                        onChange={handlePhoneChange}
                        placeholder="XXXXXXXXX"
                        className="w-full border border-secondary rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition"
                        required
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition"
                >
                    {loading ? 'Надсилаємо…' : 'Підтвердити замовлення'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-text-soft hover:bg-gray-200 disabled:opacity-50 transition"
                >
                    Скасувати
                </button>
            </div>
        </form>
    )
}
