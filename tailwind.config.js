module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fff7f4",
          100: "#ffe4dd",
          200: "#ffc8ba",
          300: "#ffab97",
          400: "#ff8f74",
          500: "#f43f5e",
          600: "#e02c4e",
          700: "#c81939",
          800: "#b00d3e",
          900: "#800530",
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
