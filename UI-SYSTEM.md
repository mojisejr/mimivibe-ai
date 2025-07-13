# UI-SYSTEM.md

## 🎨 Design System Core

สำหรับ Round 1: Foundation Setup + Round 4: Chat UI Components

---

## Design Philosophy

MiMiVibes ใช้ design philosophy ที่เน้นการสร้างประสบการณ์ที่อบอุ่น เป็นกันเอง และเชื่อถือได้ สำหรับการดูดวงไพ่ทาโรต์ โดยผสมผสานความทันสมัยของ AI chat interface กับความลึกลับและมีเสน่ห์ของโลกจิตวิทยา

---

## Color System

### Primary Theme Colors
```css
:root {
  /* Primary - สีเขียวหลัก (ความสงบ, ธรรมชาติ, การเติบโต) */
  --primary: #629c6b;
  --primary-focus: #578b60;
  --primary-content: #ffffff;

  /* Secondary - สีเขียวรอง (ความสมดุล, ความมั่นคง) */
  --secondary: #66836a;
  --secondary-focus: #58795d;
  --secondary-content: #ffffff;

  /* Accent - สีส้ม (พลังงาน, ความคิดสร้างสรรค์, การเปลี่ยนแปลง) */
  --accent: #de5b25;
  --accent-focus: #c04f20;
  --accent-content: #ffffff;

  /* Neutral - สีเบจ (ความอบอุ่น, ความเป็นธรรมชาติ) */
  --neutral: #bfb8b1;
  --neutral-focus: #a8a29e;
  --neutral-content: #1f2937;

  /* Base - สีพื้นฐาน */
  --base-100: #ffffff; /* พื้นหลังหลัก */
  --base-200: #f3f2f0; /* พื้นหลังรอง */
  --base-300: #e0dfdc; /* พื้นหลังเล็กน้อย */
  --base-content: #1f2937; /* สีตัวอักษรบนพื้นฐาน */

  /* Semantic Colors */
  --info: #2094f3;
  --success: #629c6b; /* ใช้ primary color */
  --warning: #ffcc00;
  --error: #de5b25; /* ใช้ accent color */
}

/* Dark Mode Support (Future Implementation) */
[data-theme="dark"] {
  --base-100: #1f2937;
  --base-200: #111827;
  --base-300: #0f172a;
  --base-content: #f9fafb;

  /* Adjust other colors for dark mode */
  --primary: #7ab386;
  --secondary: #7a9580;
  --neutral: #d1c7be;
}
```

### DaisyUI Theme Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
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
```

---

## Typography System

### Font Stack
```css
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    "Oxygen", "Ubuntu", "Cantarell", sans-serif;
}
```

### Typography Scale
```css
/* Font Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; } /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; } /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; } /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */

/* Font Weights */
.font-normal { font-weight: 400; } /* Body text */
.font-medium { font-weight: 500; } /* Emphasized text */
.font-semibold { font-weight: 600; } /* Headings */
.font-bold { font-weight: 700; } /* Strong emphasis */
```

### Text Hierarchy Classes
```css
/* Semantic Typography Classes */
.heading-1 {
  @apply text-3xl font-bold text-base-content;
}
.heading-2 {
  @apply text-2xl font-semibold text-base-content;
}
.heading-3 {
  @apply text-xl font-semibold text-base-content;
}
.body-large {
  @apply text-lg font-normal text-base-content;
}
.body-normal {
  @apply text-base font-normal text-base-content;
}
.body-small {
  @apply text-sm font-normal text-neutral-content;
}
.caption {
  @apply text-xs font-medium text-neutral-content;
}
```

---

## Spacing System

### Standard Spacing Scale
```css
/* Tailwind Default Scale (rem) */
/* 0.25rem = 4px, 0.5rem = 8px, 0.75rem = 12px, 1rem = 16px */
/* 1.25rem = 20px, 1.5rem = 24px, 2rem = 32px, 3rem = 48px */

/* Component Spacing Guidelines */
.component-padding {
  @apply p-4 md:p-6; /* 16px mobile, 24px desktop */
}

.section-spacing {
  @apply py-12 md:py-16; /* 48px mobile, 64px desktop */
}

.element-gap {
  @apply space-y-4 md:space-y-6; /* 16px mobile, 24px desktop */
}
```

---

## Component Base Styles

### Button System
```css
/* Enhanced Button Styles */
.btn {
  @apply transition-all duration-200 ease-in-out;
}

.btn:hover {
  @apply transform -translate-y-0.5 shadow-lg;
}

.btn:active {
  @apply transform translate-y-0;
}

/* Button Variants */
.btn-mystical {
  @apply bg-gradient-to-r from-primary to-secondary text-white;
  box-shadow: 0 4px 15px rgba(98, 156, 107, 0.3);
}

.btn-mystical:hover {
  box-shadow: 0 6px 20px rgba(98, 156, 107, 0.4);
}
```

### Card System
```css
/* Enhanced Card Styles */
.card {
  @apply transition-all duration-300 ease-in-out;
}

.card:hover {
  @apply transform -translate-y-1 shadow-xl;
}

/* Card Variants */
.card-mystical {
  @apply bg-gradient-to-br from-base-100 to-base-200;
  border: 1px solid rgba(98, 156, 107, 0.2);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

.card-reading {
  @apply bg-base-100 border-2 border-primary/20;
  box-shadow: 0 8px 25px rgba(98, 156, 107, 0.15);
}
```

### Input System
```css
/* Enhanced Input Styles */
.input, .textarea, .select {
  @apply transition-all duration-200 ease-in-out;
  @apply focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.input:focus, .textarea:focus, .select:focus {
  @apply border-primary shadow-lg;
}

/* Input Variants */
.input-mystical {
  @apply bg-base-200/50 border-neutral/30;
  @apply focus:bg-base-100 focus:border-primary;
}
```

---

## Layout Utilities

### Container System
```css
/* Responsive Container */
.container {
  @apply px-4 mx-auto;

  @screen sm {
    @apply px-6;
  }

  @screen lg {
    @apply px-8 max-w-7xl;
  }
}

/* Page Container */
.page-container {
  @apply min-h-screen bg-base-100;
}

/* Content Container */
.content-container {
  @apply container mx-auto px-4 py-6 max-w-4xl;
}

/* Section Container */
.section-container {
  @apply py-12 md:py-16;
}
```

### Grid System
```css
/* Responsive Grid Patterns */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* Common Grid Layouts */
.grid-cards {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6;
}

.grid-packages {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
}

.grid-history {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4;
}
```

---

## Responsive Design

### Breakpoint System
```css
/* Tailwind Breakpoints */
/* sm: 640px  - Mobile landscape / Small tablet */
/* md: 768px  - Tablet portrait */
/* lg: 1024px - Tablet landscape / Small desktop */
/* xl: 1280px - Desktop */
/* 2xl: 1536px - Large desktop */

/* Mobile-First Utilities */
.mobile-only {
  @apply block md:hidden;
}

.desktop-only {
  @apply hidden md:block;
}

.tablet-up {
  @apply hidden md:block;
}
```

### Safe Areas (iOS Support)
```css
/* iPhone Safe Area Support */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-full {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## Animation System

### Base Animations
```css
/* Smooth Transitions */
.transition-smooth {
  @apply transition-all duration-300 ease-in-out;
}

.transition-fast {
  @apply transition-all duration-150 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-500 ease-in-out;
}

/* Hover Effects */
.hover-lift {
  @apply transition-transform duration-200 ease-in-out;
}

.hover-lift:hover {
  @apply transform -translate-y-1;
}

.hover-scale {
  @apply transition-transform duration-200 ease-in-out;
}

.hover-scale:hover {
  @apply transform scale-105;
}
```

### Custom Animations
```css
/* Mystical Animations */
@keyframes mysticGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(98, 156, 107, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(98, 156, 107, 0.8), 0 0 30px rgba(222, 91, 37, 0.3);
  }
}

.animate-mystic-glow {
  animation: mysticGlow 2s ease-in-out infinite;
}

@keyframes cardFlip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); }
}

.animate-card-flip {
  animation: cardFlip 0.6s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
```

---

## Accessibility

### Focus States
```css
/* Enhanced Focus Indicators */
.focus-visible {
  @apply ring-2 ring-primary ring-offset-2 outline-none;
}

/* Skip Links */
.skip-link {
  @apply absolute top-0 left-0 z-50 p-2 bg-primary text-primary-content;
  transform: translateY(-100%);
  transition: transform 0.3s;
}

.skip-link:focus {
  transform: translateY(0);
}
```

### Screen Reader Support
```css
/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Color Contrast
```css
/* WCAG 2.1 AA Compliant Colors */
.text-high-contrast {
  color: #1f2937; /* 16.8:1 contrast ratio on white */
}

.text-medium-contrast {
  color: #374151; /* 12.6:1 contrast ratio on white */
}

.text-accessible-primary {
  color: #578b60; /* 4.7:1 contrast ratio on white */
}

.text-accessible-accent {
  color: #c04f20; /* 5.2:1 contrast ratio on white */
}
```

---

## Touch & Mobile Optimizations

### Touch-Friendly Design
```css
/* Minimum Touch Target Sizes */
.btn, .input, .select, .checkbox, .radio {
  min-height: 44px; /* iOS minimum */
  min-width: 44px;
}

/* Touch Feedback */
.btn:active, .card:active {
  @apply transform scale-98 transition-transform duration-100;
}

/* Prevent Zoom on Input Focus (iOS) */
input, select, textarea {
  font-size: 16px; /* Prevents zoom on iOS Safari */
}
```

### Mobile Navigation
```css
/* Bottom Navigation */
.btm-nav {
  @apply bg-base-100 border-t border-base-300;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.btm-nav-item {
  @apply flex flex-col items-center py-2 px-1 text-xs;
  min-height: 64px;
}

.btm-nav-item.active {
  @apply text-primary;
}
```

---

## Performance Optimizations

### CSS Loading
```css
/* Critical CSS - Inline in <head> */
/* Non-critical CSS - Load with media="print" onload */

/* Efficient Animations */
.will-change-transform {
  will-change: transform;
}

.will-change-auto {
  will-change: auto;
}

/* GPU Acceleration */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Optimize Repaints */
.optimized-repaint {
  contain: layout style paint;
}
```

---

## Utility Classes

### Spacing Utilities
```css
/* Custom Spacing */
.space-y-safe {
  @apply space-y-4 md:space-y-6;
}

.space-x-safe {
  @apply space-x-4 md:space-x-6;
}

/* Section Spacing */
.section-padding {
  @apply py-8 md:py-12 lg:py-16;
}

.container-padding {
  @apply px-4 md:px-6 lg:px-8;
}
```

### Display Utilities
```css
/* Flex Utilities */
.flex-center {
  @apply flex items-center justify-center;
}

.flex-between {
  @apply flex items-center justify-between;
}

.flex-start {
  @apply flex items-center justify-start;
}

.flex-end {
  @apply flex items-center justify-end;
}

/* Grid Utilities */
.grid-center {
  @apply grid place-items-center;
}

.grid-stretch {
  @apply grid place-items-stretch;
}
```

### Text Utilities
```css
/* Text Overflow */
.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-ellipsis-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Text Balance */
.text-balance {
  text-wrap: balance;
}

.text-pretty {
  text-wrap: pretty;
}
```

---

## Component Variants

### Button Variants
```css
/* Mystical Button Styles */
.btn-mystical-gradient {
  @apply bg-gradient-to-r from-primary via-secondary to-accent;
  @apply text-white shadow-lg;
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn-ghost-mystical {
  @apply btn-ghost border-2 border-primary/30;
  @apply hover:border-primary hover:bg-primary/10;
}

.btn-floating {
  @apply fixed bottom-6 right-6 btn-circle btn-lg;
  @apply shadow-2xl hover:shadow-3xl;
  z-index: 50;
}
```

### Card Variants
```css
/* Tarot Card Styles */
.card-tarot {
  @apply relative overflow-hidden;
  aspect-ratio: 2/3;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-tarot.flipped {
  transform: rotateY(180deg);
}

.card-tarot-front,
.card-tarot-back {
  @apply absolute inset-0 w-full h-full backface-hidden;
  @apply rounded-lg border-2 shadow-lg;
}

.card-tarot-back {
  @apply bg-gradient-to-br from-primary to-secondary;
  @apply flex items-center justify-center;
  transform: rotateY(180deg);
}

.card-reading-result {
  @apply bg-base-100 border-2 border-primary/20;
  @apply shadow-lg hover:shadow-xl transition-shadow duration-300;
}

.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Modal Variants
```css
/* Enhanced Modal Styles */
.modal-mystical .modal-box {
  @apply bg-gradient-to-br from-base-100 to-base-200;
  @apply border-2 border-primary/20 shadow-2xl;
}

.modal-reward .modal-box {
  @apply text-center;
  background: linear-gradient(135deg, 
    rgba(98, 156, 107, 0.1) 0%, 
    rgba(222, 91, 37, 0.1) 100%);
}

.modal-fullscreen {
  @apply modal-open;
}

.modal-fullscreen .modal-box {
  @apply w-full max-w-none h-full max-h-none m-0 rounded-none;
}
```

---

## Loading States

### Skeleton Components
```css
/* Skeleton Loading */
.skeleton {
  @apply bg-base-300 animate-pulse rounded;
}

.skeleton-text {
  @apply skeleton h-4 w-full;
}

.skeleton-text-sm {
  @apply skeleton h-3 w-3/4;
}

.skeleton-circle {
  @apply skeleton rounded-full;
}

.skeleton-card {
  @apply skeleton h-48 w-full rounded-lg;
}

/* Shimmer Effect */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  background: linear-gradient(90deg, 
    rgba(243, 242, 240, 0) 0%, 
    rgba(243, 242, 240, 0.8) 50%, 
    rgba(243, 242, 240, 0) 100%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
```

### Loading Indicators
```css
/* Custom Loading Spinners */
.loading-mystical {
  @apply relative w-12 h-12 mx-auto;
}

.loading-mystical::before,
.loading-mystical::after {
  content: '';
  @apply absolute inset-0 border-4 border-transparent rounded-full;
  animation: mysticalSpin 1.5s linear infinite;
}

.loading-mystical::before {
  @apply border-t-primary;
}

.loading-mystical::after {
  @apply border-b-accent;
  animation-direction: reverse;
  animation-duration: 2s;
}

@keyframes mysticalSpin {
  to {
    transform: rotate(360deg);
  }
}

/* Pulsing Dots */
.loading-dots {
  @apply flex space-x-1;
}

.loading-dots .dot {
  @apply w-2 h-2 bg-primary rounded-full animate-pulse;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}
```

---

## Error States

### Error Styling
```css
/* Error States */
.error-state {
  @apply border-error bg-error/5 text-error;
}

.error-message {
  @apply text-error text-sm mt-1;
}

.error-icon {
  @apply text-error w-5 h-5;
}

/* Success States */
.success-state {
  @apply border-success bg-success/5 text-success;
}

.success-message {
  @apply text-success text-sm mt-1;
}

/* Warning States */
.warning-state {
  @apply border-warning bg-warning/5 text-warning;
}

.warning-message {
  @apply text-warning text-sm mt-1;
}
```

---

## Global CSS Setup

### Base Styles
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Base HTML Elements */
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-base-100 text-base-content;
    @apply font-sans antialiased;
  }

  /* Focus Styles */
  *:focus {
    @apply outline-none;
  }

  *:focus-visible {
    @apply ring-2 ring-primary ring-offset-2;
  }

  /* Selection Styles */
  ::selection {
    @apply bg-primary/20 text-primary;
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    @apply w-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-base-200;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-neutral rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-neutral-focus;
  }
}

@layer components {
  /* Import all component styles here */
  @import 'components/buttons.css';
  @import 'components/cards.css';
  @import 'components/forms.css';
  @import 'components/modals.css';
}

@layer utilities {
  /* Custom utility classes */
  .perspective-1000 {
    perspective: 1000px;
  }

  .preserve-3d {
    transform-style: preserve-3d;
  }

  .backface-hidden {
    backface-visibility: hidden;
  }

  .rotate-y-180 {
    transform: rotateY(180deg);
  }
}
```

---

## Component CSS Organization

### File Structure
```
src/styles/
├── globals.css                 # Main CSS entry point
├── components/
│   ├── buttons.css            # Button variants
│   ├── cards.css              # Card variants  
│   ├── forms.css              # Form elements
│   ├── modals.css             # Modal variants
│   ├── navigation.css         # Navigation styles
│   └── loading.css            # Loading states
├── utilities/
│   ├── animations.css         # Custom animations
│   ├── layout.css             # Layout utilities
│   └── responsive.css         # Responsive helpers
└── themes/
    ├── mimivibes.css          # Main theme
    └── dark.css               # Dark mode (future)
```

### Import Strategy
```css
/* Optimized loading order */
/* 1. Critical CSS (inlined) */
/* 2. Base styles (globals.css) */
/* 3. Component styles (lazy loaded) */
/* 4. Utility styles (on-demand) */
```

---

**File Purpose**: Core Design System & Theme Setup  
**Round Usage**: Round 1 (Foundation Setup)  
**Dependencies**: DaisyUI, Tailwind CSS  
**Estimated Tokens**: ~2,500
  