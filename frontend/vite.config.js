// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // зчитаємо всі змінні з .env(.development/.production)
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [react()],
    define: {
      // створюємо глобальну константу __BACKEND_URL__
      __BACKEND_URL__: JSON.stringify(env.BACKENDURL)
    }
  })
}
