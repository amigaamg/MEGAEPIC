/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amexan: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        midnight: {
          50: '#f0f1f5',
          100: '#d4d6e3',
          200: '#a9adc7',
          300: '#7e84ab',
          400: '#535b8f',
          500: '#283273',
          600: '#1b234f',
          700: '#12193a',
          800: '#0b1230',
          900: '#071029',
          DEFAULT: '#071029',
        },
        therapeutic: {
          green: '#00d68f',
          amber: '#ffb020',
          red: '#ff4560',
          purple: '#7c5af5',
          teal: '#00e5cc',
        },
        frost: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 0 20px rgba(0,0,0,0.2)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(0,229,204,0.15)',
        'glow-green': '0 0 20px rgba(0,214,143,0.15)',
        'glow-red': '0 0 20px rgba(255,69,96,0.15)',
        'glow-purple': '0 0 20px rgba(124,90,245,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'draw-line': 'drawLine 1.5s ease-out forwards',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,229,204,0.4)' },
          '70%': { boxShadow: '0 0 0 12px transparent' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        drawLine: {
          to: { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
