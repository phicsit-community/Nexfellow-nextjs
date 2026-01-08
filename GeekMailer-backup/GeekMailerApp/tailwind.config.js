/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#26B2B4',  // Main color for center text
        secondary: '#56AFB2', // Example for another color
      },
      gradientColorStops: {
        'custom-gradient-1': 'rgba(102, 214, 209, 0)',
        'custom-gradient-2': 'rgba(102, 214, 209, 0.16)',
        'custom-gradient-3': '#0E6F6B',
        'custom-gradient-4': '#08AAA2',
        'custom-gradient-5': '#5CD7D1',
      },
      borderImageSource: {
        'gradient-border': 'linear-gradient(90deg, rgba(102, 214, 209, 0) 0%, rgba(102, 214, 209, 0.16) 50%, rgba(102, 214, 209, 0) 100%)',
      },
      backgroundImage: {
        'gradient-bg-1': 'linear-gradient(161.1deg, #0E6F6B 0%, #56AFB2 104.04%)',
        'gradient-bg-2': 'linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, #56AFB2 0%, #08AAA2 74.41%, #56AFB2 100%)',
        'gradient-bg-3': 'linear-gradient(269.51deg, #5CD7D1 0%, #08AAA2 100%)',
        'text-gradient': 'linear-gradient(161.1deg, #0E6F6B 0%, #56AFB2 104.04%)',
        'button-gradient': 'linear-gradient(269.51deg, #5CD7D1 0%, #08AAA2 100%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const textGradients = theme('backgroundImage');
      const textGradientUtilities = Object.keys(textGradients).map(key => ({
        [`.text-${key}`]: {
          background: textGradients[key],
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      }));
      addUtilities(textGradientUtilities, ['responsive', 'hover']);
    },
  ]
}
