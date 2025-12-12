/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD6D6',
          300: '#FFB6C1', // 主色调 - 温暖的橙粉色
          400: '#FF9AA2',
          500: '#FF7D87',
          600: '#FF5A65',
          700: '#FF3A45',
          800: '#FF1A25',
          900: '#E6001A',
        },
        warm: {
          50: '#FEFCFA',
          100: '#FCF8F4',
          200: '#F9F2E8', // 米白色背景
          300: '#F5E9D8',
          400: '#EFDBC0',
          500: '#E8C9A0',
          600: '#DDB37A',
          700: '#D09C5A',
          800: '#C08540',
          900: '#B07030',
        }
      },
      fontFamily: {
        cute: ['"Comic Sans MS"', '"cursive"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'cute': '0 4px 20px rgba(255, 182, 193, 0.3)',
        'cute-hover': '0 8px 30px rgba(255, 182, 193, 0.4)',
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
