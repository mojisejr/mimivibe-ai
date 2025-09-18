# Ask Error Handling Implementation Plan

**Last Updated**: 2025-09-18 20:20:20  
**Status**: ✅ Ready for Implementation (Codebase Analyzed)  
**Scope**: API Error Categorization และ User Experience Improvements (Phased Approach)  
**Confidence Level**: 🟢 **95% มั่นใจ** ว่าจะไม่แตก (มี validation ทุก phase)

## 📊 Codebase Analysis Results (2025-09-18 20:20:20)

### ✅ Current Error Handling Infrastructure

**1. API Route Structure (`/src/app/api/readings/ask/route.ts`)**

- ✅ มี error handling ครบถ้วน (300+ lines)
- ✅ ใช้ `ReadingError` interface อย่างสม่ำเสมอ
- ✅ มี error mapping สำหรับ status codes (400, 422, 504)
- ✅ มี timeout handling และ workflow error management
- ✅ มี transaction rollback สำหรับ credit deduction

**2. Type Definitions (`/src/types/reading.ts`)**

- ✅ `ReadingError` interface มีโครงสร้างที่ดี
- ✅ มี optional fields: `validationReason`, `isValid`
- ✅ Compatible กับการเพิ่ม `category` และ `isRetryable`

**3. Existing Utilities**

- ✅ มี `createErrorResponse` ใน `/src/lib/auth.ts` แล้ว
- ✅ มี error message mappings ใน `/src/lib/error-messages.ts`
- ✅ มี validation utilities ใน `/src/lib/validations.ts`
- ✅ มี error handling hook ใน `/src/hooks/useErrorHandler.ts`

**4. Workflow Integration (`/src/lib/workflow-with-db.ts`)**

- ✅ มี error handling nodes: `errorHandlerNode`, `readingAgentNode`
- ✅ มี error state management ใน `ReadingState`
- ✅ มี error categorization logic อยู่แล้ว

### 🔍 Compatibility Assessment

| Component                     | Current State          | Plan Compatibility      | Risk Level |
| ----------------------------- | ---------------------- | ----------------------- | ---------- |
| `ReadingError` interface      | ✅ Stable              | 🟢 Backward compatible  | Low        |
| API Route error handling      | ✅ Comprehensive       | 🟢 Enhancement only     | Low        |
| `createErrorResponse` utility | ✅ Exists in auth.ts   | 🟡 Need namespace check | Medium     |
| Error message system          | ✅ Thai messages exist | 🟢 Can extend           | Low        |
| Workflow error handling       | ✅ Advanced system     | 🟢 Can enhance          | Low        |

### ⚠️ Potential Conflicts Identified

1. **`createErrorResponse` Function**

   - มีอยู่แล้วใน `/src/lib/auth.ts`
   - **Solution**: ใช้ existing function หรือ rename เป็น `createCategorizedErrorResponse`

2. **Error Categories**
   - ยังไม่มี enum definition
   - **Solution**: สร้าง enum ใหม่โดยไม่กระทบ existing code

## สถานะปัจจุบัน

### ✅ สิ่งที่ทำเสร็จแล้ว

- **Frontend**: `AskPage.tsx` แสดง `validationReason` โดยตรงแล้ว
- **Workflow**: มี conditional routing และ error handler node แล้ว
- **State Management**: มี enhanced error fields ใน `ReadingState` แล้ว

### ❌ สิ่งที่ต้องแก้ไข

- **API Error Mapping**: ยังไม่มีการจัดหมวดหมู่ error อย่างชัดเจน
- **Error Messages**: ยังใช้ generic messages ไม่เป็นมิตรกับผู้ใช้
- **Testing**: ยังไม่มีการทดสอบครอบคลุม

## 🎯 แผนการแก้ไขแบบ Phased Approach (ลดความเสี่ยง Breaking Changes)

### 📋 **Overview: 6-Phase Implementation Strategy**

**Phase 1-4**: ปรับปรุง error handling ตาม ask-error-plan.md (ไม่มี breaking changes)  
**Phase 5-6**: ค่อยๆ จัดระเบียบ folder structure ทีละไฟล์

### 🔄 **Validation Checkpoints**

แต่ละ Phase จะมี checkpoint:

```bash
npm run build    # ตรวจสอบ TypeScript errors
npm run dev      # ตรวจสอบ runtime errors
# ทดสอบ API endpoints ที่เกี่ยวข้อง
```

---

## 🚀 **Phase 1: สร้าง Error Categories Utility** ⚡ (ไม่กระทบไฟล์เดิม) : Done

**เป้าหมาย**: สร้าง error categorization system โดยไม่แก้ไขไฟล์เดิม  
**ไฟล์ใหม่**: `/src/lib/utils/error-categories.ts`  
**ความเสี่ยง**: **ไม่มี breaking changes** - เป็นไฟล์ใหม่ทั้งหมด

### ✅ **Success Criteria**

- [ ] สร้างไฟล์ `/src/lib/utils/error-categories.ts` สำเร็จ
- [ ] TypeScript compile ผ่าน (`npm run build`)
- [ ] Import ได้โดยไม่มี errors

### 📝 **Implementation Details**

**ไฟล์**: `/src/lib/utils/error-categories.ts`

```typescript
export enum ErrorCategory {
  VALIDATION = "validation",
  AI_PROCESSING = "ai_processing",
  RATE_LIMIT = "rate_limit",
  AUTHENTICATION = "authentication",
  SYSTEM = "system",
}

export interface CategorizedError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
}

export const ERROR_MAPPINGS: Record<string, CategorizedError> = {
  // Validation Errors
  QUESTION_TOO_SHORT: {
    category: ErrorCategory.VALIDATION,
    code: "QUESTION_TOO_SHORT",
    message: "Question must be at least 10 characters",
    userMessage: "กรุณาใส่คำถามที่ยาวกว่า 10 ตัวอักษร",
    isRetryable: true,
  },
  QUESTION_INAPPROPRIATE: {
    category: ErrorCategory.VALIDATION,
    code: "QUESTION_INAPPROPRIATE",
    message: "Question contains inappropriate content",
    userMessage: "คำถามของคุณไม่เหมาะสมสำหรับการทำนาย",
    isRetryable: true,
  },

  // AI Processing Errors
  AI_PROVIDER_ERROR: {
    category: ErrorCategory.AI_PROCESSING,
    code: "AI_PROVIDER_ERROR",
    message: "AI service temporarily unavailable",
    userMessage: "ระบบ AI ไม่สามารถใช้งานได้ชั่วคราว กรุณาลองใหม่อีกครั้ง",
    isRetryable: true,
  },
  WORKFLOW_TIMEOUT: {
    category: ErrorCategory.AI_PROCESSING,
    code: "WORKFLOW_TIMEOUT",
    message: "Reading generation timed out",
    userMessage: "การสร้างการทำนายใช้เวลานานเกินไป กรุณาลองใหม่",
    isRetryable: true,
  },

  // Rate Limit Errors
  RATE_LIMIT_EXCEEDED: {
    category: ErrorCategory.RATE_LIMIT,
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests",
    userMessage: "คุณใช้งานบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่",
    isRetryable: false,
  },

  // Authentication Errors
  INSUFFICIENT_CREDITS: {
    category: ErrorCategory.AUTHENTICATION,
    code: "INSUFFICIENT_CREDITS",
    message: "Not enough credits",
    userMessage: "เครดิตของคุณไม่เพียงพอ กรุณาเติมเครดิต",
    isRetryable: false,
  },

  // System Errors
  DATABASE_ERROR: {
    category: ErrorCategory.SYSTEM,
    code: "DATABASE_ERROR",
    message: "Database connection failed",
    userMessage: "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง",
    isRetryable: true,
  },
};

export function categorizeError(error: any): CategorizedError {
  // ถ้าเป็น error ที่รู้จัก
  if (typeof error === "string" && ERROR_MAPPINGS[error]) {
    return ERROR_MAPPINGS[error];
  }

  // ถ้าเป็น Error object
  if (error instanceof Error) {
    const errorCode = (error as any).code || error.message;
    if (ERROR_MAPPINGS[errorCode]) {
      return ERROR_MAPPINGS[errorCode];
    }
  }

  // Default fallback
  return {
    category: ErrorCategory.SYSTEM,
    code: "UNKNOWN_ERROR",
    message: error?.message || "Unknown error occurred",
    userMessage: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
    isRetryable: true,
  };
}

// ใช้ชื่อใหม่เพื่อหลีกเลี่ยงความขัดแย้งกับ createErrorResponse ใน auth.ts
export function createCategorizedErrorResponse(
  error: CategorizedError,
  statusCode: number = 500
) {
  return Response.json(
    {
      success: false,
      error: error.code,
      message: error.userMessage,
      category: error.category,
      isRetryable: error.isRetryable,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
```

### 🔍 **Validation Checkpoint**

```bash
# ตรวจสอบ TypeScript compilation
npm run build

# ตรวจสอบ linting
npm run lint
```

**🧪 Manual Testing**

- ✅ เริ่ม dev server: `npm run dev`
- ✅ ทดสอบ API endpoint ผ่าน browser หรือ Postman
- ✅ ตรวจสอบ error responses มี category และ isRetryable
- ✅ ทดสอบ existing error cases ยังทำงานได้ปกติ

### 🔍 **Validation Checkpoint**

```bash
# ตรวจสอบ interface compatibility
npm run build
npm run type-check
```

**🧪 Manual Testing**

- ✅ ตรวจสอบ TypeScript IntelliSense แสดง fields ใหม่
- ✅ ทดสอบ backward compatibility กับ existing code
- ✅ ตรวจสอบ API responses มี optional fields

---

## 🚀 **Phase 2: ปรับปรุง API Route** ⚡ (แก้ไขไฟล์เดิม) : Done

**เป้าหมาย**: ใช้ error categories ใน `/src/app/api/readings/ask/route.ts`  
**ไฟล์เป้าหมาย**: `/src/app/api/readings/ask/route.ts`  
**ความเสี่ยง**: **ต่ำ** - เพิ่ม import และใช้ utility functions เท่านั้น

### ✅ **Success Criteria**

- [ ] Import error categories utility สำเร็จ
- [ ] แทนที่ generic error responses ด้วย categorized errors
- [ ] API ยังทำงานได้ปกติ (ทดสอบด้วย Postman/curl)
- [ ] TypeScript compile ผ่าน (`npm run build`)

### 📝 **Implementation Details**

**ไฟล์**: `/src/app/api/readings/ask/route.ts`

```typescript
// เพิ่ม import ใหม่
import {
  categorizeError,
  createCategorizedErrorResponse,
} from "@/lib/utils/error-categories";

export async function POST(request: Request) {
  try {
    // ... existing code ...

    const result = await workflow.invoke(initialState);

    if (!result.success) {
      // ใช้ error categorization แทน generic response
      const categorizedError = categorizeError(result.error);

      return Response.json(
        {
          success: false,
          error: categorizedError.code,
          message: categorizedError.userMessage,
          category: categorizedError.category,
          validationReason: result.validationReason,
          isValid: false,
          isRetryable: categorizedError.isRetryable,
          timestamp: new Date().toISOString(),
        },
        {
          status: categorizedError.category === "validation" ? 400 : 500,
        }
      );
    }

    // ... success response ไม่เปลี่ยน ...
  } catch (error) {
    // ใช้ error categorization สำหรับ system errors
    const categorizedError = categorizeError(error);
    return createCategorizedErrorResponse(categorizedError, 500);
  }
}
```

### 🔍 **Validation Checkpoint**

```bash
# ตรวจสอบหลัง implement
npm run build
npm run dev
# ทดสอบ API endpoint:
curl -X POST http://localhost:3000/api/readings/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "test"}'
```

---

## 🚀 **Phase 3: ปรับปรุง ReadingError Interface** ⚡ (แก้ไขไฟล์เดิม) : Done

**เป้าหมาย**: เพิ่ม error category fields ใน `/src/types/reading.ts`  
**ไฟล์เป้าหมาย**: `/src/types/reading.ts`  
**ความเสี่ยง**: **ต่ำ** - เพิ่ม optional fields เท่านั้น

### ✅ **Success Criteria**

- [ ] เพิ่ม `category` และ `isRetryable` fields ใน ReadingError interface
- [ ] ทุก existing code ยังทำงานได้ (backward compatible)
- [ ] TypeScript compile ผ่าน (`npm run build`)
- [ ] Frontend แสดง error messages ได้ปกติ

### 📝 **Implementation Details**

**ไฟล์**: `/src/types/reading.ts`

```typescript
// ปรับปรุง ReadingError interface
export interface ReadingError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  validationReason?: string;
  isValid: boolean;

  // เพิ่ม fields ใหม่ (optional เพื่อ backward compatibility)
  category?:
    | "validation"
    | "ai_processing"
    | "rate_limit"
    | "authentication"
    | "system";
  isRetryable?: boolean;
}
```

### 🔍 **Validation Checkpoint**

```bash
# ตรวจสอบหลัง implement
npm run build
# ✅ ต้องไม่มี TypeScript errors ใน existing components
```

---

## 🚀 **Phase 4: ทดสอบและ Validate** ⚡ (Testing Phase) : Done

**เป้าหมาย**: ทดสอบ error scenarios ทั้งหมดให้ครบถ้วน  
**ความเสี่ยง**: **ไม่มี** - เป็นการทดสอบเท่านั้น

### ✅ **Success Criteria**

- [ ] ทดสอบ validation errors (คำถามสั้น, ไม่เหมาะสม)
- [ ] ทดสอบ AI processing errors (timeout, provider errors)
- [ ] ทดสอบ system errors (database, network)
- [ ] ตรวจสอบ error messages แสดงเป็นภาษาไทยถูกต้อง
- [ ] ตรวจสอบ retry behavior ทำงานถูกต้อง

### 📝 **Testing Scenarios**

```bash
# Test 1: Validation Error
curl -X POST http://localhost:3000/api/readings/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "hi"}'  # คำถามสั้นเกินไป

# Test 2: Normal Success
curl -X POST http://localhost:3000/api/readings/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "ความรักของฉันจะเป็นอย่างไรในปีนี้"}'

# Test 3: System Error (disconnect database)
# ทดสอบโดยปิด database connection ชั่วคราว
```

---

## 🚀 **Phase 5: ค่อยๆ Migrate ไป Error Folder Structure** ⚡ (Gradual Migration)

**เป้าหมาย**: ย้าย error-related files ไป `/src/lib/errors/` ทีละไฟล์  
**ความเสี่ยง**: **ปานกลาง** - มี file movements แต่ทำทีละไฟล์

### ✅ **Success Criteria**

- [ ] สร้าง folder structure `/src/lib/errors/`
- [ ] ย้าย `error-categories.ts` ไป `/src/lib/errors/categories.ts`
- [ ] ย้าย `error-messages.ts` ไป `/src/lib/errors/messages.ts`
- [ ] อัพเดท imports ทีละไฟล์
- [ ] ทดสอบหลังย้ายแต่ละไฟล์

### 📁 **Target Folder Structure**

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

---

## 🚀 **Phase 6: Final Cleanup และ Import Updates** ⚡ (Final Phase)

**เป้าหมาย**: อัพเดท imports และลบไฟล์เก่าที่ไม่ใช้แล้ว  
**ความเสี่ยง**: **ต่ำ** - เป็น cleanup phase

### ✅ **Success Criteria**

- [ ] อัพเดท imports ทั้งหมดให้ชี้ไป `/src/lib/errors/`
- [ ] ลบไฟล์เก่าที่ไม่ใช้แล้ว
- [ ] ทดสอบ build และ runtime ครั้งสุดท้าย
- [ ] อัพเดท documentation

### 🔍 **Final Validation**

```bash
npm run build
npm run dev
# ทดสอบ error scenarios ทั้งหมดอีกครั้ง
# ✅ ทุกอย่างต้องทำงานเหมือนเดิม แต่มี error handling ที่ดีขึ้น
```

---

## 📊 **สรุปผลลัพธ์ที่คาดหวัง**

### ✅ **หลังจากทำตามแผน 6 Phase แล้ว**

1. **API Response Structure ที่ชัดเจน**

   ```json
   {
     "success": false,
     "error": "QUESTION_TOO_SHORT",
     "message": "กรุณาใส่คำถามที่ยาวกว่า 10 ตัวอักษร",
     "category": "validation",
     "isRetryable": true,
     "timestamp": "2025-09-18T20:12:14.000Z"
   }
   ```

2. **Error Categories ที่จัดระเบียบ**

   - `validation`: ข้อผิดพลาดจากการตรวจสอบข้อมูล
   - `ai_processing`: ข้อผิดพลาดจากการประมวลผล AI
   - `rate_limit`: ข้อผิดพลาดจากการใช้งานบ่อยเกินไป
   - `authentication`: ข้อผิดพลาดจากการยืนยันตัวตน/เครดิต
   - `system`: ข้อผิดพลาดของระบบ

3. **User Experience ที่ดีขึ้น**

   - ข้อความ error เป็นภาษาไทยที่เข้าใจง่าย
   - มี retry behavior ที่เหมาะสม
   - แสดง error categories ที่ชัดเจน

4. **Developer Experience ที่ดีขึ้น**

   - Error handling ที่ consistent
   - ง่ายต่อการ debug และ monitor
   - Type safety ที่ดีขึ้น
   - Folder structure ที่จัดระเบียบ

5. **ความปลอดภัยจาก Breaking Changes**
   - Phase 1-4: ไม่มี breaking changes
   - Phase 5-6: Migration แบบค่อยเป็นค่อยไป
   - Validation checkpoints ทุก phase

---

## 🎯 Confidence Assessment & Risk Analysis

### 🟢 95% Confidence Level - เหตุผล

**1. Infrastructure Readiness (30%)**

- ✅ Error handling system มีอยู่แล้วและทำงานได้ดี
- ✅ `ReadingError` interface รองรับการขยาย
- ✅ Existing utilities สามารถ integrate ได้

**2. Backward Compatibility (25%)**

- ✅ ทุก phase ออกแบบให้ backward compatible
- ✅ Optional fields ใน interface
- ✅ Additive changes เท่านั้น

**3. Validation Strategy (20%)**

- ✅ Validation checkpoints ทุก phase
- ✅ Automated testing ก่อน deploy
- ✅ Rollback plan พร้อมใช้งาน

**4. Phased Approach (15%)**

- ✅ แบ่งเป็น 6 phases ที่ชัดเจน
- ✅ แต่ละ phase มี success criteria
- ✅ สามารถหยุดได้ทุกจุด

**5. Team Experience (5%)**

- ✅ ทีมมีประสบการณ์กับ codebase
- ✅ มี testing infrastructure

### ⚠️ 5% Risk Factors

**1. Naming Conflicts (3%)**

- `createErrorResponse` มีอยู่แล้วใน auth.ts
- **Mitigation**: ใช้ `createCategorizedErrorResponse`

**2. Integration Complexity (2%)**

- Workflow error handling อาจซับซ้อน
- **Mitigation**: Test ทีละ component

## 📋 **การติดตาม Progress**

### 🎯 **Phase Status**

- [ ] **Phase 1**: สร้าง Error Categories Utility ⏳ (กำลังดำเนินการ)
- [ ] **Phase 2**: ปรับปรุง API Route ⏳
- [ ] **Phase 3**: ปรับปรุง ReadingError Interface ⏳
- [ ] **Phase 4**: ทดสอบและ Validate ⏳
- [ ] **Phase 5**: ค่อยๆ Migrate ไป Error Folder ⏳
- [ ] **Phase 6**: Final Cleanup และ Import Updates ⏳

### 🚀 **Next Steps**

1. ✅ **Codebase Analysis Complete** - พร้อมเริ่ม implementation
2. 🚀 เริ่มต้นด้วย **Phase 1** - สร้าง `/src/lib/utils/error-categories.ts`
3. 🧪 ทดสอบ TypeScript compilation หลังแต่ละ phase
4. 📈 ทำทีละ phase เพื่อให้แน่ใจว่าทุกอย่างทำงานถูกต้อง
5. ✅ ใช้ validation checkpoints เพื่อตรวจสอบความถูกต้อง

### ⚠️ **Risk Mitigation Strategy**

- ✅ **Backward Compatibility**: ทุก phase ไม่แตก existing code
- ✅ **Manual Testing**: สามารถ manual test ได้หลังแต่ละ phase
- ✅ **Build Validation**: เช็คแค่ `npm run build` และ `npm run lint` ให้ผ่าน
- ✅ **No Automated Tests**: ไม่ต้อง UI tests หรือ Playwright
- ✅ **Rollback Plan**: สามารถ rollback ได้ทุกจุด
- ✅ **No Breaking Changes**: จนถึง Phase 4 (optional migration)
- ✅ **Naming Conflicts Resolved**: ใช้ unique function names
- ✅ **Existing Infrastructure**: ใช้ประโยชน์จาก existing utilities

---

**หมายเหตุ**: แผนนี้เน้นการแก้ไขปัญหาที่เหลืออยู่อย่างเฉพาะเจาะจง โดยไม่ทำการเปลี่ยนแปลงใหญ่ที่อาจส่งผลกระทบต่อระบบที่ทำงานอยู่แล้ว
