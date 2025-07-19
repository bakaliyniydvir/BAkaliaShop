// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [phone, setPhone] = useState('+380');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = v => {
    const d = v.replace(/\D/g, '');
    const rest = d.length > 3 ? d.slice(3, 12) : '';
    return '+380' + rest;
  };
  const handlePhoneChange = e => setPhone(formatPhone(e.target.value));

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      navigate(from, { replace: true });
    } catch (err) {
      addNotification(err.response?.data?.message || 'Помилка при вході');
    } finally { setLoading(false); }
  };

  const handleReset = async e => {
    e.preventDefault();

    if (newPassword !== confirm) {
      addNotification('Паролі не збігаються');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone, newPassword, confirm });
      addNotification('Запит на скидання створено. Очікуйте підтвердження.');
      setIsReset(false);
    } catch {
      addNotification('Не вдалося подати запит. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <form
        onSubmit={isReset ? handleReset : handleLogin}
        className="bg-white border border-border p-8 rounded-lg shadow max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-text-main">
          {isReset ? 'Відновлення пароля' : 'Увійти'}
        </h1>

        <div className="space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+380XXXXXXXXX"
            className="w-full border border-border p-2 rounded text-text-main"
            required
          />

          {isReset ? (
            <>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Новий пароль"
                className="w-full border border-border p-2 rounded text-text-main"
                required
              />
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Підтвердіть пароль"
                className="w-full border border-border p-2 rounded text-text-main"
                required
              />
            </>
          ) : (
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full border border-border p-2 rounded text-text-main"
              required
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-hover focus:ring focus:ring-primary-focus disabled:opacity-50 transition"
        >
          {loading
            ? 'Зачекайте…'
            : isReset
              ? 'Запитати скидання'
              : 'Увійти'}
        </button>

        <div className="text-center text-sm text-text-soft space-y-2">
          {isReset ? (
            <button
              type="button"
              onClick={() => setIsReset(false)}
              className="text-primary hover:underline"
            >
              Повернутись до входу
            </button>
          ) : (
            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => setIsReset(true)}
                className="text-primary hover:underline"
              >
                Скинути пароль
              </button>
              <NavLink to="/register" className="text-primary hover:underline">
                Реєстрація
              </NavLink>
            </div>
          )}
        </div>
      </form>
    </div>  
  );
}
