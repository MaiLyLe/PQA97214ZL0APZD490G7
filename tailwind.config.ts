import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          red: '#ec503d',
          pink: '#ffe7ea',
        },
        grey: {
          'super-light': '#f4f4f4',
          light: '#ded9d9',
          medium: '#CACACA',
          dark: '#909090',
          'super-dark': '#202020',
        },
      },
      backgroundImage: {
        'radial-pink-to-blue-pastel':
          'radial-gradient(circle at 10% 20%, rgb(248, 219, 219) 0%, rgb(229, 248, 250) 90%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
