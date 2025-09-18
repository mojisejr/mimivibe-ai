# Ask Error Handling Implementation Plan

**Last Updated**: 2025-01-27 14:30:00  
**Status**: Ready for Implementation  
**Scope**: API Error Categorization และ User Experience Improvements

## สถานะปัจจุบัน

### ✅ สิ่งที่ทำเสร็จแล้ว
- **Frontend**: `AskPage.tsx` แสดง `validationReason` โดยตรงแล้ว
- **Workflow**: มี conditional routing และ error handler node แล้ว
- **State Management**: มี enhanced error fields ใน `ReadingState` แล้ว

### ❌ สิ่งที่ต้องแก้ไข
- **API Error Mapping**: ยังไม่มีการจัดหมวดหมู่ error อย่างชัดเจน
- **Error Messages**: ยังใช้ generic messages ไม่เป็นมิตรกับผู้ใช้
- **Testing**: ยังไม่มีการทดสอบครอบคลุม

## แผนการแก้ไขแบบ Explicit

### Phase 1: API Error Categorization (ลำดับความสำคัญสูง)

**เป้าหมาย**: จัดหมวดหมู่ error และ response ให้ชัดเจน  
**ไฟล์เป้าหมาย**: `/src/app/api/readings/ask/route.ts`

#### 1.1 สร้าง Error Categories Utility
```typescript
// สร้างไฟล์ใหม่: /src/lib/utils/error-categories.ts
export interface ErrorCategory {
  type: 'validation' | 'generation' | 'timeout' | 'system';
  httpStatus: number;
  userMessage: string;
  canRetry: boolean;
}

export const ERROR_CATEGORIES: Record<string, ErrorCategory> = {
  VALIDATION_FAILED: {
    type: 'validation',
    httpStatus: 400,
    userMessage: 'คำถามของคุณไม่เหมาะสมสำหรับการทำนาย กรุณาปรับคำถามใหม่',
    canRetry: false
  },
  CARD_SELECTION_FAILED: {
    type: 'generation', 
    httpStatus: 500,
    userMessage: 'ไม่สามารถเลือกไพ่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
    canRetry: true
  },
  QUESTION_ANALYSIS_FAILED: {
    type: 'generation',
    httpStatus: 500, 
    userMessage: 'ไม่สามารถวิเคราะห์คำถามได้ กรุณาลองใหม่อีกครั้ง',
    canRetry: true
  },
  READING_GENERATION_FAILED: {
    type: 'generation',
    httpStatus: 500,
    userMessage: 'ไม่สามารถสร้างการทำนายได้ กรุณาลองใหม่อีกครั้ง', 
    canRetry: true
  },
  WORKFLOW_TIMEOUT: {
    type: 'timeout',
    httpStatus: 408,
    userMessage: 'การทำนายใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
    canRetry: true
  },
  SYSTEM_ERROR: {
    type: 'system',
    httpStatus: 500,
    userMessage: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง',
    canRetry: true
  }
};

export function categorizeWorkflowError(error: string): ErrorCategory {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('validation') || errorLower.includes('invalid question')) {
    return ERROR_CATEGORIES.VALIDATION_FAILED;
  }
  if (errorLower.includes('card') && errorLower.includes('failed')) {
    return ERROR_CATEGORIES.CARD_SELECTION_FAILED;
  }
  if (errorLower.includes('question analysis') || errorLower.includes('analyzer')) {
    return ERROR_CATEGORIES.QUESTION_ANALYSIS_FAILED;
  }
  if (errorLower.includes('reading') && errorLower.includes('failed')) {
    return ERROR_CATEGORIES.READING_GENERATION_FAILED;
  }
  if (errorLower.includes('timeout')) {
    return ERROR_CATEGORIES.WORKFLOW_TIMEOUT;
  }
  
  return ERROR_CATEGORIES.SYSTEM_ERROR;
}
```

#### 1.2 ปรับปรุง API Route Error Handling
```typescript
// ใน /src/app/api/readings/ask/route.ts
import { categorizeWorkflowError, ERROR_CATEGORIES } from '@/lib/utils/error-categories';

// แทนที่ error handling section ปัจจุบัน
if (workflowResult.error) {
  const category = categorizeWorkflowError(workflowResult.error);
  
  const errorResponse = {
    success: false,
    error: category.type,
    message: category.userMessage,
    canRetry: category.canRetry,
    timestamp: new Date().toISOString(),
    path: '/api/readings/ask',
    validationReason: workflowResult.validationReason,
    isValid: workflowResult.isValid,
  };

  return NextResponse.json(errorResponse, { status: category.httpStatus });
}
```

### Phase 2: Enhanced Error Response Structure (ลำดับความสำคัญสูง)

**เป้าหมาย**: ปรับปรุง interface และ response structure  
**ไฟล์เป้าหมาย**: `/src/types/reading.ts`

#### 2.1 ปรับปรุง ReadingError Interface
```typescript
// ใน /src/types/reading.ts
export interface ReadingError {
  success: false;
  error: 'validation' | 'generation' | 'timeout' | 'system';
  message: string;
  canRetry: boolean;
  timestamp: string;
  path: string;
  validationReason?: string;
  isValid?: boolean;
}
```

### Phase 3: Frontend Error Handling Enhancement (ลำดับความสำคัญกลาง)

**เป้าหมาย**: ปรับปรุง error display ใน frontend  
**ไฟล์เป้าหมาย**: `/src/hooks/useErrorHandler.ts`

#### 3.1 เพิ่ม Error Category Support
```typescript
// ใน /src/hooks/useErrorHandler.ts - เพิ่ม function ใหม่
const processApiError = (error: any): ProcessedError => {
  if (error.canRetry !== undefined) {
    return {
      message: error.message,
      canRetry: error.canRetry,
      isValidationError: error.error === 'validation'
    };
  }
  
  // fallback to existing logic
  return processError(error);
};
```

### Phase 4: Testing และ Validation (ลำดับความสำคัญกลาง)

**เป้าหมาย**: ทดสอบทุก error scenarios  

#### 4.1 Test Cases ที่ต้องทดสอบ
1. **Validation Errors**: คำถามไม่เหมาะสม → แสดง validationReason
2. **Generation Errors**: AI ล้มเหลว → แสดง retry option
3. **Timeout Errors**: ใช้เวลานาน → แสดง timeout message
4. **System Errors**: ข้อผิดพลาดทั่วไป → แสดง generic error

#### 4.2 Manual Testing Checklist
- [ ] ทดสอบ validation error response
- [ ] ทดสอบ generation error response  
- [ ] ทดสอบ timeout error response
- [ ] ทดสอบ system error response
- [ ] ตรวจสอบ error messages ภาษาไทย
- [ ] ตรวจสอบ canRetry flag
- [ ] ตรวจสอบ HTTP status codes

## ลำดับการ Implementation

### Step 1: สร้าง Error Categories (30 นาที)
1. สร้างไฟล์ `/src/lib/utils/error-categories.ts`
2. เพิ่ม error categorization logic

### Step 2: ปรับปรุง API Route (20 นาที)  
1. Import error categories
2. แทนที่ error handling logic
3. ทดสอบ API responses

### Step 3: ปรับปรุง Types (10 นาที)
1. อัพเดท `ReadingError` interface
2. เพิ่ม `canRetry` field

### Step 4: Testing (30 นาที)
1. ทดสอบแต่ละ error scenario
2. ตรวจสอบ error messages
3. ตรวจสอบ HTTP status codes

## เกณฑ์การประเมินผล

### ✅ Success Criteria
- [ ] Error messages เป็นภาษาไทยที่เข้าใจง่าย
- [ ] HTTP status codes ถูกต้องตาม error type
- [ ] `canRetry` flag ทำงานถูกต้อง
- [ ] ไม่มี breaking changes กับ frontend
- [ ] Build ผ่านไม่มี TypeScript errors

### 🎯 Expected Benefits
1. **User Experience**: ผู้ใช้เข้าใจ error messages ได้ดีขึ้น
2. **Debugging**: ง่ายต่อการ debug และ maintenance  
3. **Consistency**: Error handling มีมาตรฐานเดียวกัน
4. **Reliability**: ระบบมีความเสถียรมากขึ้น

---

**หมายเหตุ**: แผนนี้เน้นการแก้ไขปัญหาที่เหลืออยู่อย่างเฉพาะเจาะจง โดยไม่ทำการเปลี่ยนแปลงใหญ่ที่อาจส่งผลกระทบต่อระบบที่ทำงานอยู่แล้ว
