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
1. ใน Clerk Dashboard ไปที่ webhook ที่สร้าง
2. คลิก **"Testing"** tab
3. ส่ง test event `user.created`
4. ตรวจสอบ logs ในระบบของคุณ

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

## 🐛 Troubleshooting

### Webhook ไม่ทำงาน
- ✅ ตรวจสอบ `CLERK_WEBHOOK_SECRET` ใน `.env.local`
- ✅ ตรวจสอบ URL endpoint ถูกต้อง
- ✅ ตรวจสอบ events ที่เลือกใน Clerk Dashboard

### User ไม่ถูกสร้าง
- ✅ ดู logs ใน console
- ✅ ตรวจสอบ database connection
- ✅ ตรวจสอบ Prisma schema

### Error 400/500
- ✅ ตรวจสอบ webhook signature
- ✅ ตรวจสอบ JSON format ของ payload
- ✅ ดู error details ใน logs

## 📱 การทำงานใน Production

1. **Deploy** code ที่มี webhook endpoint
2. **อัพเดต** webhook URL ใน Clerk Dashboard เป็น production URL
3. **ตรวจสอบ** webhook ทำงานใน production environment
4. **Monitor** logs สำหรับ user creation

---

🚀 **หลังจากตั้งค่าเสร็จ user จะถูกสร้างอัตโนมัติเมื่อ login ครั้งแรก!**