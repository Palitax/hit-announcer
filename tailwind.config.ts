import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090e',
        surface: {
          DEFAULT: '#0f131f',
          muted: '#151b2c',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#1b2338',
        },
      },
      aspectRatio: {
        card: '2.5 / 3.5',
      },
      animation: {
        'idle-sheen': 'idleSheen 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'idle-float': 'idleFloat 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        idleSheen: {
          '0%': { transform: 'translateX(-120%) rotate(25deg)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '85%': { opacity: '0.9' },
          '100%': { transform: 'translateX(220%) rotate(25deg)', opacity: '0' },
        },
        idleFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(0.5deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
