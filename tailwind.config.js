/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        vesper: {
          bg: '#000000',
          card: '#0a0a0a',
          surface: '#111111',
          'surface-hover': '#171717',
          border: 'rgba(255, 255, 255, 0.16)',
          'border-soft': 'rgba(255, 255, 255, 0.12)',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
          text: '#FFFFFF',
          secondary: '#D8D8D8',
          muted: '#9A9A9A',
          dim: '#666666',
        },
        brand: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
          600: '#3f3f46',
          700: '#27272a',
          800: '#18181b',
          900: '#09090b',
          950: '#000000',
        },
      },
      backgroundImage: {
        'liquid-metal': 'linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%)',
        'liquid-metal-hover': 'linear-gradient(180deg, #ffffff 0%, #f4f4f4 45%, #dadada 100%)',
        'dark-metal': 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
        'dark-metal-hover': 'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.06) 100%)',
        'glow-radial': 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
      },
      boxShadow: {
        'metal-glow': '0 0 20px -2px rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0, 0, 0, 0.8)',
        'metal-glow-hover': '0 0 28px -2px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.9)',
        'vesper-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'vesper-card-hover': '0 16px 40px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.16)',
        'glow-sm': '0 0 15px -3px rgba(255, 255, 255, 0.15)',
        'glow-md': '0 0 25px -5px rgba(255, 255, 255, 0.25)',
        'danger-glow': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
