/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware neutral scale (dark by default, inverted in light mode via CSS variables)
        white: v('white'),
        slate: {
          50: v('s50'),
          100: v('s100'),
          200: v('s200'),
          300: v('s300'),
          400: v('s400'),
          500: v('s500'),
          600: v('s600'),
          700: v('s700'),
          800: v('s800'),
          900: v('s900'),
          950: v('s950'),
        },
        brand: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#fecbaa',
          300: v('b300'),
          400: v('b400'),
          500: '#ff6b2c',
          600: '#ea5414',
          700: '#c24110',
          800: '#9b3614',
          900: '#7c2f13',
          950: '#431507',
          accent: '#ffb020',
          cyan: '#06b6d4',
          orange: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(255, 107, 44, 0.45)',
        soft: '0 20px 50px -20px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 5s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1.2s infinite',
        marquee: 'marquee 35s linear infinite',
        'fade-up': 'fadeUp .6s ease both',
        'spin-slow': 'spin 14s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
