# API-READINGS.md

## 🔮 Reading System & LangGraph Integration API

สำหรับ Round 3: LangGraph Integration + Core Reading Workflow

---

## LangGraph Workflow Architecture

### Workflow Nodes
```typescript
interface WorkflowNodes {
  questionFilter: {
    purpose: "เช็คคำหยาบคาย, multi-question";
    output: "throw ERR_INVALID_QUESTION or continue";
  };
  cardPicker: {
    purpose: "Logic JS เดิม"; 
    output: "{ pick: 3|5, cards: string[] }";
  };
  questionAnalysis: {
    purpose: "ใช้ structured output parser (Zod)";
    fields: "mood, topic, period";
  };
  cardMeaningRAG: {
    purpose: "Retrieve top-k=5 meanings จาก Supabase vector";
    status: "optional v2";
  };
  readingAgent: {
    purpose: "Generate reading ตาม context + SSE streaming";
  };
  outputBuilder: {
    purpose: "Format JSON ตาม UI spec + SSE chunks";
  };
}
```

---

## Core Reading API Endpoints

### Main Reading Workflow

#### Submit Question for Reading (Round 7A Updated)
```typescript
POST /api/readings/ask
Body: {
  question: string;
  language?: 'th' | 'en' | 'auto';
}
Response: {
  success: true;
  data: {
    readingId: string;
    question: string;
    questionAnalysis: {
      mood: string;
      topic: string;
      period: string;
    };
    cards: CardReading[]; // Full card objects for display
    reading: ReadingStructure; // Complete reading structure
    rewards: {
      exp: number;
      coins: number;
    };
    createdAt: string;
  };
}

// New TypeScript Types (Round 7A)
interface CardReading {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string;
  position: number;
  shortMeaning: string;
  keywords: string;
}

interface ReadingStructure {
  header: string;
  cards_reading: CardReading[]; // Full card objects included
  reading: string;
  suggestions: string[];
  final: string;
  end: string;
  notice: string;
}
```

#### Get Reading by ID
```typescript
GET /api/readings/[id]
Response: ReadingResponse
```

#### Save Reading to History
```typescript
POST /api/readings/[id]/save
Response: { success: boolean; saved: boolean; }
```

#### Delete Reading
```typescript
DELETE /api/readings/[id]
Response: { success: boolean; deleted: boolean; }
```

---

## Database Models (Updated Round 7A)

### Reading Model (JSON Structure)
```prisma
model Reading {
  id         String   @id @default(cuid())
  userId     String
  question   String
  answer     Json     // Changed from String to Json for structured reading data
  type       String   @default("tarot")
  isDeleted  Boolean  @default(false)
  isReviewed Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards       ReadingCard[]
  reviews     Review[]
  
  @@index([userId, createdAt])
  @@map("readings")
}

model Card {
  id           Int     @id
  name         String  @unique
  displayName  String
  arcana       String  // "Major" or "Minor"
  shortMeaning String  @db.Text
  longMeaning  String  @db.Text
  keywords     String  // Comma-separated
  imageUrl     String
  
  readingCards ReadingCard[]
  
  @@map("cards")
}

model ReadingCard {
  id        String @id @default(cuid())
  readingId String
  cardId    Int
  position  Int    // 1, 2, 3, 4, 5
  
  reading Reading @relation(fields: [readingId], references: [id], onDelete: Cascade)
  card    Card    @relation(fields: [cardId], references: [id])
  
  @@unique([readingId, position])
  @@map("reading_cards")
}

model Review {
  id            String   @id @default(cuid())
  readingId     String   @unique
  userId        String
  accurateLevel Int      // 0, 20, 50, 80, 100
  comment       String?  @db.Text
  reviewPeriod  Int?     // days since reading
  createdAt     DateTime @default(now())
  
  reading Reading @relation(fields: [readingId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("reviews")
}
```

---

## LangGraph Implementation

### Workflow Setup
```typescript
// src/lib/langgraph/workflow.ts
import { StateGraph, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.5-flash-preview-05-20",
  temperature: 0.7,
  streaming: true,
});

interface ReadingState {
  question: string;
  isValid: boolean;
  selectedCards: string[];
  cardCount: number;
  questionAnalysis: {
    mood: string;
    topic: string;
    period: string;
  };
  reading: string;
  error?: string;
}

// Node implementations
async function questionFilter(state: ReadingState): Promise<ReadingState> {
  // Check for profanity, multiple questions, etc.
  const question = state.question.trim();
  
  if (question.length < 5) {
    return { ...state, isValid: false, error: "คำถามสั้นเกินไป" };
  }
  
  if (question.length > 500) {
    return { ...state, isValid: false, error: "คำถามยาวเกินไป" };
  }
  
  // Simple multi-question detection
  const questionMarks = (question.match(/\?/g) || []).length;
  if (questionMarks > 1) {
    return { ...state, isValid: false, error: "กรุณาถามทีละคำถาม" };
  }
  
  return { ...state, isValid: true };
}

async function cardPicker(state: ReadingState): Promise<ReadingState> {
  // Simple card selection logic
  const cardCount = Math.random() > 0.3 ? 3 : 5; // 70% chance for 3 cards
  const availableCards = Array.from({ length: 78 }, (_, i) => i + 1); // 78 tarot cards
  
  const selectedCards = [];
  for (let i = 0; i < cardCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    selectedCards.push(availableCards.splice(randomIndex, 1)[0].toString());
  }
  
  return { ...state, selectedCards, cardCount };
}

async function questionAnalysis(state: ReadingState): Promise<ReadingState> {
  const prompt = `
  วิเคราะห์คำถาม: "${state.question}"
  
  ให้ระบุ:
  1. mood (อารมณ์): positive, neutral, negative, anxious, hopeful
  2. topic (หัวข้อ): love, career, money, health, family, general
  3. period (ช่วงเวลา): past, present, future, general
  
  ตอบเป็น JSON format:
  {"mood": "...", "topic": "...", "period": "..."}
  `;
  
  try {
    const response = await llm.invoke(prompt);
    const analysis = JSON.parse(response.content as string);
    
    return {
      ...state,
      questionAnalysis: analysis
    };
  } catch (error) {
    return {
      ...state,
      questionAnalysis: {
        mood: "neutral",
        topic: "general", 
        period: "general"
      }
    };
  }
}

async function readingAgent(state: ReadingState): Promise<ReadingState> {
  const { question, selectedCards, questionAnalysis, cardCount } = state;
  
  const prompt = `
  คุณคือ "แม่หมอมีมี่" หมอดูไพ่ทาโรต์ AI ที่อบอุ่นและเชื่อถือได้

  คำถาม: "${question}"
  ไพ่ที่จั่ว: ${selectedCards.join(', ')} (${cardCount} ใบ)
  การวิเคราะห์: อารมณ์ ${questionAnalysis.mood}, หัวข้อ ${questionAnalysis.topic}, ช่วงเวลา ${questionAnalysis.period}

  ให้คำทำนายในรูปแบบ JSON:
  {
    "header": "คำทักทายและทวนคำถาม",
    "reading": "คำทำนายหลักจากไพ่",
    "suggestions": ["คำแนะนำ 1", "คำแนะนำ 2", "คำแนะนำ 3"],
    "final": ["คำสรุป", "กำลังใจ"],
    "end": "คำปิดท้ายอบอุ่น",
    "notice": "ข้อความแจ้งเตือนเกี่ยวกับการดูดวง"
  }

  เขียนด้วยภาษาไทยที่อบอุ่น เป็นกันเอง และให้กำลังใจ
  `;
  
  try {
    const response = await llm.invoke(prompt);
    const reading = JSON.parse(response.content as string);
    
    return {
      ...state,
      reading: JSON.stringify(reading)
    };
  } catch (error) {
    return {
      ...state,
      error: "ไม่สามารถสร้างคำทำนายได้ในขณะนี้"
    };
  }
}

// Build workflow
const workflow = new StateGraph({ channels: { } })
  .addNode("questionFilter", questionFilter)
  .addNode("cardPicker", cardPicker)
  .addNode("questionAnalysis", questionAnalysis)
  .addNode("readingAgent", readingAgent)
  .addEdge("questionFilter", "cardPicker")
  .addEdge("cardPicker", "questionAnalysis")
  .addEdge("questionAnalysis", "readingAgent")
  .addEdge("readingAgent", END)
  .setEntryPoint("questionFilter");

export const compiledWorkflow = workflow.compile();
```

---

## API Implementation

### Reading Ask Endpoint
```typescript
// src/app/api/readings/ask/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compiledWorkflow } from '@/lib/langgraph/workflow'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question, language = 'th' } = body

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stars: true, freePoint: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalCredits = user.stars + user.freePoint
    if (totalCredits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // Run LangGraph workflow
    const initialState = {
      question: question.trim(),
      isValid: false,
      selectedCards: [],
      cardCount: 0,
      questionAnalysis: { mood: '', topic: '', period: '' },
      reading: ''
    }

    const result = await compiledWorkflow.invoke(initialState)

    if (!result.isValid) {
      return NextResponse.json(
        { error: result.error || 'Invalid question' },
        { status: 400 }
      )
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Get card details from database
    const cardIds = result.selectedCards.map(id => parseInt(id))
    const cards = await prisma.card.findMany({
      where: { id: { in: cardIds } },
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true
      }
    })

    // Create reading record
    const reading = await prisma.reading.create({
      data: {
        userId,
        question: question.trim(),
        answer: result.reading,
        type: 'tarot'
      }
    })

    // Create reading cards
    await Promise.all(
      result.selectedCards.map((cardId, index) =>
        prisma.readingCard.create({
          data: {
            readingId: reading.id,
            cardId: parseInt(cardId),
            position: index + 1
          }
        })
      )
    )

    // Deduct credits and add rewards
    const creditsToDeduct = user.freePoint > 0 ? 0 : 1 // Use free points first
    const expReward = 25
    const coinReward = 5

    await prisma.user.update({
      where: { id: userId },
      data: {
        stars: user.freePoint > 0 ? user.stars : user.stars - 1,
        freePoint: user.freePoint > 0 ? user.freePoint - 1 : user.freePoint,
        exp: { increment: expReward },
        coins: { increment: coinReward }
      }
    })

    // Record transaction
    await prisma.pointTransaction.create({
      data: {
        userId,
        eventType: 'READING_SPEND',
        deltaPoint: -creditsToDeduct,
        deltaCoins: coinReward,
        deltaExp: expReward,
        metadata: {
          readingId: reading.id,
          question: question.trim()
        }
      }
    })

    const readingData = JSON.parse(result.reading)

    return NextResponse.json({
      success: true,
      data: {
        readingId: reading.id,
        questionAnalysis: result.questionAnalysis,
        cards: cards.map((card, index) => ({
          ...card,
          position: index + 1
        })),
        reading: readingData,
        rewards: {
          exp: expReward,
          coins: coinReward
        },
        createdAt: reading.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Reading generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Reading History Endpoint
```typescript
// src/app/api/readings/history/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const reviewed = searchParams.get('reviewed')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where: any = {
      userId,
      isDeleted: false
    }

    if (reviewed !== null) {
      where.isReviewed = reviewed === 'true'
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where,
        include: {
          cards: {
            include: {
              card: {
                select: {
                  name: true,
                  displayName: true,
                  imageUrl: true
                }
              }
            },
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.reading.count({ where })
    ])

    const formattedReadings = readings.map(reading => ({
      id: reading.id,
      question: reading.question,
      createdAt: reading.createdAt.toISOString(),
      isReviewed: reading.isReviewed,
      cards: reading.cards.map(rc => ({
        name: rc.card.name,
        displayName: rc.card.displayName,
        imageUrl: rc.card.imageUrl
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        readings: formattedReadings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Reading history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Error Handling

### Reading-Specific Errors
```typescript
const readingErrorCodes = {
  INSUFFICIENT_CREDITS: "Insufficient credits for this operation",
  INVALID_QUESTION_FORMAT: "Question format is invalid", 
  AI_SERVICE_UNAVAILABLE: "AI service temporarily unavailable",
  READING_NOT_FOUND: "Reading not found",
  ALREADY_REVIEWED: "Reading already reviewed"
};
```

---

## Round 7A Changes Summary

### Breaking Changes Applied
- **Database Schema**: Reading.answer String → Json type
- **API Format**: Complete restructure, no SSE streaming
- **LangGraph Output**: New structured format with cards_reading
- **TypeScript Types**: New types in `/src/types/reading.ts`

### Migration Details
- **Migration**: `20250715022611_round7a_hard_reset_json_reading`
- **Database Reset**: All tables reset except Card table (78 cards preserved)
- **Backup**: Card data backed up in `/scripts/backups/`

### New Implementation Files
- `/src/types/reading.ts` - TypeScript types for new structure
- `/scripts/backup-cards.ts` - Card backup/restore utility
- `/src/app/api/readings/ask/route.ts` - Rewritten without SSE
- `/src/app/api/readings/history/route.ts` - Updated for Json handling

**File Purpose**: Core Reading System & LangGraph (Updated Round 7A)  
**Round Usage**: Round 3 (LangGraph Integration) + Round 7A (Schema & API Overhaul)  
**Dependencies**: LangGraph, Gemini AI, Database Models, TypeScript Types  
**Estimated Tokens**: ~2,500