# Ask Error Handling Plan - LangGraph Workflow Enhancement

**Last Updated**: 2025-09-18 00:16:04  
**Scope**: LangGraph workflow error handling improvements only (UI changes excluded)

## Current State Analysis

### 🔍 Codebase Analysis Results

#### 1. LangGraph Workflow Structure (`/src/lib/langgraph/workflow-with-db.ts`)

**Current Flow**:
```
START → questionFilter → cardPicker → questionAnalyzer → readingAgent → END
```

**Current Error Handling**:
- **Linear execution**: No conditional routing based on errors
- **Generic error messages**: All nodes use similar error patterns
- **No early termination**: Workflow continues even after errors
- **Limited error context**: Only basic error strings in state

**Current State Structure**:
```typescript
export const ReadingState = Annotation.Root({
  question: Annotation<string>,
  userId: Annotation<string>,
  isValid: Annotation<boolean>,
  validationReason: Annotation<string>,
  selectedCards: Annotation<SelectedCard[]>,
  cardCount: Annotation<number>,
  questionAnalysis: Annotation<{
    mood: string;
    topic: string;
    period: string;
  }>,
  reading: Annotation<ReadingStructure>,
  error: Annotation<string>, // ❌ Too generic
});
```

**Current Error Patterns in Nodes**:
- `questionFilterNode`: `"Question filter failed: " + error.message`
- `cardPickerNode`: `"Card picker failed: " + error.message`
- `questionAnalyzerNode`: `"Question analyzer failed: " + error.message`
- `readingAgentNode`: `"Reading agent failed: " + error.message`

#### 2. API Route Error Handling (`/src/app/api/readings/ask/route.ts`)

**Current Error Processing**:
- **Timeout handling**: Special case for "Reading timeout" errors (408 status)
- **Generic fallback**: All other workflow errors become 500 Internal Server Error
- **Credit protection**: Credits only deducted after successful workflow completion
- **Error structure**: Uses `ReadingError` interface with basic fields

**Current Error Response Structure**:
```typescript
interface ReadingError {
  success: false;
  error: string;        // ❌ Generic category
  message: string;      // ❌ Generic message
  timestamp: string;
  path: string;
}
```

### 🎯 Identified Issues

1. **No conditional routing**: Workflow continues executing even when errors occur
2. **Generic error messages**: All errors look the same to users
3. **No error categorization**: Cannot distinguish between validation vs generation errors
4. **Limited debugging context**: Hard to identify which node failed and why
5. **No early termination**: Wastes resources continuing after failures

## Enhanced Error State Design

### New Error State Structure

```typescript
export const ReadingState = Annotation.Root({
  // ... existing fields ...
  error: Annotation<{
    hasError: boolean;
    type: 'validation' | 'generation' | 'timeout' | 'system' | 'ai_provider';
    node: 'questionFilter' | 'cardPicker' | 'questionAnalyzer' | 'readingAgent';
    message: string;
    userMessage: string;  // User-friendly message
    context: Record<string, any>;
    timestamp: string;
  } | null>,
});
```

### Error Categories & User Messages

| Error Type | Node | User Message | HTTP Status |
|------------|------|--------------|-------------|
| `validation` | `questionFilter` | "คำถามของคุณไม่เหมาะสมสำหรับการทำนาย กรุณาปรับคำถามใหม่" | 400 |
| `generation` | `cardPicker` | "ไม่สามารถเลือกไพ่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" | 500 |
| `generation` | `questionAnalyzer` | "ไม่สามารถวิเคราะห์คำถามได้ กรุณาลองใหม่อีกครั้ง" | 500 |
| `generation` | `readingAgent` | "ไม่สามารถสร้างการทำนายได้ กรุณาลองใหม่อีกครั้ง" | 500 |
| `timeout` | `any` | "การทำนายใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง" | 408 |
| `ai_provider` | `any` | "ระบบ AI ไม่พร้อมใช้งาน กรุณาลองใหม่ในภายหลัง" | 503 |
| `system` | `any` | "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง" | 500 |

## 🔧 แผนการแก้ไขแบบละเอียด

### Phase 1: เพิ่ม Conditional Routing

#### 1.1 ปรับปรุง shouldContinue Function

```typescript
// ใน workflow-with-db.ts
const shouldContinue = (state: ReadingState): string => {
  // ตรวจสอบ error ในแต่ละ step
  if (state.questionFilter?.error) {
    return "error_handler";
  }

  if (state.questionFilter?.isValid === false) {
    return "error_handler";
  }

  if (state.cardPicker?.error) {
    return "error_handler";
  }

  if (state.questionAnalyzer?.error) {
    return "error_handler";
  }

  if (state.readingAgent?.error) {
    return "error_handler";
  }

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!state.questionAnalyzer?.mood || !state.questionAnalyzer?.topic) {
    return "error_handler";
  }

  if (
    !state.cardPicker?.selectedCards ||
    state.cardPicker.selectedCards.length === 0
  ) {
    return "error_handler";
  }

  return "continue";
};
```

#### 1.2 สร้าง Error Handler Node

```typescript
const errorHandlerNode = async (state: ReadingState): Promise<ReadingState> => {
  console.log("[DEBUG] Error Handler Node - Processing errors");

  // รวบรวม error messages
  const errors: string[] = [];

  if (state.questionFilter?.error) {
    errors.push(`Question Filter: ${state.questionFilter.error}`);
  }

  if (state.cardPicker?.error) {
    errors.push(`Card Picker: ${state.cardPicker.error}`);
  }

  if (state.questionAnalyzer?.error) {
    errors.push(`Question Analyzer: ${state.questionAnalyzer.error}`);
  }

  if (state.readingAgent?.error) {
    errors.push(`Reading Agent: ${state.readingAgent.error}`);
  }

  // สร้าง consolidated error
  const consolidatedError =
    errors.length > 0 ? errors.join("; ") : "Unknown workflow error";

  return {
    ...state,
    workflowError: consolidatedError,
    isComplete: false,
    hasError: true,
  };
};
```

### Phase 2: ปรับปรุง State Management

#### 2.1 เพิ่ม Error Fields ใน ReadingState

```typescript
const ReadingState = Annotation.Root({
  // ... existing fields ...

  // เพิ่ม error tracking fields
  workflowError: Annotation<string | null>({
    reducer: (current, update) => update ?? current,
    default: () => null,
  }),

  hasError: Annotation<boolean>({
    reducer: (current, update) => update ?? current,
    default: () => false,
  }),

  errorSource: Annotation<string | null>({
    reducer: (current, update) => update ?? current,
    default: () => null,
  }),
});
```

#### 2.2 ปรับปรุง Workflow Graph

```typescript
const workflow = new StateGraph(ReadingState)
  .addNode("questionFilter", questionFilterNode)
  .addNode("questionAnalyzer", questionAnalyzerNode)
  .addNode("cardPicker", cardPickerNode)
  .addNode("readingAgent", readingAgentNode)
  .addNode("errorHandler", errorHandlerNode) // เพิ่ม error handler
  .addEdge(START, "questionFilter")
  .addConditionalEdges("questionFilter", shouldContinue, {
    continue: "questionAnalyzer",
    error_handler: "errorHandler",
  })
  .addConditionalEdges("questionAnalyzer", shouldContinue, {
    continue: "cardPicker",
    error_handler: "errorHandler",
  })
  .addConditionalEdges("cardPicker", shouldContinue, {
    continue: "readingAgent",
    error_handler: "errorHandler",
  })
  .addConditionalEdges("readingAgent", shouldContinue, {
    continue: END,
    error_handler: "errorHandler",
  })
  .addEdge("errorHandler", END);
```

### Phase 3: ปรับปรุง Individual Nodes

#### 3.1 ปรับปรุง questionFilterNode

```typescript
const questionFilterNode = async (
  state: ReadingState
): Promise<ReadingState> => {
  try {
    console.log("[DEBUG] Question Filter Node - Start");

    // ... existing logic ...

    if (parsedData === null || parsedData === undefined) {
      return {
        ...state,
        questionFilter: {
          isValid: false,
          error: "Failed to parse question filter response",
          reason: "Invalid AI response format",
        },
        errorSource: "questionFilter",
      };
    }

    // ... rest of logic ...
  } catch (error) {
    console.log("[DEBUG] Question Filter Node - Exception:", error);
    return {
      ...state,
      questionFilter: {
        isValid: false,
        error: `Question filter failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        reason: "System error",
      },
      errorSource: "questionFilter",
    };
  }
};
```

#### 3.2 ปรับปรุง Node อื่นๆ ในลักษณะเดียวกัน

- เพิ่ม `errorSource` ในทุก node
- ปรับปรุง error handling ให้สม่ำเสมอ
- เพิ่ม validation ที่เข้มงวดขึ้น

### Phase 4: ปรับปรุง API Route

#### 4.1 ปรับปรุง ask/route.ts

```typescript
// ใน generateTarotReading call
try {
  const result = await generateTarotReading(sanitizedQuestion);

  // ตรวจสอบ workflow error
  if (result.hasError || result.workflowError) {
    console.log("[ERROR] Workflow failed:", result.workflowError);

    // ไม่หักเครดิตเมื่อเกิด workflow error
    return NextResponse.json(
      createAIError(
        "WORKFLOW_ERROR",
        `การประมวลผลล้มเหลว: ${result.workflowError}`,
        { source: result.errorSource }
      ),
      { status: 422 } // Unprocessable Entity
    );
  }

  // ตรวจสอบความสมบูรณ์ของข้อมูล
  if (!result.readingAgent?.reading) {
    console.log("[ERROR] Incomplete reading data");

    return NextResponse.json(
      createAIError(
        "INCOMPLETE_READING",
        "ไม่สามารถสร้างการทำนายที่สมบูรณ์ได้",
        { result }
      ),
      { status: 422 }
    );
  }

  // ... continue with credit deduction and success flow ...
} catch (error) {
  // ... existing error handling ...
}
```

## 📊 Validation Criteria

### เกณฑ์การทดสอบ

#### 1. Error Handling Tests

- [ ] **Question Filter Error**: ทดสอบด้วยคำถามที่ไม่เหมาะสม
- [ ] **Card Picker Error**: จำลอง error ในการเลือกไพ่
- [ ] **Question Analyzer Error**: ทดสอบด้วย input ที่ทำให้ AI ตอบผิดรูปแบบ
- [ ] **Reading Agent Error**: จำลอง LLM failure

#### 2. Flow Control Tests

- [ ] **Early Termination**: ยืนยันว่า workflow หยุดเมื่อเกิด error
- [ ] **Error Source Identification**: ตรวจสอบว่าระบุแหล่งที่มาของ error ได้ถูกต้อง
- [ ] **HTTP Status Codes**: ยืนยัน status code ที่เหมาะสม

#### 3. Resource Efficiency Tests

- [ ] **Token Usage**: วัดการใช้ token เมื่อเกิด error ต้นทาง
- [ ] **Response Time**: วัดเวลาตอบสนองเมื่อ early termination
- [ ] **Credit Deduction**: ยืนยันว่าไม่หักเครดิตเมื่อเกิด workflow error

## 🚀 Implementation Priority

### ลำดับความสำคัญ

1. **High Priority** (ทำก่อน):

   - Phase 1: Conditional Routing
   - Phase 2: State Management
   - Phase 4: API Route Updates

2. **Medium Priority** (ทำตาม):

   - Phase 3: Individual Node Improvements
   - Comprehensive Testing

3. **Low Priority** (ทำหลัง):
   - Performance Optimization
   - Advanced Error Analytics

## 📝 Expected Benefits

### ประโยชน์ที่คาดหวัง

1. **User Experience**: ผู้ใช้ได้รับ feedback ที่ชัดเจนและรวดเร็ว
2. **Cost Efficiency**: ประหยัดค่าใช้จ่าย AI tokens
3. **System Reliability**: ระบบมีความเสถียรและคาดเดาได้มากขึ้น
4. **Debugging**: ง่ายต่อการ debug และ maintenance
5. **Credit Fairness**: ผู้ใช้ไม่เสียเครดิตเมื่อระบบมีปัญหา

---

**หมายเหตุ**: แผนนี้ออกแบบมาเพื่อแก้ไขปัญหาการจัดการ error ใน LangGraph workflow อย่างครอบคลุม โดยเน้นการหยุด workflow ที่จุดที่เกิดปัญหาและส่งคืน error ที่ชัดเจนแก่ผู้ใช้
