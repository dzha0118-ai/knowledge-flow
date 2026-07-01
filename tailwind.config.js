/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0a0a1a',
          deeper: '#060612',
          blue: '#1a1a4e',
          purple: '#2d1b4e',
          accent: '#4B7BFF',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['"ZCOOL QingKe HuangYou"', '"Noto Sans SC"', '"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans SC"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'orbit-reverse': 'orbit 15s linear infinite reverse',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { '--gradient-x': '30%', '--gradient-y': '20%' },
          '25%': { '--gradient-x': '70%', '--gradient-y': '60%' },
          '50%': { '--gradient-x': '60%', '--gradient-y': '80%' },
          '75%': { '--gradient-x': '20%', '--gradient-y': '50%' },
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a4e 50%, #2d1b4e 100%)',
      },
    },
  },
  plugins: [],
}
