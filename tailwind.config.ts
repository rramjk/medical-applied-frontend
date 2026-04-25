import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/shared/**/*.{ts,tsx}',
    './src/entities/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/widgets/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        foreground: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
        card: '#FFFFFF',
        primary: '#0EA5E9',
        secondary: '#E0F2FE',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
