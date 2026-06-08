/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core Colors */
        background: 'var(--color-background)', // warm off-white
        foreground: 'var(--color-foreground)', // rich charcoal
        border: 'var(--color-border)', // light gray
        input: 'var(--color-input)', // pure white
        ring: 'var(--color-ring)', // professional blue
        
        /* Card Colors */
        card: {
          DEFAULT: 'var(--color-card)', // pure white
          foreground: 'var(--color-card-foreground)' // rich charcoal
        },
        
        /* Popover Colors */
        popover: {
          DEFAULT: 'var(--color-popover)', // pure white
          foreground: 'var(--color-popover-foreground)' // rich charcoal
        },
        
        /* Muted Colors */
        muted: {
          DEFAULT: 'var(--color-muted)', // very light gray
          foreground: 'var(--color-muted-foreground)' // sophisticated slate
        },
        
        /* Primary Colors */
        primary: {
          DEFAULT: 'var(--color-primary)', // professional blue
          foreground: 'var(--color-primary-foreground)' // white
        },
        
        /* Secondary Colors */
        secondary: {
          DEFAULT: 'var(--color-secondary)', // sophisticated slate
          foreground: 'var(--color-secondary-foreground)' // white
        },
        
        /* Destructive Colors */
        destructive: {
          DEFAULT: 'var(--color-destructive)', // clear red
          foreground: 'var(--color-destructive-foreground)' // white
        },
        
        /* Accent Colors */
        accent: {
          DEFAULT: 'var(--color-accent)', // success-oriented emerald
          foreground: 'var(--color-accent-foreground)' // white
        },
        
        /* Success Colors */
        success: {
          DEFAULT: 'var(--color-success)', // success-oriented emerald
          foreground: 'var(--color-success-foreground)' // white
        },
        
        /* Warning Colors */
        warning: {
          DEFAULT: 'var(--color-warning)', // professional amber
          foreground: 'var(--color-warning-foreground)' // white
        },
        
        /* Error Colors */
        error: {
          DEFAULT: 'var(--color-error)', // clear red
          foreground: 'var(--color-error-foreground)' // white
        },
        
        /* Surface Color */
        surface: 'var(--color-surface)', // pure white
        
        /* Text Colors */
        'text-primary': 'var(--color-text-primary)', // rich charcoal
        'text-secondary': 'var(--color-text-secondary)' // sophisticated slate
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)'
      },
      boxShadow: {
        'professional': '0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.1)',
        'floating': '0 10px 25px rgba(0, 0, 0, 0.1), 0 20px 40px rgba(0, 0, 0, 0.06)'
      },
      animation: {
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite'
      },
      keyframes: {
        'gentle-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        }
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms'
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out'
      },
      zIndex: {
        'navigation': '1000',
        'call-status': '1010',
        'emergency': '1020',
        'dropdown': '1030',
        'call-interface': '1100',
        'modal': '1200'
      },
      spacing: {
        '15': '3.75rem',
        '18': '4.5rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate')
  ],
}