import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifs, setNotifs] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifs((prev) => {
      const notif = prev.find(n => n.id === id);
      if (notif?.timeoutId) clearTimeout(notif.timeoutId);
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const addNotification = useCallback((msg) => {
    setNotifs((prev) => {
      if (prev.some(n => n.msg === msg)) return prev;

      const id = Date.now();
      const timeoutId = setTimeout(() => removeNotification(id), 5000);
      return [...prev, { id, msg, timeoutId }];
    });
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}

      <div className="fixed bottom-4 right-4 sm:right-6 sm:bottom-6 max-w-full sm:max-w-sm w-[90vw] sm:w-auto z-50 space-y-2 pointer-events-none">
        {notifs.map(n => (
          <div
            key={n.id}
            role="alert"
            aria-live="polite"
            className="pointer-events-auto animate-fade-in bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex justify-between items-center"
          >
            <span className="text-sm">{n.msg}</span>
            <button
              onClick={() => removeNotification(n.id)}
              className="ml-4 text-white hover:text-gray-200 font-bold"
              aria-label="Закрити сповіщення"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
