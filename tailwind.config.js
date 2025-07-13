/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mimivibes: {
          "primary": "#629c6b",
          "primary-focus": "#578b60", 
          "primary-content": "#ffffff",
          "secondary": "#66836a",
          "secondary-focus": "#58795d",
          "secondary-content": "#ffffff", 
          "accent": "#de5b25",
          "accent-focus": "#c04f20",
          "accent-content": "#ffffff",
          "neutral": "#bfb8b1",
          "neutral-focus": "#a8a29e",
          "neutral-content": "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f3f2f0", 
          "base-300": "#e0dfdc",
          "base-content": "#1f2937",
          "info": "#2094f3",
          "success": "#629c6b",
          "warning": "#ffcc00", 
          "error": "#de5b25",
        },
      },
    ],
  },
}