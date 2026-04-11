/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: '#e8e8e6',
        background: '#fafafa',
        foreground: '#191919',
        muted: { DEFAULT: '#f7f7f5', foreground: '#8c8c8c' },
        sidebar: '#f7f7f5',
        card: { DEFAULT: '#ffffff', foreground: '#191919' },
        primary: { DEFAULT: '#191919', foreground: '#ffffff' },
        destructive: { DEFAULT: '#dc2626', foreground: '#ffffff' },
        ring: '#191919',
        status: {
          todo: '#92400e',
          progress: '#2563eb',
          done: '#16a34a',
          blocked: '#dc2626',
        },
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 8px 32px rgba(0,0,0,0.12)',
      },
      keyframes: {
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
