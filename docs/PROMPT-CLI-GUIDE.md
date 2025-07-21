# MiMiVibes Prompt CLI Guide

> **🔮 Complete Guide**: การใช้งาน Prompt Management CLI สำหรับ MiMiVibes  
> **👤 Target**: Developers & Prompt Engineers  
> **📅 Updated**: January 2025

## 🚀 Quick Start

### 1. ติดตั้งและเริ่มต้น

```bash
# ตรวจสอบ environment variable ใน .env
PROMPT_ENCRYPTION_KEY=mimivibes-super-secret-prompt-encryption-key-2024-secure

# Initialize prompts จาก code เดิม (ครั้งแรกเท่านั้น)
npm run prompt:init

# ดู prompts ที่มีอยู่
npm run prompt:list
```

### 2. ทดสอบระบบ

```bash
# ทดสอบการทำนายทั้งหมด
npm run prompt:test "วันนี้ไพ่อยากบอกอ่ะไร"

# ทดสอบเฉพาะ question filter
npm run prompt:test-filter "ความรักจะเป็นอย่างไร"
```

---

## 📋 คำสั่งทั้งหมด (17 Commands)

### 🏗️ การจัดการ Prompts

#### `npm run prompt:init`
**การใช้งาน**: เริ่มต้นระบบ prompt management ครั้งแรก

```bash
npm run prompt:init
```

**ผลลัพธ์**:
```
🔄 Initializing prompt templates from existing prompts.ts...
✅ Initialized prompt: questionFilter
✅ Initialized prompt: questionAnalysis  
✅ Initialized prompt: readingAgent
✅ Initialization complete
```

**เมื่อไหร่ใช้**: ครั้งแรกเท่านั้น หลังจากติดตั้งระบบ

---

#### `npm run prompt:list`
**การใช้งาน**: ดู prompts ที่ active อยู่

```bash
# ดูเฉพาะ active prompts
npm run prompt:list

# ดูทั้งหมด (รวม inactive)
npm run prompt:list-all
```

**ผลลัพธ์**:
```
📋 Active Prompt Templates

questionAnalysis:
  ✅ v2 (ACTIVE) - "เพิ่ม emotion categories" [2025-01-21]
  📝 v1 - "Initial version" [2025-01-21]

questionFilter:
  ✅ v3 (ACTIVE) - "ปรับให้กระชับขึ้น" [2025-01-21]
  ⭐ v2 - "Simplified version" [2025-01-21]
  📝 v1 - "Initial version" [2025-01-21]

readingAgent:
  ✅ v1 (ACTIVE) - "Initial version" [2025-01-21]
```

---

#### `npm run prompt:show <name> [--version <number>]`
**การใช้งาน**: ดูเนื้อหา prompt

```bash
# ดู active version
npm run prompt:show questionFilter

# ดู version เฉพาะ
npm run prompt:show questionFilter --version 2
```

**ผลลัพธ์**:
```
📄 Active Prompt Content: questionFilter
────────────────────────────────────────────────────────────
คุณคือผู้ช่วยคัดกรองคำถามสำหรับบริการดูไพ่ทาโรต์ของ "แม่หมอมีมี่"
[เนื้อหา prompt...]
────────────────────────────────────────────────────────────
```

---

#### `npm run prompt:update <name> "<content>" [--description "<desc>"]`
**การใช้งาน**: อัปเดต prompt (สร้าง version ใหม่)

```bash
# อัปเดต prompt พร้อมคำอธิบาย
npm run prompt:update questionFilter "
คุณคือผู้ช่วยคัดกรองคำถามใหม่...
[เนื้อหาใหม่]
" --description "ปรับปรุงการตรวจจับภาษาอังกฤษ"

# อัปเดตแบบง่าย
npm run prompt:update readingAgent "เนื้อหาใหม่..."
```

**ผลลัพธ์**:
```
✅ Updated prompt 'questionFilter' to version 4
💡 Tip: Add --description "what changed" for better version tracking
```

---

### 🔄 การจัดการ Versions

#### `npm run prompt:versions <name>`
**การใช้งาน**: ดูประวัติ versions ของ prompt

```bash
npm run prompt:versions questionFilter
```

**ผลลัพธ์**:
```
📋 Version History: questionFilter

┌─────────┬──────────┬─────────────────────────────────┬────────────┐
│ Version │ Status   │ Description                     │ Created    │
├─────────┼──────────┼─────────────────────────────────┼────────────┤
│ 4       │ ACTIVE   │ ปรับปรุงการตรวจจับภาษาอังกฤษ      │ 2025-01-21 │
│ 3       │ Inactive │ ปรับให้กระชับขึ้น                │ 2025-01-21 │
│ 2       │ Inactive │ Simplified version             │ 2025-01-21 │
│ 1       │ Inactive │ Initial version                │ 2025-01-21 │
└─────────┴──────────┴─────────────────────────────────┴────────────┘
```

---

#### `npm run prompt:activate <name> <version>`
**การใช้งาน**: เปลี่ยนไปใช้ version เฉพาะ

```bash
# เปลี่ยนไปใช้ version 2
npm run prompt:activate questionFilter 2
```

**ผลลัพธ์**:
```
✅ Activated prompt 'questionFilter' version 2
```

**⚠️ หมายเหตุ**: version ที่ activate จะกลายเป็น active และใช้ใน production ทันที

---

#### `npm run prompt:compare <name> <version1> <version2>`
**การใช้งาน**: เปรียบเทียบ versions

```bash
npm run prompt:compare questionFilter 2 4
```

**ผลลัพธ์**:
```
📊 Comparing questionFilter: v2 vs v4

🔵 Version 2:
────────────────────────────────────────────────────────────
[เนื้อหา version 2...]

🟢 Version 4:
────────────────────────────────────────────────────────────
[เนื้อหา version 4...]

📏 Length comparison:
   v2: 11 lines, 522 characters
   v4: 15 lines, 678 characters
   Difference: +4 lines, +156 characters
```

---

#### `npm run prompt:backup <name>`
**การใช้งาน**: สร้าง backup ของ version ปัจจุบัน

```bash
npm run prompt:backup questionFilter
```

**ผลลัพธ์**:
```
✅ Created backup: questionFilter v5
```

---

#### `npm run prompt:restore <name> <version>`
**การใช้งาน**: กู้คืนไปยัง version เฉพาะ

```bash
npm run prompt:restore questionFilter 3
```

**ผลลัพธ์**:
```
✅ Activated prompt 'questionFilter' version 3
```

---

### 🧪 การทดสอบ

#### `npm run prompt:test "<question>" [--save] [--version <name:version>]`
**การใช้งาน**: ทดสอบการทำนายทั้งหมด

```bash
# ทดสอบปกติ
npm run prompt:test "วันนี้ไพ่อยากบอกอ่ะไร"

# ทดสอบและบันทึกผลลัพธ์
npm run prompt:test "ความรักจะเป็นอย่างไร" --save

# ทดสอบด้วย version เฉพาะ
npm run prompt:test "การงานเป็นอย่างไร" --version questionFilter:3
```

**ผลลัพธ์**:
```
🔮 Starting Tarot Reading Test...

✅ Filter Result: { "isValid": true, "reason": "" }
🎯 Selected Cards: [15, 32, 67] (The Devil, Two of Cups, Six of Pentacles)
📊 Analysis: {
  "mood": "อยากรู้",
  "topic": "การเติบโตส่วนตัว",
  "period": "ปัจจุบัน"
}

🌟 Final Reading:
{
  "header": "การทำนายไพ่ยิปซีสำหรับวันนี้",
  "reading": "วันนี้ไพ่ต้องการบอกให้คุณรู้ว่า...",
  "suggestions": ["คำถามที่แนะนำถัดไป..."]
}

⏱️  Total Time: 3.2s
💰 Token Usage: 1,247 tokens
💾 Results saved to database for analysis
```

---

#### `npm run prompt:test-filter "<question>"`
**การใช้งาน**: ทดสอบเฉพาะ question filter

```bash
npm run prompt:test-filter "วันนี้ไพ่อยากบอกอ่ะไร"
```

**ผลลัพธ์**:
```
🔍 Testing Question Filter Only...

✅ Filter Result:
{
  "isValid": true,
  "reason": "คำถามมีความยาวเหมาะสมและเป็นคำถามที่เกี่ยวกับคำแนะนำทั่วไป"
}

⏱️  Execution Time: 1.1s
```

---

#### `npm run prompt:test-analysis "<question>"`
**การใช้งาน**: ทดสอบเฉพาะ question analysis

```bash
npm run prompt:test-analysis "ความรักจะเป็นอย่างไร"
```

**ผลลัพธ์**:
```
📊 Testing Question Analysis Only...

📈 Analysis Result:
{
  "mood": "มีความหวัง",
  "topic": "ความรักและความสัมพันธ์",
  "period": "อนาคตอันใกล้"
}

⏱️  Execution Time: 1.4s
```

---

#### `npm run prompt:debug "<question>"`
**การใช้งาน**: Debug mode พร้อมรายละเอียดทุกขั้นตอน

```bash
npm run prompt:debug "วันนี้ไพ่อยากบอกอ่ะไร"
```

**ผลลัพธ์**:
```
🔍 Debug Mode - Step by Step Analysis

Step 1: Question Filter
📝 Prompt Used: [questionFilter v4]
🤖 Provider: gemini
⚡ Response Time: 0.8s
📤 Input: "วันนี้ไพ่อยากบอกอ่ะไร"
📥 Output: { "isValid": true, "reason": "คำถามเหมาะสม" }

Step 2: Card Selection
🎲 Random Cards: [15, 32, 67]
🃏 Card Names: ["The Devil", "Two of Cups", "Six of Pentacles"]
⚡ Response Time: 12ms

Step 3: Question Analysis
📝 Prompt Used: [questionAnalysis v2]
🤖 Provider: gemini
⚡ Response Time: 1.1s
📤 Input: Question + Context
📥 Output: { "mood": "อยากรู้", "topic": "การเติบโตส่วนตัว" }

Step 4: Reading Generation
📝 Prompt Used: [readingAgent v1]
🤖 Provider: gemini
⚡ Response Time: 2.3s
📤 Input: Question + Cards + Analysis
📥 Output: [Full reading object]

💡 Tips: Use --save to save test results to file
```

---

### 📊 การวิเคราะห์

#### `npm run prompt:analyze <name>`
**การใช้งาน**: วิเคราะห์ประสิทธิภาพ prompt

```bash
npm run prompt:analyze questionFilter
```

**ผลลัพธ์**:
```
📊 Performance Analysis: questionFilter

📈 Version Comparison (Last 7 days):
┌─────────┬────────────┬──────────────┬─────────────┬──────────────┐
│ Version │ Tests Run  │ Avg Time(ms) │ Avg Tokens  │ Success Rate │
├─────────┼────────────┼──────────────┼─────────────┼──────────────┤
│ v4 ✅   │ 45         │ 832          │ 245         │ 98.5%        │
│ v3      │ 32         │ 912          │ 267         │ 95.2%        │
│ v2      │ 18         │ 1,045        │ 298         │ 92.1%        │
│ v1      │ 8          │ 1,234        │ 334         │ 87.5%        │
└─────────┴────────────┴──────────────┴─────────────┴──────────────┘

🎯 Best Performing Questions:
• "วันนี้ควรทำอะไร" - 100% success, 723ms avg
• "ความรักจะเป็นอย่างไร" - 97% success, 845ms avg

⚠️  Problematic Questions:
• "????" - 45% success (invalid format)
• Very long questions >200 chars - 78% success

💡 Recommendations:
• v4 shows best performance overall
• Consider merging v3's validation logic with v4
• Review handling of edge cases from failed tests

🎯 Best Performing Version: v4 (98.5% success rate)
```

---

### 🛠️ การจัดการระบบ

#### `npm run prompt:deactivate <name>`
**การใช้งาน**: ปิดการใช้งาน prompt (เก็บไว้เป็น reference)

```bash
npm run prompt:deactivate questionFilter
```

**ผลลัพธ์**:
```
✅ Deactivated prompt 'questionFilter'
```

**⚠️ คำเตือน**: prompt ที่ถูก deactivate จะไม่สามารถใช้ใน production ได้

---

## 🎯 Workflow ทั่วไป

### 1. การอัปเดต Prompt แบบปกติ

```bash
# 1. ดู prompt ปัจจุบัน
npm run prompt:show questionFilter

# 2. ทดสอบก่อนแก้ไข
npm run prompt:test "วันนี้ไพ่อยากบอกอ่ะไร"

# 3. อัปเดต prompt
npm run prompt:update questionFilter "เนื้อหาใหม่..." --description "ปรับปรุง XYZ"

# 4. ทดสอบหลังแก้ไข
npm run prompt:test "วันนี้ไพ่อยากบอกอ่ะไร" --save

# 5. วิเคราะห์ผลลัพธ์
npm run prompt:analyze questionFilter
```

### 2. การทดลอง A/B Testing

```bash
# 1. สร้าง version ใหม่
npm run prompt:update questionFilter "Version A content..." --description "Test version A"

# 2. ทดสอบ version ใหม่
npm run prompt:test "คำถามทดสอบ" --save

# 3. เปลี่ยนกลับไป version เก่า
npm run prompt:activate questionFilter 2

# 4. ทดสอบ version เก่า
npm run prompt:test "คำถามทดสอบ" --save

# 5. เปรียบเทียบ
npm run prompt:compare questionFilter 2 3
npm run prompt:analyze questionFilter
```

### 3. การแก้ไขเมื่อเกิดปัญหา

```bash
# 1. ตรวจสอบปัญหา
npm run prompt:debug "คำถามที่มีปัญหา"

# 2. ดู version history
npm run prompt:versions questionFilter

# 3. กลับไปใช้ version ที่ใช้ได้
npm run prompt:restore questionFilter 2

# 4. ทดสอบการแก้ไข
npm run prompt:test "คำถามที่มีปัญหา"
```

---

## ⚠️ ข้อควรระวัง

### 1. Security
- **อย่าแชร์ PROMPT_ENCRYPTION_KEY** กับใคร
- **Backup key** ไว้ในที่ปลอดภัย หากหาย key จะอ่าน prompts ไม่ได้
- **ใช้ key ที่แข็งแรง** อย่างน้อย 32 ตัวอักษร

### 2. Version Management
- **ระวังการ activate** version ใหม่ จะมีผลต่อ production ทันที
- **ทดสอบก่อน activate** ให้ใช้ `--version` flag ในการทดสอบ
- **เก็บ backup** ของ version ที่ทำงานดีไว้

### 3. Performance
- **ใช้ --save** เมื่อต้องการเก็บข้อมูลเพื่อวิเคราะห์
- **วิเคราะห์ผลลัพธ์** ด้วย `prompt:analyze` เป็นประจำ
- **ทดสอบหลายคำถาม** เพื่อให้ได้ข้อมูลที่ครอบคลุม

---

## 🛠️ Troubleshooting

### ปัญหา: "PROMPT_ENCRYPTION_KEY environment variable is missing"

```bash
# แก้ไข: เพิ่ม key ใน .env
echo 'PROMPT_ENCRYPTION_KEY=your-32-character-key-here' >> .env
```

### ปัญหา: "Provider gpt-4o-mini not available, falling back to gemini"

```bash
# แก้ไข: ตรวจสอบ API key ใน .env
DEFAULT_AI_PROVIDER="gemini"  # หรือใช้ gemini เป็นหลัก
```

### ปัญหา: "Prompt template 'questionFilter' not found"

```bash
# แก้ไข: Initialize ระบบใหม่
npm run prompt:init
```

### ปัญหา: การทดสอบใช้เวลานาน

```bash
# วิธีแก้: ทดสอบแบบ step เดียว
npm run prompt:test-filter "คำถาม"     # เร็วที่สุด
npm run prompt:test-analysis "คำถาม"   # ปานกลาง
```

---

## 📚 อ้างอิง

### Environment Variables ที่สำคัญ

```bash
# Required
PROMPT_ENCRYPTION_KEY=32-character-key-minimum

# AI Configuration
DEFAULT_AI_PROVIDER=gemini|openai
AI_PROVIDER_FALLBACK=gemini|openai
GEMINI_MODEL=gemini-2.0-flash-exp
OPENAI_MODEL=gpt-4o-mini

# API Keys
GOOGLE_AI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
```

### ไฟล์ที่เกี่ยวข้อง

```
/src/lib/
├── prompt-encryption.ts     # Encryption utilities
├── prompt-manager.ts        # Core management
├── prompt-test-runner.ts    # Testing framework
└── langgraph/workflow-with-db.ts  # Database integration

/scripts/
└── prompt-manager.ts        # CLI tool

/prisma/migrations/
└── 20250121_add_prompt_tables/  # Database schema
```

### Database Tables

- **prompt_templates**: หลัก, เก็บ active prompts
- **prompt_versions**: ประวัติทุก versions
- **prompt_test_results**: ผลการทดสอบเพื่อวิเคราะห์

---

**💡 Tips สำหรับการใช้งาน**:

- เริ่มต้นด้วย `prompt:list` เพื่อดูสถานะปัจจุบัน
- ใช้ `prompt:debug` เมื่อต้องการเข้าใจ workflow
- ใช้ `--save` เมื่อทำการทดสอบเพื่อเก็บข้อมูล
- ใช้ `prompt:analyze` เป็นประจำเพื่อปรับปรุงประสิทธิภาพ

**⚠️ ข้อควรระวัง**:

- อย่าลืม backup PROMPT_ENCRYPTION_KEY
- ทดสอบก่อน activate version ใหม่
- ระวังการใช้ deactivate ใน production