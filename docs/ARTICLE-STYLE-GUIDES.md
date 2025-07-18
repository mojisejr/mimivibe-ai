# MiMiVibes Article Display Page Style Guide

## 📍 Introduction

This guide outlines the UI/UX principles and specific styling for the `ArticleDisplay` page, aiming for a **Minimalist, Elegant, Modern, and comfortable reading experience**, heavily inspired by Medium's article layout. The goal is to eliminate the "boxy" feel, enhance readability, and align with the `MiMiVibes` brand identity defined in `tailwind.config.js` and `STYLE-GUIDE.md`.

## 💡 Core UI Principles for Article Display

- **Content-First Design:** Prioritize readability and the content itself.
- **Minimalism & Elegance:** Emphasize clean lines, ample whitespace, and a distraction-free environment.
- **Subtle Visual Cues:** Replace heavy borders and solid backgrounds with subtle indicators (e.g., thin borders, icons, typography).
- **Harmonious Color Usage:** Utilize the defined `mimivibes` color palette thoughtfully to create mood and highlight information without overwhelming the user.
- **Responsive & Adaptive:** Ensure optimal viewing and interaction across all device sizes.

## 🎨 Brand Identity & Visual Elements

Refer to `tailwind.config.js` for the exact color values and `STYLE-GUIDE.md` for general brand guidelines.

### 1. Color Palette Usage (mimivibes theme)

- **Backgrounds (`base-colors` from `tailwind.config.js`):**
  - `base-200` (`#22193b`): Main page background, creating a mystical, elegant dark base.
  - `base-100` (`#1a132e`): Used for slightly darker elements or subtle contrasts.
- **Text Colors (`base-content`, `neutral-content`, semantic colors):**
  - `base-content` (`#ffffff`): Main body text, headings, for high contrast on dark backgrounds.
  - `neutral-content` (`#ffffff`): Secondary text, descriptive elements (e.g., card short meanings, italicized question).
  - **Semantic Colors (for alerts/notices):**
    - `info` (`#66c7ff`): For `Suggestions`. Use text color only, or a very subtle border/icon.
    - `success` (`#629c6b`): For `Final Message`, `Rewards`. Use text color only, or a subtle border/icon.
    - `warning` (`#ffbe00`): For `Notice`. Use text color only, or a subtle border/icon.
    - `error` (`#ff6b6b`): For `Delete` button.
- **Accent & Interactive Colors (`primary`, `secondary`, `accent`):**
  - `primary` (`#629c6b`): For subtle accents, active states, or `Save` button.
  - `secondary` (`#5a4f78`): For subtle decorative elements, metadata badges.
  - `accent` (`#de5b25`): For primary actions (`ถามใหม่`), badges, highlights.

### 2. Typography

- **Font Family:** `Inter` (as defined in `tailwind.config.js`) for all text. Ensure good readability for Thai characters.
- **Headings (`heading-1`, `heading-2`, `heading-3`):**
  - Use `text-base-content` for headings on dark backgrounds.
  - Maintain clear hierarchy with appropriate font sizes and `font-weight` (e.g., `font-bold` or `font-semibold`).
  - `line-height`: Aim for 1.2-1.4 for headings.
- **Body Text (`body-large`, `body-normal`, `body-small`):**
  - Use `text-base-content` for main content and `text-neutral-content` for secondary/meta text.
  - `line-height`: Set `body-normal` at 1.6-1.7 to enhance readability and comfort.
  - `letter-spacing`: Ensure default or slightly adjusted letter spacing for better visual flow.

### 3. Layout & Spacing

- **Overall Layout:** The article content should be contained within a `max-w` container (e.g., `max-w-3xl` for main content, `max-w-4xl` for wider elements like card grid) and `mx-auto` for centering.
- **Whitespace:** Generous `margin-bottom` (`mb-X` classes) between all major sections (header, card section, article sections) to create clear visual breaks and reduce visual clutter. Use `px-Y` for horizontal padding within these sections.
- **No Hard Boxes:** Avoid `card` components with full backgrounds and `shadow-lg` for all content sections. Use padding and margins to define sections.

### 4. Section Styling (Non-Boxy Approach)

- **Main Reading Content (`การทำนาย`):**
  - Remove `card card-mystical p-6 sm:p-8 shadow-lg`.
  - Apply `p-6 sm:p-8` directly to the `section` or an inner `div` to maintain padding.
  - Ensure `mb-12` for vertical spacing.
  - The content should appear seamlessly on the `article`'s background (`bg-base-200` or `bg-base-100` if changed).
- **Suggestions (`คำแนะนำ`):**
  - Remove `alert alert-info p-6 sm:p-8 shadow-lg`.
  - Replace with `div` having a subtle `border-l-4` (e.g., `border-info/50` or `border-info-500` if using a color scale) and appropriate `padding` (`p-6 sm:p-8`).
  - Text color for `h2` and `li` content should be `text-base-content` or `text-neutral-content`.
  - The numbered circle (`bg-info text-info-content rounded-full`) should be replaced by a simple icon or just the number with `text-info` color, without a solid background.
- **Final Message (`ข้อสรุป`):**
  - Similar to `Suggestions`, remove `alert alert-success p-6 sm:p-8 shadow-lg`.
  - Use `border-l-4 border-success/50` with `padding`.
  - Text color for `h2` and content should be `text-base-content` or `text-neutral-content`.
- **End Message (`End`):**
  - Remove `card card-mystical p-6 sm:p-8 ... shadow-lg`.
  - Use `padding` and `margin-bottom`.
  - The `bg-gradient-to-br from-primary/10 to-secondary/10` is good for a subtle mystical feel; keep this if desired, but ensure it doesn't create a strong "box" effect. Adjust opacity if too prominent.
- **Notice (`หมายเหตุ`):**
  - Remove `alert alert-warning p-6 shadow-lg`.
  - Apply `border-l-4 border-warning/50` with `padding`.
  - Text color for `h3` and `p` should be `text-base-content` or `text-neutral-content`.
- **Rewards (`รางวัลที่ได้รับ`):**
  - Remove `alert alert-success p-6 shadow-lg`.
  - Apply padding. The inner circular elements (`bg-warning`, `bg-accent`) can retain their background if they are small and act as icons, but consider reducing `shadow-lg` or using `shadow-sm`.
  - Text color should be `text-base-content` or `text-neutral-content`.

### 5. Card Section (`ไพ่ที่จั่วได้`)

- **CardImage (`CardImage` component):**
  - Remove `card card-mystical` from the outer `div` that wraps the `img`. The focus should be on the image itself.
  - Consider reducing `shadow-lg` to `shadow-md` or `shadow-sm` on the image container for a lighter feel.
  - The `position` number (`absolute -top-2 -right-2 ... bg-primary ... shadow-lg`) should be more subtle. Consider reducing its size, shadow, or using a transparent background with a border, or placing it within the card design more subtly (e.g., small text at the bottom corner).

### 6. Article Header

- **Meta Info Badges:** The `badge badge-primary`, `badge badge-secondary`, `badge badge-accent` are currently quite prominent. To align with minimalism:
  - Consider changing `badge` to a `chip` style with a thin border and transparent background, or just use regular text with subtle color distinctions.
  - For example: `px-3 py-1 rounded-full border border-gray-500 text-gray-400 text-sm`.
- **Question (`max-w-2xl mx-auto mb-8`):** The `italic border-l-4 border-primary/30 pl-4` is already good and aligns with the subtle border approach. Keep this.

### 7. Action Buttons (Sticky Footer)

- **Desktop Action Buttons:**
  - The `card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm` for the sticky footer can remain as it creates a distinct, elegant floating effect with Glassmorphism.
  - **Button Styles:**
    - `btn-success` (บันทึกแล้ว): Change to `btn btn-ghost text-success` or `btn btn-outline text-success` for a less solid look.
    - `btn-primary` (บันทึกการทำนาย): Change to `btn btn-ghost text-primary` or `btn btn-outline text-primary`.
    - `btn-outline btn-error` (ลบการทำนาย): Change to `btn btn-ghost text-error` or retain `btn-outline text-error` if a clear visual "danger" is needed.
    - `btn-accent` (ถามใหม่): Can remain `btn-accent` as it's the primary action, but ensure its color (`#de5b25`) is visually appealing against the dark background.
  - Consider adding subtle `hover` animations using Framer Motion for all buttons.
- **Mobile Action Buttons:**
  - **Primary Action (ถามใหม่):** `btn btn-accent w-full btn-lg shadow-lg` is fine for primary action, but reduce `shadow-lg` to `shadow-md` or `shadow-sm`.
  - **Secondary Actions (บันทึก, ลบ):** Change `btn-success` and `btn-primary btn-outline` to `btn btn-ghost` or `btn btn-outline` with appropriate text colors for a lighter feel. Reduce `btn-sm` if possible without impacting touch target size.

### 8. Iconography

- Use Lucide React icons where appropriate.
- Color icons using `text-base-content`, `text-primary`, `text-accent`, or `text-neutral-content` to match the minimalist color palette.

### 9. Animations

- **Framer Motion:** Utilize `Framer Motion` for subtle, purposeful animations as per `STYLE-GUIDE.md`.
- **Examples:**
  - Gentle fade-in/slide-up for sections as they scroll into view.
  - Subtle hover effects on buttons and interactive elements.
  - Smooth transitions for `isSaved` state changes.

This detailed style guide should provide sufficient instructions for a coding agent to refactor the `ArticleDisplay` page to meet your desired elegant, minimal, and comfortable reading experience.
