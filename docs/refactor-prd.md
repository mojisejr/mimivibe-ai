Based on the provided documents, here is the updated version of the Product Requirements Document (PRD) for MiMiVibes. This version incorporates the refactored features and architectural improvements from "refactor-prd.md" while reverting the tech stack to the original one described in "PRD.md".

---

## 📋 Executive Summary

MiMiVibes is an AI-powered tarot reading platform. It provides personalized readings through an AI tarot expert, "Mimi," using a Multi-LLM (OpenAI GPT-4 + Google Gemini) and a LangGraph workflow. The platform now includes a lean, scalable core with new features like **Referral** and **Points Exchange**. The primary focus is on an efficient system for a single developer team, maintaining a high-quality user experience.

### Key Features

- **AI Tarot Reading System** - A 4-node AI workflow for high-quality readings.
- **Secure Payment System** - Stripe integration for secure credit card payments, supporting Thai Baht (THB).
- **Referral & Exchange System** - A simple gamification loop to drive user acquisition and engagement.
- **Mobile-First Design** - UI/UX is optimized for mobile with a modern aesthetic.
- **Enterprise Security** - Robust security measures including AES-256-GCM encryption.

---

## 🏗️ System Architecture & Tech Stack

The system architecture is a standard client-server model, with a mobile-first web frontend and a single backend API. The recommended tech stack is chosen to minimize complexity and maximize development speed for a solodev.

### Recommended Stack

- **Frontend (Web App)**: **Next.js 14 (App Router)** with **TypeScript**, **Tailwind CSS**, and **Framer Motion**. State management will use **React Hooks** and custom hooks.
- **Backend (API)**: **Next.js API Routes** hosted on Vercel.
- **Database**: **Prisma** with **PostgreSQL** for production and SQLite for development, hosted on **Supabase**.
- **AI**: **OpenAI GPT-4** and **Google Gemini**, orchestrated by **LangGraph**.
- **Payment**: **Stripe** for payment processing.
- **Authentication**: **Clerk Auth**.

---

## ⚙️ Core Features

### 1\. AI Tarot Reading System

The system utilizes a 4-node LangGraph state machine to handle the entire reading process: **Question Filter**, **Question Analysis**, **Card Selection**, and **Reading Generation**. It uses a primary AI model with a fallback, ensuring high reliability and quality.

### 2\. Credit & Payment System

- **Credit Types**:
  - **Stars (⭐)**: Premium credits purchased with real money.
  - **Free Points (🎁)**: Free credits earned from activities.
  - **Coins (🪙)**: Gamified currency used for the exchange system.
- **Payment**: Securely handled by Stripe.

### 3\. Referral & Exchange System

- **Referral**: Each user receives a unique referral code. When a new user signs up with the code, both the referrer and the new user receive rewards based on the `RewardConfiguration` table.
- **Exchange**: A simple "swap" interface allows users to convert **Coins** into **Free Points** at a configurable rate defined in the `ExchangeSetting` table.

### 4\. Reward Configuration System

The new **`RewardConfiguration`** table provides a centralized, flexible way to manage all reward-giving activities. Rewards are defined by a unique `name` (e.g., `'REFERRAL_REWARD'`), `type` (`'COINS'` or `'FREE_POINTS'`), `value`, and optional `criteria`.

### 5\. Prompt Management System

- **PromptTemplate**: Stores the metadata for each agent's prompt (e.g., `'QUESTION_FILTER'`, `'READING_AGENT'`).
- **PromptVersion**: Stores the content and version number of each prompt. The `isActive` flag determines which version is currently in use, allowing for easy A/B testing or rollbacks.

---

## 📊 Database Schema (Prisma)

The Prisma schema has been refactored to include the new `RewardConfiguration`, `ExchangeSetting`, `PromptTemplate`, `PromptVersion`, and `ReferralCode` models. The core models like `User`, `Reading`, and `PaymentHistory` remain consistent with the original design but with new fields and relationships to support the refactored features.

```typescript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Card {
  id             Int      @id @default(autoincrement())
  name           String   @unique
  displayName    String
  arcana         String
  shortMeaning   String
  longMeaning    String
  longMeaningRaw String
  keywords       String
  imageUrl       String
}

model RewardConfiguration {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  type        String
  value       Int
  criteria    Json?
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ExchangeSetting {
  id           Int      @id @default(autoincrement())
  exchangeType String
  receivedItem String
  coinPerUnit  Int
  isActive     Boolean  @default(true)
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @default(now())
}

model Pack {
  id             Int            @id @default(autoincrement())
  title          String
  subtitle       String?
  ctaText        String         @default("ซื้อเลย")
  price          Int            // in cents (satang)
  creditAmount   Int            // stars to add
  metadata       Json?
  isActive       Boolean        @default(true)
  popular        Boolean        @default(false)
  sortOrder      Int            @default(0)
  PaymentHistory PaymentHistory[]
}

model PaymentHistory {
  id              String   @id @default(cuid())
  userId          String
  stripePaymentId String   @unique
  packId          Int
  amount          Int      // in cents (satang)
  currency        String   @default("thb")
  status          String   // succeeded, failed, pending
  creditsAdded    Int
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  pack Pack @relation(fields: [packId], references: [id])
}

model Reading {
  id         String   @id @default(cuid())
  userId     String
  question   String
  answer     Json
  cardOrder  String
  type       String   @default("tarot")
  isDeleted  Boolean  @default(false)
  isReviewed Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews Review[]

  @@index([userId, createdAt])
}

model ReferralCode {
  id           String    @id @default(cuid())
  userId       String
  code         String    @unique
  referredBy   String?
  isUsed       Boolean   @default(false)
  usedAt       DateTime?
  createdAt    DateTime  @default(now())

  user     User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrer User? @relation("UserReferrals", fields: [referredBy], references: [id])

  @@map("referral_codes")
}

model Review {
  id            Int      @id @default(autoincrement())
  readingId     String
  userId        String
  liked         Boolean  @default(false)
  accurateLevel Float?
  createdAt     DateTime @default(now())
  reviewPeriod  Int?
  Reading       Reading  @relation(fields: [readingId], references: [id])
  User          User     @relation(fields: [userId], references: [id])
}

model User {
  id            String           @id
  lineId        String?          @unique
  email         String?          @unique
  name          String?
  tel           String?
  imageUrl      String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  stars         Int              @default(0)
  coins         Int              @default(0)
  freePoint     Int              @default(0)
  role          UserRole         @default(USER)

  PaymentHistory PaymentHistory[]
  Reading        Reading[]
  ReferralCode   ReferralCode[]
  referredUsers  ReferralCode[]   @relation("UserReferrals")
  Review         Review[]

  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}

model PromptTemplate {
  id               Int      @id @default(autoincrement())
  name             String   @unique @db.VarChar(100)
  agentType        String   @map("agent_type")
  description      String?
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @default(now()) @updatedAt @map("updated_at")

  versions PromptVersion[]

  @@map("prompt_templates")
}

model PromptVersion {
  id               Int      @id @default(autoincrement())
  templateId       Int      @map("template_id")
  versionNumber    Int
  content          String
  isActive         Boolean  @default(false) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")

  template PromptTemplate @relation(fields: [templateId], references: [id])

  @@unique([templateId, versionNumber])
  @@map("prompt_versions")
}
```
