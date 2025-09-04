# Product Requirements Document (PRD)
# MiMiVibes - AI-Powered Tarot Reading Platform

**Version:** 1.0  
**Date:** January 2025  
**Status:** Production Ready  
**Platform:** Web Application (Next.js 14)

---

## 📋 Executive Summary

MiMiVibes เป็นแพลตฟอร์มดูไพ่ทาโรต์ออนไลน์ที่ขับเคลื่อนด้วย AI ที่ให้บริการการทำนายแบบส่วนตัวผ่าน "แม่หมอมีมี่" ผู้เชี่ยวชาญด้านไพ่ทาโรต์ AI ระบบใช้เทคโนโลยี Multi-LLM (OpenAI GPT-4 + Google Gemini) ร่วมกับ LangGraph workflow เพื่อสร้างการทำนายที่มีคุณภาพสูงและเป็นธรรมชาติ

### Key Features
- 🔮 **AI Tarot Reading System** - ระบบทำนายไพ่ทาโรต์ด้วย AI แบบ 4-node workflow
- 💳 **Secure Payment System** - ระบบชำระเงินผ่าน Stripe รองรับเงินไทย
- 🎮 **Comprehensive Gamification** - ระบบเกมมิฟิเคชั่นครบครัน 20 achievements
- 📱 **Mobile-First Design** - ออกแบบเพื่อมือถือเป็นหลัก responsive ทุกอุปกรณ์
- 🔐 **Enterprise Security** - ระบบรักษาความปลอดภัยระดับองค์กร AES-256-GCM

---

## 🎯 Product Vision & Goals

### Vision Statement
"สร้างประสบการณ์การทำนายไพ่ทาโรต์ที่เข้าถึงได้ง่าย น่าเชื่อถือ และมีคุณภาพสูงผ่านเทคโนโลยี AI ที่ทันสมัย"

### Primary Goals
1. **User Experience Excellence** - ให้ประสบการณ์การใช้งานที่ราบรื่นและน่าประทับใจ
2. **AI Quality Assurance** - รับประกันคุณภาพการทำนายด้วยระบบ Multi-LLM
3. **Business Sustainability** - สร้างรายได้ที่ยั่งยืนผ่านระบบ credit และ gamification
4. **Security & Trust** - รักษาความปลอดภัยและความเชื่อถือของผู้ใช้

### Success Metrics
- **User Engagement**: Daily/Weekly Active Users, Session Duration
- **Revenue**: Monthly Recurring Revenue, Average Revenue Per User
- **Quality**: User Satisfaction Score, Reading Accuracy Rating
- **Technical**: System Uptime (>99.5%), API Response Time (<500ms)

---

## 👥 Target Audience

### Primary Users
- **Age**: 18-45 ปี
- **Gender**: หญิง 70%, ชาย 30%
- **Location**: ประเทศไทย (Thai language support)
- **Interests**: ความเชื่อทางจิตวิญญาณ, การทำนาย, self-discovery
- **Technology**: มือถือเป็นหลัก, คุ้นเคยกับแอปพลิเคชัน

### User Personas

#### 1. "นักเรียนมหาวิทยาลัย" (Primary)
- อายุ 19-23 ปี
- ใช้มือถือเป็นหลัก
- สนใจเรื่องความรัก การเรียน อนาคต
- งบประมาณจำกัด แต่ยินดีจ่ายสำหรับสิ่งที่มีคุณค่า

#### 2. "Working Professional" (Secondary)
- อายุ 25-35 ปี
- สนใจเรื่องการงาน การเงิน ความสัมพันธ์
- มีกำลังซื้อสูงกว่า ต้องการความสะดวกรวดเร็ว

#### 3. "Spiritual Enthusiast" (Tertiary)
- อายุ 30-45 ปี
- มีความเชื่อทางจิตวิญญาณสูง
- ใช้บริการทำนายเป็นประจำ
- ต้องการคุณภาพและความแม่นยำ

---

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks + Custom Hooks
- **Authentication**: Clerk Auth

#### Backend
- **Runtime**: Node.js (Vercel Serverless)
- **Database**: PostgreSQL (Production), SQLite (Development)
- **ORM**: Prisma
- **API**: Next.js API Routes (39+ endpoints)
- **Payment**: Stripe (Thai Baht support)

#### AI & ML
- **Primary LLM**: OpenAI GPT-4-turbo
- **Fallback LLM**: Google Gemini 2.0 Flash
- **Workflow Engine**: LangGraph (4-node state machine)
- **Prompt Management**: Custom encrypted system with version control

#### Infrastructure
- **Deployment**: Vercel (Primary), Render (Compatible)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in logging and analytics
- **Security**: AES-256-GCM encryption, HTTPS, CSP headers

### Database Schema

#### Core Models
```typescript
// User Management
model User {
  id: String (Clerk ID)
  stars: Int (paid credits)
  coins: Int (gamification currency)
  freePoint: Int (free credits)
  level: Int, exp: Int (gamification)
  prestigeLevel: Int (prestige system)
  readings: Reading[]
  paymentHistory: PaymentHistory[]
}

// Reading System
model Reading {
  id: String
  question: String
  answer: Json // Structured reading data
  type: String
  isDeleted: Boolean
  cards: ReadingCard[]
}

// Payment System
model PaymentHistory {
  stripePaymentId: String
  packId: Int
  amount: Int // THB
  status: String
  creditsAdded: Int
}

// Gamification
model RewardConfiguration {
  name: String // Achievement ID
  criteria: Json // Achievement conditions
  rewards: Json // Reward values
  isActive: Boolean
}
```

---

## 🔮 Core Features

### 1. AI Tarot Reading System

#### 1.1 Reading Generation Workflow
**LangGraph 4-Node State Machine:**

1. **Question Filter Node**
   - วิเคราะห์ความเหมาะสมของคำถาม
   - กรองเนื้อหาที่ไม่เหมาะสม
   - ตรวจสอบความชัดเจนและจำนวนคำถาม

2. **Question Analysis Node**
   - วิเคราะห์อารมณ์ (mood): กังวล, หวัง, สงสัย, etc.
   - จำแนกหัวข้อ (topic): ความรัก, การงาน, การเงิน, etc.
   - กำหนดกรอบเวลา (period): อดีต, ปัจจุบัน, อนาคต

3. **Card Selection Node**
   - สุ่มไพ่จากสำรับ Rider-Waite (78 ใบ)
   - รองรับการเลือก 3 หรือ 5 ใบ
   - จัดเรียงตามตำแหน่ง (position)

4. **Reading Generation Node**
   - สร้างการทำนายในรูปแบบบทความ
   - ใช้บุคลิก "แม่หมอมีมี่" (อบอุ่น เป็นกันเอง)
   - โครงสร้าง: header, reading, suggestions, next_questions, final, end, notice

#### 1.2 Multi-LLM Architecture
- **Primary Provider**: OpenAI GPT-4-turbo (default)
- **Fallback Provider**: Google Gemini 2.0 Flash
- **Provider Abstraction**: LLMProvider interface
- **Automatic Fallback**: เมื่อ primary provider ล้มเหลว
- **Token Limits**: 4096 tokens สำหรับการตอบที่ซับซ้อน

#### 1.3 Reading Structure
```typescript
interface ReadingStructure {
  header: string;           // หัวข้อการทำนาย
  cards_reading: CardReading[]; // การอ่านแต่ละใบ
  reading: string;          // การทำนายหลัก
  suggestions: string[];    // คำแนะนำ
  next_questions: string[]; // คำถามต่อเนื่อง
  final: string;           // สรุป
  end: string;             // คำปิดท้าย
  notice: string;          // ข้อสังเกต
}
```

### 2. Credit & Payment System

#### 2.1 Credit Types
- **Stars** (⭐): เครดิตหลักที่ซื้อด้วยเงินจริง
- **Free Points** (🎁): เครดิตฟรีจากกิจกรรม
- **Coins** (🪙): สกุลเงินเกมสำหรับแลกเปลี่ยน

#### 2.2 Payment Packages
```typescript
// Package Examples
{
  "starter": { price: 99, credits: 10, popular: false },
  "popular": { price: 199, credits: 25, popular: true },
  "premium": { price: 399, credits: 60, popular: false }
}
```

#### 2.3 Stripe Integration
- **Currency**: Thai Baht (THB)
- **Payment Methods**: Credit/Debit Cards
- **Webhook**: Real-time payment status updates
- **Security**: PCI DSS compliant

### 3. Gamification System

#### 3.1 Experience & Levels
- **Level Progression**: level * 100 EXP required
- **Max Level**: 100 (Prestige available)
- **EXP Sources**: Readings, Reviews, Achievements
- **Prestige System**: Reset to level 1 with permanent bonuses

#### 3.2 Achievement System (20 Achievements)
```typescript
// Achievement Categories
{
  "reading_milestones": ["FIRST_READING", "READING_MASTER", "ULTIMATE_MASTER"],
  "engagement": ["REVIEWER", "SOCIAL_BUTTERFLY"],
  "progression": ["LEVEL_ACHIEVER", "PRESTIGE_PIONEER"],
  "special": ["EARLY_BIRD", "WEEKEND_WARRIOR", "NIGHT_OWL"]
}
```

#### 3.3 Exchange System
- **Coin to Free Point**: 15 coins = 1 free point
- **Uniswap-style Interface**: Modern crypto-inspired design
- **Exchange History**: Transaction tracking

### 4. User Management

#### 4.1 Authentication (Clerk)
- **Sign-up Methods**: Email, Google, Facebook
- **Security**: Multi-factor authentication support
- **Session Management**: Secure token-based

#### 4.2 User Profile
- **Statistics**: Total readings, accuracy, level, achievements
- **Reading History**: Paginated with search/filter
- **Payment History**: Transaction records with Stripe IDs
- **Referral System**: Code generation and tracking

---

## 🎨 User Interface Design

### Design System

#### Color Palette
- **Primary**: Purple/Violet tones (mystical theme)
- **Secondary**: Gold accents (premium feel)
- **Background**: Dark theme with gradients
- **Text**: High contrast for accessibility

#### Typography
- **Headings**: Modern sans-serif
- **Body**: Readable Thai fonts
- **Special**: Decorative fonts for mystical elements

#### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Modals**: Backdrop blur, smooth animations
- **Navigation**: Bottom navigation (mobile), sidebar (desktop)

### Page Structure

#### 1. Landing Page (`/`)
- Hero section with value proposition
- Feature highlights
- Pricing packages
- User testimonials
- Call-to-action buttons

#### 2. Ask Page (`/ask`)
- **Question Input**: Text area with character counter
- **Credit Display**: Current balance with purchase link
- **Card Selection**: Interactive card picking interface
- **Loading State**: Mystical animations during generation
- **Article Display**: Reading results in article format
- **Action Buttons**: Save, Share, Ask Again

#### 3. History Page (`/history`)
- **Reading Cards**: Grid layout with preview
- **Search & Filter**: By date, topic, card count
- **Detail Modal**: Full reading view
- **Management**: Delete, favorite options

#### 4. Profile Page (`/profile`)
- **User Stats**: Level, EXP, achievements
- **Credit Balance**: Stars, coins, free points
- **Referral Section**: Code sharing
- **Settings**: Account preferences

#### 5. Packages Page (`/packages`)
- **Package Cards**: Price, credits, features
- **Payment Form**: Stripe Elements integration
- **Confirmation**: Success/failure handling

#### 6. Events Page (`/events`)
- **Daily Login Calendar**: Monthly view with rewards
- **Achievement Badges**: Progress tracking
- **Special Events**: Seasonal campaigns

#### 7. Exchange Page (`/exchange`)
- **Swap Interface**: Uniswap-style design
- **Balance Display**: Current coins and free points
- **Exchange History**: Transaction log

### Mobile Optimization
- **Responsive Design**: Mobile-first approach
- **Touch Interactions**: Optimized for finger navigation
- **Performance**: Fast loading, smooth animations
- **Safe Areas**: Proper handling of notches and home indicators

---

## 🔐 Security & Privacy

### Data Protection
- **Encryption**: AES-256-GCM for sensitive data
- **HTTPS**: All communications encrypted
- **Database**: Secure PostgreSQL with access controls
- **API Keys**: Environment-based configuration

### Privacy Compliance
- **Data Minimization**: Collect only necessary information
- **User Consent**: Clear privacy policy and terms
- **Data Retention**: Configurable retention periods
- **Right to Delete**: User data deletion capabilities

### Security Measures
- **Authentication**: Clerk-based secure authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Prisma ORM protection

---

## 📊 Analytics & Monitoring

### Key Metrics

#### User Engagement
- Daily/Weekly/Monthly Active Users
- Session duration and frequency
- Reading completion rates
- Feature adoption rates

#### Business Metrics
- Revenue per user (ARPU)
- Customer lifetime value (CLV)
- Conversion rates (free to paid)
- Churn rates

#### Technical Metrics
- API response times
- Error rates by endpoint
- Database query performance
- AI model performance and costs

### Monitoring Tools
- **Application**: Built-in logging and error tracking
- **Infrastructure**: Vercel analytics and monitoring
- **User Behavior**: Custom event tracking
- **Performance**: Core Web Vitals monitoring

---

## 🚀 Deployment & Operations

### Production Environment

#### Vercel Deployment
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Framework**: Next.js
- **Node Version**: 18.x

#### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Payments
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Integration
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
PROMPT_ENCRYPTION_KEY="your-32-char-key"
```

### Performance Targets
- **First Load JS**: <200KB
- **LCP**: <2.5s
- **FID**: <100ms
- **CLS**: <0.1
- **API Response**: <500ms average
- **Uptime**: >99.5%

### Backup & Recovery
- **Database**: Automated daily backups
- **Code**: Git version control
- **Environment**: Infrastructure as code
- **Disaster Recovery**: Multi-region deployment capability

---

## 🎯 Roadmap & Future Features

### Phase 1: Core Platform (✅ Completed)
- AI Tarot Reading System
- User Authentication & Management
- Payment Integration
- Basic Gamification
- Mobile-Responsive UI

### Phase 2: Enhanced Features (✅ Completed)
- Advanced Gamification (20 achievements)
- Payment History
- Prompt Management System
- Multi-LLM Architecture
- Performance Optimization

### Phase 3: Advanced Features (🔄 Planned)
- **Social Features**
  - Reading sharing
  - Community discussions
  - User reviews and ratings

- **AI Enhancements**
  - Personalized reading styles
  - Learning from user feedback
  - Advanced card spread options

- **Business Features**
  - Subscription models
  - Affiliate program
  - Corporate packages

### Phase 4: Scale & Expansion (📋 Future)
- **Multi-language Support**
  - English version
  - Other Southeast Asian languages

- **Platform Expansion**
  - Mobile apps (iOS/Android)
  - API for third-party integrations
  - White-label solutions

- **Advanced Analytics**
  - AI-powered insights
  - Predictive analytics
  - Business intelligence dashboard

---

## 📋 Current Prompt Templates

### 1. Question Filter Prompt
```
คุณคือผู้ช่วยคัดกรองคำถามสำหรับบริการดูไพ่ทาโรต์ของ "แม่หมอมีมี่"

กฎเกณฑ์ในการตรวจสอบ:
1. ความเหมาะสมของเนื้อหา:
   - อนุญาต: ความรัก, การงาน, การเงิน, สุขภาพ, ครอบครัว
   - ไม่อนุญาต: เนื้อหาหยาบคาย, ก้าวร้าว, ลามก, ผิดกฎหมาย

2. ความชัดเจน:
   - ต้องเป็นคำถามเดียวที่ชัดเจน
   - ห้ามมีหลายคำถามในข้อความเดียว

3. ความยาว:
   - ต้องมีความยาวเหมาะสม (10-500 ตัวอักษร)
```

### 2. Question Analysis Prompt
```
วิเคราะห์คำถามและจำแนกตามหมวดหมู่:

อารมณ์ (mood):
- กังวล, หวัง, สงสัย, เศร้า, ดีใจ, โกรธ, กลัว, สับสน

หัวข้อ (topic):
- ความรัก, การงาน, การเงิน, สุขภาพ, ครอบครัว, การศึกษา, มิตรภาพ

กรอบเวลา (period):
- อดีต, ปัจจุบัน, อนาคตใกล้, อนาคตไกล
```

### 3. Reading Agent Prompt
```
คุณคือ "แม่หมอมีมี่" หมอดูผู้เชี่ยวชาญด้านไพ่ทาโรต์สำรับ Rider-Waite

บุคลิกของคุณ:
- อบอุ่น ใจดี เป็นกันเอง
- ใช้ภาษาไทยที่สุภาพ อ่อนโยน
- มีน้ำเสียงที่ชวนคุย แต่ยังคงความเป็นมืออาชีพ

วิธีทำงาน:
1. ทำความเข้าใจคำถามและการวิเคราะห์
2. อ่านไพ่แต่ละใบตามตำแหน่ง
3. สร้างการทำนายที่เชื่อมโยงกัน
4. ให้คำแนะนำที่สร้างสรรค์
5. เสนอคำถามต่อเนื่อง
```

---

## 📞 Support & Maintenance

### Technical Support
- **Development Team**: Full-stack developers with AI expertise
- **Response Time**: <24 hours for critical issues
- **Monitoring**: 24/7 automated monitoring
- **Updates**: Regular security and feature updates

### User Support
- **Help Center**: Comprehensive documentation
- **Contact Methods**: Email, in-app messaging
- **Response Time**: <48 hours for user inquiries
- **Languages**: Thai (primary), English (secondary)

### Maintenance Schedule
- **Regular Updates**: Weekly minor updates
- **Major Releases**: Monthly feature releases
- **Security Patches**: As needed (immediate for critical)
- **Database Maintenance**: Scheduled during low-traffic hours

---

## 📈 Success Criteria

### Launch Criteria (✅ Met)
- [ ] All core features functional
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Payment system tested
- [ ] Mobile optimization complete

### 30-Day Goals
- [ ] 1,000+ registered users
- [ ] 500+ completed readings
- [ ] 95%+ system uptime
- [ ] <2s average response time
- [ ] 10%+ conversion rate (free to paid)

### 90-Day Goals
- [ ] 5,000+ registered users
- [ ] 10,000+ completed readings
- [ ] $10,000+ monthly revenue
- [ ] 4.5+ star user rating
- [ ] 80%+ user retention (7-day)

---

## 📝 Conclusion

MiMiVibes represents a comprehensive, production-ready AI-powered tarot reading platform that combines cutting-edge technology with traditional mystical practices. The system is built with scalability, security, and user experience as primary concerns, ensuring both immediate success and long-term growth potential.

**Current Status**: 🚀 **Production Ready** - All major systems complete and tested
**Deployment**: Ready for immediate launch
**Next Steps**: Production deployment and user acquisition

---

*Document prepared by AI analysis of complete codebase*  
*Last updated: January 2025*