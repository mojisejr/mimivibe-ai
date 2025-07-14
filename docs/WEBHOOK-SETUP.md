# 🔔 Clerk Webhook Setup Guide

## ปัญหาที่แก้ไข
ตอนนี้ระบบจะสร้าง User ใน database อัตโนมัติเมื่อมีการ login ครั้งแรกผ่าน Clerk webhook แทนที่จะรอให้เรียก API Profile

## 🛠️ การตั้งค่า Clerk Webhook

### 1. ไปที่ Clerk Dashboard
1. เข้า [Clerk Dashboard](https://dashboard.clerk.com/)
2. เลือก Project ของคุณ
3. ไปที่ **Webhooks** ในเมนูซ้าย

### 2. สร้าง Webhook Endpoint
1. คลิก **"Add Endpoint"**
2. กรอกข้อมูล:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Description**: `User Management Webhook`

### 3. เลือก Events
เลือก events ที่ต้องการ:
- ✅ `user.created` (สำคัญ - สร้าง user ใหม่)
- ✅ `user.updated` (อัพเดตข้อมูล user)
- ✅ `user.deleted` (จัดการ user ที่ถูกลบ)

### 4. ก็อป Webhook Secret
1. หลังจากสร้าง webhook แล้ว คลิกที่ endpoint ที่สร้าง
2. ในหน้า details จะมี **"Signing Secret"**
3. คลิก **"Reveal"** และ copy secret

### 5. เพิ่ม Environment Variable
เพิ่มใน `.env.local`:
```bash
# Clerk Webhook Secret
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 6. ทดสอบ Webhook

#### 🏠 Local Development Testing (แนะนำ)
**สำหรับการพัฒนาแบบ local ต้องใช้ ngrok เพื่อเปิด tunnel:**

```bash
# 1. Install ngrok (ถ้ายังไม่มี)
npm install -g ngrok

# 2. เปิด dev server
npm run dev

# 3. เปิด ngrok tunnel ใน terminal ใหม่
ngrok http 3000

# 4. จะได้ URL แบบ: https://abc123.ngrok.io
```

**ตั้งค่า Clerk Dashboard:**
1. ไปที่ **Webhooks** ใน Clerk Dashboard
2. อัพเดต **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
3. Save และทดสอบ

#### ⚡ Quick Testing (ใช้ Clerk Testing Tab)
1. ใน Clerk Dashboard ไปที่ webhook ที่สร้าง
2. คลิก **"Testing"** tab
3. ส่ง test event `user.created`
4. ตรวจสอบ logs ในระบบของคุณ

#### 🔍 การทดสอบแบบละเอียด
**Test Event payload ตัวอย่าง:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_test123",
    "email_addresses": [
      {
        "email_address": "test@example.com",
        "verification": {
          "status": "verified"
        }
      }
    ],
    "first_name": "Test",
    "last_name": "User",
    "image_url": "https://example.com/avatar.jpg",
    "created_at": 1640995200000
  }
}
```

## 🔍 การตรวจสอบ

### ดู Logs
```bash
# ใน development
npm run dev

# ดู logs ใน console จะมีข้อความแบบนี้:
# 🔔 Clerk webhook received
# 👤 Creating new user: user_xxxxx
# ✅ User created successfully
```

### ตรวจสอบ Database
```bash
# ตรวจสอบว่า user ถูกสร้างแล้ว
npm run db:seed  # หรือใช้ Prisma Studio
```

## 🎯 ผลลัพธ์ที่คาดหวัง

เมื่อ user login ครั้งแรก:
1. **Clerk จะส่ง webhook** `user.created`
2. **ระบบจะสร้าง user** ใน database อัตโนมัติพร้อม:
   - 5 Stars (free trial credits)
   - 5 Free Points (daily readings)
   - Level 1, EXP 0
   - Referral code
   - Welcome bonus transaction
3. **User สามารถใช้งานได้ทันที** ไม่ต้องรอเรียก Profile API

## 🧪 Step-by-Step Testing Guide

### Phase 1: Quick Test (5 นาที)
```bash
# 1. เปิด dev server และดู logs
npm run dev

# 2. ใน browser ใหม่ไปที่ Clerk Dashboard > Webhooks
# 3. คลิก webhook endpoint ที่สร้าง
# 4. ไปที่ "Testing" tab
# 5. เลือก "user.created" event
# 6. คลิก "Send Test"
# 7. ตรวจสอบ logs ใน terminal จะต้องเห็น:
#    🔔 Clerk webhook received
#    👤 Creating new user: user_xxxxx
#    ✅ User created successfully
```

### Phase 2: Real Local Test (10 นาที)
```bash
# 1. เปิด ngrok (terminal ใหม่)
ngrok http 3000

# 2. Copy ngrok URL (https://abc123.ngrok.io)
# 3. ใน Clerk Dashboard อัพเดต webhook URL:
#    https://abc123.ngrok.io/api/webhooks/clerk
# 4. Save webhook
# 5. ทดสอบสร้าง user ใหม่ผ่าน app หรือ Clerk Dashboard
# 6. ตรวจสอบ database ว่า user ถูกสร้าง
```

### Phase 3: Database Verification
```bash
# ตรวจสอบ user ที่สร้างใหม่
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function checkNewUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { 
      id: true, 
      name: true, 
      email: true, 
      stars: true, 
      freePoint: true,
      createdAt: true 
    }
  });
  console.log('🔍 Recent Users:', users);
  await prisma.\$disconnect();
}
checkNewUsers();
"
```

## 🐛 Troubleshooting

### ❌ Webhook ไม่ทำงาน (Local)
- ✅ ตรวจสอบ `CLERK_WEBHOOK_SECRET` ใน `.env.local` (ต้องมี quotes)
- ✅ ตรวจสอบ ngrok URL ถูกต้องใน Clerk Dashboard  
- ✅ ตรวจสอบ ngrok ยัง active อยู่ (`ngrok http 3000`)
- ✅ ตรวจสอบ dev server running ที่ port 3000

### ❌ User ไม่ถูกสร้าง
- ✅ ดู logs ใน console (ต้องเห็นข้อความ 🔔 webhook received)
- ✅ ตรวจสอบ database connection (`npm run db:seed` ทำงานไหม)
- ✅ ตรวจสอบ CLERK_WEBHOOK_SECRET ถูกต้อง
- ✅ ดู Network tab ใน Clerk Dashboard webhook logs

### ❌ Error 400/500
- ✅ ตรวจสอบ webhook signature (secret ต้องตรงกัน)
- ✅ ตรวจสอบ JSON format ของ payload
- ✅ ดู error details ใน terminal logs
- ✅ ตรวจสอบ environment variables load ถูกต้อง

### ❌ ngrok ปัญหา
- ✅ `ngrok config check` - ตรวจสอบ config
- ✅ `ngrok http 3000 --log stdout` - ดู detailed logs
- ✅ ใช้ free ngrok account (มี rate limit)
- ✅ restart ngrok ถ้า URL หมดอายุ

## 📱 การทำงานใน Production

1. **Deploy** code ที่มี webhook endpoint
2. **อัพเดต** webhook URL ใน Clerk Dashboard เป็น production URL
3. **ตรวจสอบ** webhook ทำงานใน production environment
4. **Monitor** logs สำหรับ user creation

---

🚀 **หลังจากตั้งค่าเสร็จ user จะถูกสร้างอัตโนมัติเมื่อ login ครั้งแรก!**