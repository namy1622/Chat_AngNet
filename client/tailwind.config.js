/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // mau chu dao (xanh duong dam chat)
        primary: '#2563EB', // blue-600
        hover: '#1D4ED8',   // blue-700
        foreground: '#FFFFFF', // white

      },
      // mau nen
      surface: {
        DEFAULT: '#FFFFFF', // white
        muted: '#F3F4F6', // gray-100

      },
      // mau chu
      text: {
        main: '#111827',    // gray-900
        muted: '#6B7280',   // gray-500
      },
      status: {
        online: '#22C55E',  // green-500
        offline: '#9CA3AF', // gray-400
        danger: '#EF4444',  // red-500
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'], // font chu chinh
    }
  },
  plugins: [],
}
