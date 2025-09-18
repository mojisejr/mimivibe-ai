# Current Focus

**Last Updated**: 2025-09-18 23:08:14  
**Context**: from `/Users/non/dev/vibes/mimi-vibes-v3/docs/ask-error-plan.md` implement Phase 5: ค่อยๆ Migrate ไป Error Folder Structure

## Phase 5 Implementation Plan

**เป้าหมาย**: ย้าย error-related files ไป `/src/lib/errors/` ทีละไฟล์  
**ความเสี่ยง**: **ปานกลาง** - มี file movements แต่ทำทีละไฟล์

### Target Folder Structure
```
/src/lib/errors/
├── categories.ts      # จาก /src/lib/utils/error-categories.ts
├── messages.ts        # จาก /src/lib/error-messages.ts
├── handlers/
│   ├── frontend.ts    # Error handlers สำหรับ frontend
│   ├── backend.ts     # Error handlers สำหรับ backend
│   └── ai.ts          # Error handlers สำหรับ AI workflow
└── types.ts           # Error-related types
```

### Success Criteria
- [ ] สร้าง folder structure `/src/lib/errors/`
- [ ] ย้าย `error-categories.ts` ไป `/src/lib/errors/categories.ts`
- [ ] ย้าย `error-messages.ts` ไป `/src/lib/errors/messages.ts`
- [ ] อัพเดท imports ทีละไฟล์
- [ ] ทดสอบหลังย้ายแต่ละไฟล์
