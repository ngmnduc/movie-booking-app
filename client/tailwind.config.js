/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F0F0F", 
        surface: "#1A1A1A",
        
        // --- BỘ MÀU AURORA ---
        // Màu chính dùng cho các đường viền đơn sắc
        primary: "#7cff67", 
        
        // 3 màu cấu thành nên dải Aurora
        "aurora-green": "#7cff67",
        "aurora-purple": "#B19EEF",
        "aurora-blue": "#5227FF",
      },
      animation: {
        blob: "blob 10s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
}