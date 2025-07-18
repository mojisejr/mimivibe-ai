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
          // --- Primary (Original Green) ---
          "primary": "#629c6b",          // Green for growth, nature
          "primary-focus": "#578b60", 
          "primary-content": "#ffffff",  // White text on primary background

          // --- Secondary (NEW: Deep Muted Green for accentuation) ---
          "secondary": "#3D5B42",         // Deeper, muted green for contrasting elements
          "secondary-focus": "#304A35",
          "secondary-content": "#ffffff", // White text on dark secondary

          // --- Accent (Golden Orange, pops beautifully on light orange base) ---
          "accent": "#FE9F60",           // Elegant Golden Orange
          "accent-focus": "#E58B4A",     // Slightly darker for focus
          "accent-content": "#ffffff",   // White text on accent background

          // --- Neutral (Light, warm beige/cream for subtle distinctions) ---
          "neutral": "#F5EBE0",          // Very light, warm beige/cream
          "neutral-focus": "#EDDED2",
          "neutral-content": "#4A3B30",  // Dark warm brown-grey text on light neutral

          // --- Base Colors (NEW: Light Orange-Cream Base) ---
          "base-100": "#FFF3E6",         // Very light, elegant peach/cream orange for main background
          "base-200": "#FFEEDD",         // Slightly darker base
          "base-300": "#FFE7D4",         // Even darker base
          "base-content": "#4A3B30",     // Dark warm brown-grey for main text content (Elegant & Readable)

          // --- Semantic Colors (Standard DaisyUI colors, adjusted for contrast on warm light backgrounds) ---
          "info": "#2094f3",            
          "success": "#629c6b",         // Primary green still signals success
          "warning": "#ffbe00",         
          "error": "#de5b25",           // Original accent orange for error, good contrast
        },
      },
      "dark", // Optional: Keep default dark theme if needed for testing
      "light", // Optional: Keep default light theme if needed for testing
    ],
  },
};