# 🎯 Clerk Webhook Setup Instructions

## ✅ Test Results Summary
- **Webhook Endpoint**: ✅ Working
- **Signature Verification**: ✅ Working  
- **User Creation**: ✅ Working
- **Database Integration**: ✅ Working
- **Transaction Logging**: ✅ Working
- **Referral Code Generation**: ✅ Working

## 🔧 Current Setup
- **ngrok URL**: `https://963d075e5f28.ngrok-free.app`
- **Webhook Secret**: `whsec_/qM8IYHgdve2i8V6g0CUrfGhH2OYJXum`
- **Test User Created**: `user_test_1752501403152`

## 📋 Next Steps for Real Integration

### 1. Configure Clerk Dashboard
1. ไปที่ [Clerk Dashboard](https://dashboard.clerk.com/)
2. เลือก Project ของคุณ
3. ไปที่ **Webhooks** ในเมนูซ้าย
4. คลิก **"Add Endpoint"**

### 2. Webhook Configuration
```
Endpoint URL: https://963d075e5f28.ngrok-free.app/api/webhooks/clerk
Description: MiMiVibes User Management Webhook
```

### 3. Select Events
เลือก events เหล่านี้:
- ✅ `user.created` (สำคัญ - สร้าง user ใหม่)
- ✅ `user.updated` (อัพเดตข้อมูล user)
- ✅ `user.deleted` (จัดการ user ที่ถูกลบ)

### 4. Verify Webhook Secret
ใน Clerk Dashboard webhook settings จะมี "Signing Secret"
ตรวจสอบว่าตรงกับใน `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_/qM8IYHgdve2i8V6g0CUrfGhH2OYJXum
```

### 5. Test Real User Registration
1. ไปที่ app: `http://localhost:3000`
2. คลิก "Sign In" 
3. สร้าง user ใหม่ด้วย email ใหม่
4. ตรวจสอบ logs ใน terminal
5. ตรวจสอบ database ว่า user ถูกสร้าง

## 🧪 Testing Commands

### Check Recent Users
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function checkUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, stars: true, createdAt: true }
  });
  console.log('Recent Users:', users);
  await prisma.\$disconnect();
}
checkUsers();
"
```

### Test Webhook Again
```bash
node scripts/test-webhook.js https://963d075e5f28.ngrok-free.app
```

## 🚨 Important Notes

### ngrok URL Changes
- ngrok free URLs change when restart
- Need to update Clerk webhook URL if ngrok restarts
- For production, use permanent domain

### Monitoring Logs
Watch terminal for these messages:
```
🔔 Clerk webhook received
📨 Processing event: user.created for user: user_xxxxx
👤 Creating new user: user_xxxxx
✅ User created successfully
🎁 Welcome bonus and referral code created
```

### Error Handling
If webhook fails:
1. Check ngrok is running
2. Check dev server is running
3. Check webhook secret matches
4. Check Clerk Dashboard webhook logs

## 🎉 Success Criteria

When everything works correctly:
1. **New user registers** → Clerk sends webhook
2. **Webhook received** → User created in database
3. **Default values set**: 5 Stars, 5 Free Points, Level 1
4. **Welcome transaction** → Points added
5. **Referral code** → Generated automatically
6. **User can immediately** → Use the app (Profile, History, etc.)

---
**Status**: ✅ Ready for real testing!