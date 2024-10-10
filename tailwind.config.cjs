/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'hf-base-light': '#FAF9F6',
        'hf-base-dark': '#121212',
        'hf-orange': '#FFC299',
        'hf-blue': '#C6DEFF',
        'hf-grey': '#E6E6E6',
        'hf-navy': '#346392',
      },
    },
    fontFamily: {
      sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      serif: [...defaultTheme.fontFamily.serif],
      mono: [...defaultTheme.fontFamily.mono],
    },
    fontSize: {
      title: '5rem',
      'heading-1': '4rem',
      'heading-2': '3rem',
      'heading-3': '2.25rem',
      'heading-4': '1.75rem',
      'heading-5': '1.375rem',
      'body-1': '1rem',
      'body-2': '.875rem',
      caption: '.75rem',
      tiny: '.652rem',
    },
  },
  plugins: [],
};
