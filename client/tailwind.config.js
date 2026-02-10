/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F0F0F", // Màu nền đen
        surface: "#1A1A1A",    // Màu nền các thẻ card
        primary: "#E11D48",    // Màu đỏ chủ đạo
      },
    },
  },
  plugins: [],
}