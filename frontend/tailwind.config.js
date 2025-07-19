// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Основні кольори
        primary: {
          DEFAULT: '#5D4037',
          hover: '#4E342E',
          focus: '#3E2723',
        },
        secondary: {
          DEFAULT: '#A1887F',
          10: '#A1887F1A',
          hover: '#8D6E63',
          focus: '#6D4C41',
        },
        accent: {
          DEFAULT: '#FFF8E1',
          hover: '#FFECB3',
        },

        // Товари
        product_primary: {
          DEFAULT: '#6D4C41',
          10: '#6D4C411A',
          hover: '#5D4037',
          focus: '#4E342E',
        },
        product_accent: {
          DEFAULT: '#FFD54F',
          hover: '#FFCA28',
        },

        // Системні кольори
        danger: {
          DEFAULT: '#D84315',
          hover: '#BF360C',
          focus: '#A52714',
        },
        success: {
          DEFAULT: '#388E3C',
          hover: '#2E7D32',
          focus: '#1B5E20',
        },
        info: {
          DEFAULT: '#64B5F6',
          hover: '#42A5F5',
        },

        // Текст
        'text-main': '#3E2723',
        'text-soft': '#795548',

        // Додаткові
        highlight: '#FFF3E0',
        base: '#F9F9F7', // або щось нейтральне, не біле
      },
    },
  },
  plugins: [],
}
