/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  // FORCES Tailwind to compile these classes even if it can't find them in the JS
  safelist: [
    'bg-emerald-500',
    'bg-rose-500',
    'text-emerald-500',
    'text-rose-500',
    'text-yellow-400'
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        althera: ['Althera', 'serif'],
      },
      colors: {
        // Material-style surface tokens
        surface: {
          DEFAULT: '#fff8f6',
          dim: '#ebd6cd',
          bright: '#fff8f6',
          'container-lowest': '#ffffff',
          'container-low': '#fff1eb',
          'container': '#ffeae1',
          'container-high': '#fae4db',
          'container-highest': '#f4ded5',
          tint: '#9f4200',
          variant: '#f4ded5',
        },
        'on-surface': {
          DEFAULT: '#241914',
          variant: '#574238',
        },
        'inverse-surface': '#3a2e28',
        'inverse-on-surface': '#ffede6',

        // Primary palette
        primary: {
          DEFAULT: '#9f4200',
          container: '#f97d36',
          fixed: '#ffdbcb',
          'fixed-dim': '#ffb692',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#602500',
          fixed: '#341100',
          'fixed-variant': '#793100',
        },
        'inverse-primary': '#ffb692',

        // Secondary palette
        secondary: {
          DEFAULT: '#855316',
          container: '#ffbc76',
          fixed: '#ffdcbd',
          'fixed-dim': '#fcb973',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#79490b',
          fixed: '#2c1600',
          'fixed-variant': '#683c00',
        },

        // Tertiary palette
        tertiary: {
          DEFAULT: '#006783',
          container: '#00adda',
          fixed: '#bce9ff',
          'fixed-dim': '#61d4ff',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#003c4e',
          fixed: '#001f29',
          'fixed-variant': '#004d63',
        },

        // Error palette
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },

        // Outline
        outline: {
          DEFAULT: '#8b7266',
          variant: '#dec0b3',
        },

        // Brand-level design system overrides
        brand: {
          orange: '#F97D36',
          'orange-hover': '#ffb692',
          heading: '#0F172A',
          body: '#64748B',
          border: '#E2E8F0',
          'bg-secondary': '#F8FAFC',
        },
      },
      fontSize: {
        'h1': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1-mobile': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['30px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm-space': '8px',
        'md-space': '16px',
        'lg-space': '24px',
        'xl-space': '40px',
        '2xl-space': '64px',
        'gutter': '24px',
        'container-max': '1280px',
      },
      maxWidth: {
        'container': '1280px',
      },
      boxShadow: {
        'soft': '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 60px 20px rgba(249, 125, 54, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.8s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
