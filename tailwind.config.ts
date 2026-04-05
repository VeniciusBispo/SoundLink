import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
          accent: 'rgb(var(--brand-accent) / <alpha-value>)',
          black: 'rgb(var(--brand-black) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          card: 'rgb(var(--brand-card) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
          text: 'rgb(var(--brand-text) / <alpha-value>)',
          white: '#F8FAFC',     // Slate 50 (static)
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      height: {
        player: '90px',
      },
      gridTemplateColumns: {
        sidebar: '240px 1fr',
      },
    },
  },
  plugins: [],
}

export default config
