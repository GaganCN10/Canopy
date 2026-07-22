/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canopy: {
          forest: {
            950: '#0F1B14',
            800: '#16321F',
            600: '#2C5E3D',
            400: '#4F8A5D',
          },
          moss: {
            300: '#A9C4A4',
          },
          bark: {
            700: '#6B4E3A',
          },
          clay: {
            500: '#C97B4A',
          },
          sand: {
            50: '#FBF9F4',
            100: '#F5F1E8',
          },
          ink: {
            900: '#1C2420',
          },
          mist: {
            200: '#E7E9E2',
          },
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'ambient': '0 8px 30px rgba(15,27,20,0.06)',
        'ambient-lg': '0 12px 40px rgba(15,27,20,0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
