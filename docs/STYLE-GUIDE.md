# MiMiVibes UI Style Guide

## 📍 Introduction

เอกสารนี้คือคู่มือสไตล์การออกแบบ UI สำหรับ MiMiVibes โดยมุ่งเน้นที่ Landing Page เพื่อสร้างประสบการณ์ผู้ใช้ที่ **Minimalist, Elegant, Modern** และ **ทรงพลัง (Empowering)** โดยผสมผสานเทคนิค **Glassmorphism** และ **Gradient Color** เพื่อดึงดูดผู้ใช้งานกลุ่มเป้าหมาย (ผู้หญิงอายุ 18-35 ปีที่สนใจไพ่ทาโรต์และการค้นหาตัวเอง) ให้ทำการลงทะเบียนและทดลองใช้แอปพลิเคชัน.

## 💡 Core UI Principles

- **Minimalism & Elegance**: เน้นความสะอาดตา, ไม่รกรุงรัง, ใช้พื้นที่สีขาว (whitespace) อย่างมีประสิทธิภาพ เพื่อสร้างความรู้สึกหรูหราและสงบ.
- **Modern & Empowering**: ใช้เทคนิคการออกแบบที่ทันสมัย เช่น Glassmorphism และ Gradient เพื่อสื่อถึงความก้าวหน้าและมอบความรู้สึกมั่นใจให้กับผู้ใช้.
- **Accessibility**: ออกแบบโดยคำนึงถึงการเข้าถึงของผู้ใช้งานทุกกลุ่ม, โดยเฉพาะเรื่อง Contrast ของสีและขนาดตัวอักษร.
- **Responsiveness (Mobile-First)**: UI จะต้องปรับเปลี่ยนและทำงานได้อย่างสมบูรณ์บนอุปกรณ์มือถือเป็นอันดับแรก เนื่องจากกลุ่มผู้ใช้งานหลักเป็นผู้ใช้งานมือถือ.
- **Performance**: มุ่งเน้นการโหลดหน้าเว็บที่รวดเร็ว (Page load time < 3 วินาที) และประสิทธิภาพการทำงานโดยรวมที่ดี.

## 🎨 Brand Identity & Visual Elements

### 1. Color Palette

ใช้ชุดสีตามที่กำหนดใน `tailwind.config.js` และ PRD เพื่อสื่อถึงบุคลิกของ MiMiVibes: Mystical, Warm, Modern, Trustworthy, Exciting, Empowering.

- **Primary**: `#629c6b` (เขียวธรรมชาติ - ความเจริญเติบโต)
  - `primary-focus`: `#578b60`
  - `primary-content`: `#ffffff`
- **Secondary**: `#66836a` (เขียวเข้ม - ความมั่นคง)
  - `secondary-focus`: `#58795d`
  - `secondary-content`: `#ffffff`
- **Accent**: `#de5b25` (ส้ม - พลังและความกระตือรือร้น)
  - `accent-focus`: `#c04f20`
  - `accent-content`: `#ffffff`
- **Neutral**: `#bfb8b1` (เบจ - ความสงบ)
  - `neutral-focus`: `#a8a29e`
  - `neutral-content`: `#1f2937`
- **Base Colors**:
  - `base-100`: `#ffffff` (ขาว - ความบริสุทธิ์)
  - `base-200`: `#f3f2f0`
  - `base-300`: `#e0dfdc`
  - `base-content`: `#1f2937`
- **Semantic Colors (DaisyUI defaults)**:
  - `info`: `#2094f3`
  - `success`: `#629c6b` (ตรงกับ Primary)
  - `warning`: `#ffcc00`
  - `error`: `#de5b25` (ตรงกับ Accent)

### 2. Typography

- **Font Family**: `Inter` (จาก Google Fonts) เป็นฟอนต์หลักสำหรับเนื้อหาทั้งหมด. (สำหรับภาษาไทย ให้แน่ใจว่า Inter รองรับได้ดี หรือใช้ฟอนต์เสริมที่เข้ากันได้ดีกับ Inter เช่น Sarabun หรือ Noto Sans Thai หากจำเป็น โดยมี Fallback เป็น `system-ui, sans-serif`).
- **Headings**: ใช้สี `primary-content` หรือ `base-content` ขึ้นอยู่กับพื้นหลัง, เน้นความหนา (Bold) เพื่อความโดดเด่น.
  - `h1` (Hero Title): ใหญ่, Bold, ดึงดูดความสนใจสูงสุด.
  - `h2` (Section Titles): ใหญ่รองลงมา, Bold, ชัดเจน.
  - `h3`, `h4` etc.: ขนาดลดหลั่นลงไป, รักษาความชัดเจน.
- **Body Text**: ใช้สี `base-content`, น้ำหนักปกติ (Regular) เพื่อความอ่านง่าย.
  - ขนาดตัวอักษรเริ่มต้น: 16px หรือ 1rem (สามารถปรับตามความเหมาะสมสำหรับ Mobile).
  - Line Height: ควรอยู่ที่ 1.5 - 1.6 เพื่อให้อ่านสบายตา.

### 3. Iconography

- **Source**: Lucide React icons.
- **Style**: Minimal, line-based, consistent.
- **Color**: ใช้สี `primary-content`, `accent-content`, หรือ `base-content` เพื่อให้เข้ากับ Color Palette และบริบท.

### 4. Imagery & Media

- **Tarot Cards**: ใช้รูปภาพไพ่ทาโรต์คุณภาพสูง 78 ใบ.
- **Backgrounds**: สามารถใช้ภาพประกอบที่มีความเป็น Mystical หรือ Abstract ที่เข้ากับโทนสีของแบรนด์ หรือ Gradients.
- **Responsiveness**: รูปภาพทั้งหมดต้องมีการจัดการให้แสดงผลได้ดีบนทุกขนาดหน้าจอ (responsive images).

### 5. Animations

- **Library**: Framer Motion สำหรับการทำอนิเมชันที่ลื่นไหล.
- **Style**: เน้นความนุ่มนวล (smooth transitions), Subtle (ไม่รบกวน), และมีวัตถุประสงค์ (purposeful) เพื่อเพิ่มความรู้สึกทันสมัยและตื่นเต้น เช่น:
  - การปรากฏขึ้นขององค์ประกอบ (fade-in, slide-up).
  - การเปลี่ยนแปลงสถานะของปุ่ม (hover, click).
  - การเปิดเผยไพ่ (ในส่วน Hero หรือส่วนสาธิตฟีเจอร์).

## ✨ UI Specifics for Landing Page

### 1. Glassmorphism Application

- **หลักการ**: องค์ประกอบจะมีความโปร่งแสง (Translucency), มีเงาที่ชัดเจนแต่ไม่แข็งทื่อ (Soft Shadows), และมีขอบที่เบลอ (Subtle Border Blur) คล้ายกระจกฝ้า เพื่อสร้างความลึกและมิติ.
- **ตำแหน่งที่ใช้**:
  - **Hero Section**: CTA Button, หรือ Card ที่แสดงตัวอย่างคำทำนาย.
  - **Feature Cards**: กล่องที่แสดงรายละเอียดฟีเจอร์แต่ละอย่าง.
  - **Pricing Cards**: การ์ดแสดงแพ็กเกจราคา.
- **เทคนิค**:
  - ใช้ `backdrop-filter: blur()` ใน CSS (DaisyUI อาจมี utility class ที่รองรับ).
  - ตั้งค่า `background-color` ที่มี `opacity` เล็กน้อย (เช่น `rgba(255, 255, 255, 0.1)` หรือสีจาก palette ที่มี `opacity`).
  - เพิ่ม `box-shadow` ที่มีค่าเบลอสูงและสีอ่อน (เช่น `0 8px 32px 0 rgba(0, 0, 0, 0.1)`).
  - อาจมี `border` บางๆ ที่มี `opacity` ต่ำกว่าปกติ เพื่อเพิ่มความคมชัดของ "ขอบกระจก".

### 2. Gradient Color Application

- **หลักการ**: เน้นความ Minimal แต่ทรงพลัง, ใช้ Gradient อย่างเหมาะสมเพื่อเพิ่มความน่าสนใจโดยไม่ทำให้รู้สึกรกรุงรัง.
- **ตำแหน่งที่ใช้**:
  - **Hero Section Background**: อาจใช้ Linear Gradient จาก `base-100` ไปยัง `base-200` หรือผสมผสาน `primary` และ `secondary` color อย่างนุ่มนวลเพื่อสร้างบรรยากาศ Mystical.
  - **Call to Action Buttons**: ปุ่ม "ให้แม่หมอทำนาย" อาจใช้ Linear Gradient จาก `accent` ไปยัง `accent-focus` เพื่อให้โดดเด่นและดึงดูดสายตา.
  - **Section Dividers/Accents**: อาจใช้เส้นแบ่งหรือองค์ประกอบตกแต่งเล็กๆ ที่มี Gradient เพื่อเพิ่มมิติ.
  - **Text (บางจุด)**: อาจมีการใช้ Gradient กับข้อความใน Headings ที่สำคัญมากๆ เพื่อเน้นย้ำ (อย่างจำกัดและระมัดระวังเพื่อคงความอ่านง่าย).

### 3. Layout & Spacing

- **Grid System**: ใช้ Tailwind CSS และ DaisyUI utilities เพื่อการจัดวางที่ยืดหยุ่นและ responsive.
- **Spacing**: ยึดหลักการใช้ Spacing ที่เป็นระบบ (เช่น multiples of 4px or 8px) เพื่อความสอดคล้องและความเป็นระเบียบ.
- **Whitespace**: ใช้พื้นที่ว่างอย่างมีสติ เพื่อให้องค์ประกอบต่างๆ หายใจได้ และดึงดูดสายตาไปยังเนื้อหาสำคัญ.

### 4. Specific Components for Landing Page

#### 4.1 Hero Section

- **Title**: ข้อความหลักที่ดึงดูดความสนใจ เช่น "เปิดเผยอนาคตของคุณด้วย AI ไพ่ทาโรต์แห่งแรกของไทย!".
- **Subtitle/Tagline**: ข้อความอธิบายสั้นๆ เสริมความเข้าใจ.
- **Call to Action (CTA)**: ปุ่มขนาดใหญ่ "ให้แม่หมอทำนาย".
  - **Style**: ปุ่มควรมีการใช้ Gradient (จาก Accent ไป Accent-focus) และอาจมี Glassmorphism effect เล็กน้อยเมื่อ Hover เพื่อเพิ่มความรู้สึกน่าคลิก.
  - **Animation**: อาจมี subtle animation เมื่อเมาส์ไปชี้ (hover) หรือเมื่อโหลดหน้าเข้ามา.
- **Visuals**: อาจมีภาพประกอบ หรืออนิเมชัน 3D การเปิดไพ่ เพื่อดึงดูดความสนใจ.

#### 4.2 Features Section

- **Structure**: แสดงฟีเจอร์หลักของแอป เช่น "AI Tarot Reading System", "Credit & Payment System", "Gamification System", "History & Search System".
- **Feature Cards**: แต่ละฟีเจอร์จะถูกนำเสนอในรูปแบบการ์ด โดยใช้เทคนิค Glassmorphism.
  - **Content**: ชื่อฟีเจอร์, คำอธิบายสั้นๆ, และไอคอนที่เกี่ยวข้อง (Lucide React).
  - **Interaction**: อาจมี subtle hover effect เพื่อแสดงว่าสามารถกดเพื่อดูรายละเอียดเพิ่มเติมได้ (ถ้ามี).

#### 4.3 Pricing Section

- **Structure**: แสดงแพ็กเกจ Credit ที่แตกต่างกัน.
- **Pricing Cards**: การ์ดแสดงราคาแต่ละแพ็กเกจ (อาจมีการ์ด "ยอดนิยม" ที่โดดเด่นขึ้นมา).
  - **Style**: ใช้ Glassmorphism เพื่อสร้างความแตกต่างจากพื้นหลัง.
  - **Content**: ชื่อแพ็กเกจ, ราคา, จำนวน Credit, รายละเอียดฟีเจอร์ที่ได้รับ, และปุ่ม CTA "ซื้อเลย" (Buy Now).

## 📱 Mobile Responsiveness

- **Mobile-First Approach**: ออกแบบและพัฒนาโดยคำนึงถึงหน้าจอมือถือเป็นอันดับแรก.
- **Fluid Layouts**: ใช้หน่วยที่ยืดหยุ่น (เช่น percentages, rem, vw/vh) แทน fixed pixels สำหรับความกว้าง.
- **Touch Targets**: ปุ่มและองค์ประกอบที่โต้ตอบได้ต้องมีขนาดเพียงพอสำหรับการสัมผัส (minimum 44px).
- **Typography Scaling**: ขนาดตัวอักษรจะถูกปรับให้เหมาะสมกับการอ่านบนหน้าจอมือถือ.
- **Navigation**: Hero Section อาจมี auto-hide navbar สำหรับมือถือ.

## 🤖 AI Integration Notes (สำหรับ Claude หรือ AI อื่นๆ)

เมื่อคุณต้องการให้ AI สร้างโค้ด UI หรือให้ feedback:

1.  **ระบุ Components**: ชี้ชัดว่าต้องการให้ AI สร้าง UI Component ใด (เช่น "Hero Section", "Feature Card", "Pricing Card").
2.  **อ้างอิง Style Guide**: ระบุว่า AI ควรใช้ "MiMiVibes UI Style Guide" นี้เป็นแนวทางหลัก.
3.  **เน้น Specifics**: หากมีรายละเอียดเฉพาะ เช่น "ใช้ Glassmorphism effect กับ Feature Card", "ปุ่ม CTA ควรเป็น Gradient จาก Accent Color", "มี Framer Motion animation เมื่อ Hover".
4.  **ระบุ Context**: ให้บริบทของเนื้อหา (เช่น "ข้อความ Title คือ 'เปิดเผยอนาคตของคุณ...'").
5.  **Target Device**: ระบุว่าต้องการให้เน้น Responsive สำหรับ "Mobile" หรือ "Desktop".
