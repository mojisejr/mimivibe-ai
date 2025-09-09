---
## Project Overview

**Project Name**: MiMiVibes - AI-Powered Tarot Reading Platform

**Repository**: https://github.com/mojisejr/mimivibe-ai.git

**Description**: แพลตฟอร์มดูไพ่ทาโรต์ออนไลน์ที่ขับเคลื่อนด้วย AI ให้บริการการทำนายแบบส่วนตัวผ่าน "แม่หมอมีมี่" ผู้เชี่ยวชาญด้านไพ่ทาโรต์ AI ระบบใช้เทคโนโลยี Multi-LLM (OpenAI GPT-4 + Google Gemini) ร่วมกับ LangGraph workflow เพื่อสร้างการทำนายที่มีคุณภาพสูงและเป็นธรรมชาติ

**Project Goals**:

- สร้างประสบการณ์การทำนายไพ่ทาโรต์ที่เข้าถึงได้ง่าย น่าเชื่อถือ และมีคุณภาพสูงผ่านเทคโนโลยี AI
- รับประกันคุณภาพการทำนายด้วยระบบ Multi-LLM และ LangGraph workflow
- สร้างรายได้ที่ยั่งยืนผ่านระบบ credit และ gamification ครบครัน
- รักษาความปลอดภัยและความเชื่อถือของผู้ใช้ด้วยระบบรักษาความปลอดภัยระดับองค์กร

---

## Architecture Overview

### Core Structure

- **Framework**: Next.js 14 (App Router)
- **Frontend/Framework**: React 18 with TypeScript (Strict Mode)
- **API Layer**: Next.js API Routes (39+ endpoints)
- **Database**: PostgreSQL (Production) / SQLite (Development) with Prisma ORM
- **File Storage**: Vercel Static Assets
- **Styling**: Tailwind CSS with Framer Motion animations
- **Authentication**: Clerk Auth (Multi-provider support)
- **Data Validation**: Zod with custom validation schemas

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Clerk Auth
- **Backend**: Node.js (Vercel Serverless), Prisma ORM, PostgreSQL, Stripe Payments
- **AI Integration**: OpenAI GPT-4-turbo, Google Gemini 2.0 Flash, LangGraph workflow engine
- **Database**: PostgreSQL via Vercel/Supabase with Prisma migrations
- **File Storage**: Vercel Edge Network CDN
- **Authentication**: Clerk with Google, Facebook, Email providers

### Backend API Routes

- **Reading System** (`/api/readings/`): Core tarot reading functionality
  - `ask.ts`: Generate new tarot readings with AI workflow
  - `save.ts`: Save completed readings to user history
  - `history.ts`: Retrieve user's reading history with pagination

- **User Management** (`/api/user/`): User profile and progression
  - `stats.ts`: User statistics, level, and experience tracking
  - `credits.ts`: Credit balance management (stars, coins, free points)
  - `level-check.ts`: Level progression and prestige system
  - `prestige.ts`: Prestige system for level 100+ users

- **Payment System** (`/api/payments/`): Stripe integration
  - `create-payment-intent.ts`: Stripe payment processing
  - `webhook.ts`: Stripe webhook for payment confirmations
  - `history.ts`: Payment transaction history

- **Gamification** (`/api/achievements/`, `/api/credits/`): Achievement and reward system
  - `progress.ts`: Track user achievement progress
  - `claim.ts`: Claim earned achievements
  - `spend.ts`: Process credit spending transactions

- **Admin System** (`/api/admin/`): Administrative functions
  - Campaign management, user analytics, system monitoring

### Frontend User Journeys

- **User Journey Flows**:
  - **Tarot Reading Flow**: Landing → Sign Up/Login → Ask Question → Card Selection → AI Generation → Reading Display → Save/Share
  - **Payment Flow**: Credit Check → Package Selection → Stripe Payment → Credit Addition → Confirmation
  - **Gamification Flow**: Complete Actions → Earn XP/Coins → Level Up → Unlock Achievements → Exchange Coins → Prestige System
  - **History Management**: Reading History → Search/Filter → Detail View → Delete/Favorite → Export Options

---

## 🤖 AI System Architecture

### LangGraph Workflow (4-Node State Machine)

1. **Question Filter Node**: คัดกรองความเหมาะสมของคำถาม, ตรวจสอบเนื้อหาและความชัดเจน
2. **Question Analysis Node**: วิเคราะห์อารมณ์ (mood), หัวข้อ (topic), และกรอบเวลา (period)
3. **Card Selection Node**: สุ่มไพ่จากสำรับ Rider-Waite (78 ใบ) รองรับ 3-5 ใบ
4. **Reading Generation Node**: สร้างการทำนายด้วยบุคลิก "แม่หมอมีมี่"

### Multi-LLM Provider System

- **Primary Provider**: OpenAI GPT-4-turbo (default)
- **Fallback Provider**: Google Gemini 2.0 Flash
- **Provider Abstraction**: LLMProvider interface with automatic fallback
- **Token Limits**: 4096 tokens for complex readings
- **Prompt Management**: Encrypted prompt system with version control

### Prompt Templates

- **Question Filter**: คัดกรองคำถามที่เหมาะสมสำหรับการทำนาย
- **Question Analysis**: วิเคราะห์บริบทและอารมณ์ของคำถาม
- **Reading Agent**: บุคลิก "แม่หมอมีมี่" สำหรับการทำนายที่อบอุ่นและเป็นกันเอง

---

## 💳 Payment & Credit System

### Credit Types
- **Stars (⭐)**: เครดิตหลักที่ซื้อด้วยเงินจริง (1 star = 1 reading)
- **Free Points (🎁)**: เครดิตฟรีจากกิจกรรมและ achievements
- **Coins (🪙)**: สกุลเงินเกมสำหรับแลกเปลี่ยน (15 coins = 1 free point)

### Stripe Integration
- **Currency**: Thai Baht (THB)
- **Packages**: Starter (99 THB/10 credits), Popular (199 THB/25 credits), Premium (399 THB/60 credits)
- **Webhook**: Real-time payment status updates
- **Security**: PCI DSS compliant with secure payment processing

---

## 🎮 Gamification System

### Level & Experience System
- **Level Progression**: level * 100 EXP required per level
- **Max Level**: 100 (Prestige system available)
- **EXP Sources**: Readings (+10), Reviews (+5), Achievements (variable)
- **Prestige**: Reset to level 1 with permanent bonuses at level 100

### Achievement System (20 Achievements)
- **Reading Milestones**: FIRST_READING, READING_MASTER, ULTIMATE_MASTER
- **Engagement**: REVIEWER, SOCIAL_BUTTERFLY, REFERRAL_MASTER
- **Progression**: LEVEL_ACHIEVER, PRESTIGE_PIONEER
- **Special**: EARLY_BIRD, WEEKEND_WARRIOR, NIGHT_OWL

### Exchange System
- **Uniswap-style Interface**: Modern crypto-inspired design
- **Exchange Rate**: 15 coins = 1 free point
- **Transaction History**: Complete exchange tracking

---

## ⚠️ CRITICAL SAFETY RULES

### NEVER MERGE PRS YOURSELF

**DO NOT** use any commands to merge Pull Requests, such as `gh pr merge`. Your role is to create a well-documented PR and provide the link to the user.

**ONLY** provide the PR link to the user and **WAIT** for explicit user instruction to merge. The user will review and merge when ready.

### DO NOT DELETE CRITICAL FILES

You are **FORBIDDEN** from deleting or moving critical files and directories in the project. This includes, but is not limited to: `.env`, `.git/`, `node_modules/`, `package.json`, `prisma/schema.prisma`, and the main project root files. If a file or directory needs to be removed, you must explicitly ask for user permission and provide a clear explanation.

### HANDLE SENSITIVE DATA WITH CARE

You must **NEVER** include sensitive information such as API keys, passwords, or user data in any commit messages, Pull Request descriptions, or public logs. Always use environment variables for sensitive data. If you detect sensitive data, you must alert the user and **REFUSE** to proceed until the information is properly handled.

**Critical Environment Variables**:
- `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`
- `PROMPT_ENCRYPTION_KEY`, `STRIPE_WEBHOOK_SECRET`

### STICK TO THE SCOPE

You are instructed to focus **ONLY** on the task described in the assigned Issue. Do not perform any refactoring, code cleanup, or new feature development unless it is explicitly part of the plan. If you encounter an opportunity to improve the code outside of the current scope, you must create a new task and discuss it with the user first.

### AI SYSTEM SAFETY

**DO NOT** modify AI prompts or LangGraph workflow without explicit permission. The prompt system uses AES-256-GCM encryption and version control. Any changes to AI behavior must be thoroughly tested using the prompt test runner (`npm run prompt:test`).

---

## 🚀 Development Workflows

### The Two-Issue Pattern

This project uses a Two-Issue Pattern to separate work context from actionable plans, integrating local workflows with GitHub Issues for clarity and traceability.

- **Context Issues (`=fcs`):** Used to record the current state and context of a session on GitHub.

- **Task Issues (`=plan`):** Used to create a detailed and comprehensive plan of action on GitHub. The agent will use information from the latest Context Issue as a reference.

---

### Shortcut Commands

These commands are standard across all projects and streamline our communication.

- **`=fcs > [message]`**: Updates the `current-focus.md` file on the local machine and creates a **GitHub Context Issue** with the specified `[message]` as the title. **WARNING**: This command will only work if there are no open GitHub issues. If there are, the agent will alert you to clear the backlog before you can save a new context. To bypass this check, use the command `=fcs -f > [message]`.

- **`=plan > [question/problem]`**: Creates a **GitHub Task Issue** with a detailed and comprehensive plan of action. The agent will use all the information from the `current-focus.md` file and previous conversations to create this Issue. If an open Task Issue already exists, the agent will **update** that Issue with the latest information instead of creating a new one.

- **`=impl > [message]`**: Instructs the agent to execute the plan contained in the latest **GitHub Task Issue**. If you include a `[message]`, the agent will consider it as an addition to the original plan and process it before beginning the implementation.

- **`=rrr > [message]`**: Creates a daily Retrospective file in the `docs/retrospective/` folder and creates a GitHub Issue containing a summary of the work, an AI Diary, and Honest Feedback, allowing you and the team to review the session accurately.

### 🔄 Plan Issue Management Guidelines

**CRITICAL**: For large, multi-phase projects, the agent must **UPDATE** existing plan issues instead of creating new ones.

- **When completing phases**: Update the plan issue to reflect completed phases and mark them as ✅ COMPLETED
- **Progress tracking**: Update the issue description with current status, next steps, and any blockers
- **Phase completion**: When a phase is finished, update the plan issue immediately before moving to the next phase
- **Never create new issues**: For ongoing multi-phase work, always update the existing plan issue (#20 for current system refactor)
- **Retrospective issues**: Only create retrospective issues for session summaries, not for plan updates

### 🌿 Branch Management & Pull Request Workflow

**MANDATORY WORKFLOW**: Every feature implementation must follow this exact process:

1. **Checkout New Branch**: Always create a new branch for each feature/phase implementation
   ```bash
   git checkout -b feature/phase-X-implementation
   ```

2. **Implementation**: Complete the planned work in the new branch

3. **Commit & Push**: After completing implementation, commit and push changes
   ```bash
   git add .
   git commit -m "feat: implement phase X - [description]"
   git push origin feature/phase-X-implementation
   ```

4. **Create Pull Request**: Create a PR for review, **NEVER merge automatically**
   - Provide clear description of changes
   - Reference the plan issue number
   - Wait for user approval before merging

5. **Update Plan Issue**: After creating PR, update the plan issue with:
   - Link to the created PR
   - Mark completed phases as ✅ COMPLETED
   - Update next steps and current status

---

## 🛠️ Development Commands

### Core Development
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### AI Prompt Management
```bash
# List all prompts
npm run prompt:list

# Update prompt
npm run prompt:update

# Test prompts
npm run prompt:test

# Analyze prompt performance
npm run prompt:analyze
```

---

## 📈 Retrospective Workflow

When you use the `=rrr` command, the agent will create a file and an Issue with the following sections and details:

### Session Retrospective

**Session Date**: [Date]
**Start Time**: [Start Time]
**End Time**: [End Time]
**Duration**: ~X minutes
**Primary Focus**: [Main Focus]
**Current Issue**: #XXX
**Last PR**: #XXX

### Session Summary

[Overall summary of the work done today]

### Timeline

- HH:MM - Start, review issue #XXX
- HH:MM - [Event]
- HH:MM - [Event]
- HH:MM - Work completed

### 📝 AI Diary (REQUIRED - DO NOT SKIP)

**⚠️ MANDATORY**: The agent must write this section in the first person.
[Record initial understanding, how the approach changed, confusing or clarifying points, decisions made, and their reasoning.]

### 💭 Honest Feedback (REQUIRED - DO NOT SKIP)

**⚠️ MANDATORY**: The agent must honestly evaluate its performance in this section.
[Assess the session's overall efficiency, tools and their limitations, clarity of communication, and suggestions for improvement.]

### What Went Well

- The successes that occurred

### What Could Improve

- Areas that could be made better

### Blockers & Resolutions

- **Blocker**: Description of the obstacle
  **Resolution**: The solution implemented

### Lessons Learned

- **Pattern**: [Pattern discovered] - [Reason why it's important]
- **Mistake**: [Mistake made] - [How to avoid it]
- **Discovery**: [New finding] - [How to apply it]

---

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check for type errors or syntax issues
npm run build 2>&1 | grep -A 5 "error"

# Clear cache and reinstall dependencies
rm -rf node_modules .next .cache
npm install

# Reset Prisma client
npx prisma generate
```

#### Database Issues
```bash
# Reset database connection
npx prisma db push --force-reset

# Check database connection
npx prisma db pull

# Regenerate Prisma client
npx prisma generate
```

#### AI System Issues
```bash
# Test AI providers
npm run prompt:test

# Check API keys
echo $OPENAI_API_KEY | head -c 10
echo $GOOGLE_GENERATIVE_AI_API_KEY | head -c 10

# Verify prompt encryption
npm run prompt:list
```

#### Port Conflicts
```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]

# Use alternative port
npm run dev -- -p 3001
```

#### Payment System Issues
```bash
# Test Stripe webhook
stripe listen --forward-to localhost:3000/api/payments/webhook

# Verify Stripe keys
echo $STRIPE_SECRET_KEY | head -c 10
echo $STRIPE_WEBHOOK_SECRET | head -c 10
```

### Performance Monitoring

- **Core Web Vitals**: Monitor LCP (<2.5s), FID (<100ms), CLS (<0.1)
- **API Response Times**: Target <500ms average
- **Database Queries**: Monitor slow queries via Prisma logs
- **AI Response Times**: Track LLM provider performance
- **Error Rates**: Monitor via Vercel analytics and custom logging

---

## 📊 Implementation Performance Benchmarks

*Based on documented session timings and efficiency analysis from 17+ retrospectives*

### Session Performance Categories

| Implementation Type | Baseline Time | Optimized Time | Improvement | Key Factors |
|-------------------|---------------|----------------|-------------|-------------|
| **UI Consolidation** | 34 minutes | 15 minutes | 56% faster | TodoWrite + Reference Pattern |
| **Security Implementation** | 4-6 hours est. | 66 minutes | 66% faster | Systematic 8-phase approach |
| **Payment Security Audit** | 2-3 hours est. | 31 minutes | 80% faster | Comprehensive audit methodology |
| **Component Refactoring** | 45 minutes | 20 minutes | 56% faster | Pattern replication strategy |
| **Database Migration** | 3+ hours est. | 135 minutes | 25% faster | Systematic backup-update-test |
| **Clerk Integration** | 2+ hours est. | 49 minutes | 59% faster | TodoWrite + dynamic configuration |

### High-Performance Implementation Indicators
```markdown
✅ TodoWrite usage: 5-8 specific, actionable todos
✅ Reference pattern available: Previous session as guide  
✅ Systematic approach: Clear phase breakdown
✅ Build validation: Incremental testing throughout
✅ Workflow adherence: Feature branch + PR process
✅ Pattern replication: Following proven approaches
```

### Performance Degradation Factors
```markdown
❌ Working on main branch: Adds rework and complexity
❌ No reference pattern: Starting from scratch increases time
❌ Late build testing: Errors discovered at end require extensive rework
❌ Complex dependency analysis: Unplanned schema investigation
❌ Workflow violations: Missing issue tracking and PR process
```

## 🔐 Security Implementation Patterns

*Based on comprehensive security audit and encryption implementation retrospectives*

### Enterprise-Grade Security Workflow
```markdown
Phase 1: Security Assessment (10-15% of time)
├─ Infrastructure analysis (environment variables, database schema)
├─ API endpoint vulnerability scanning
├─ Compliance requirement evaluation
└─ Threat modeling and risk assessment

Phase 2: Critical Vulnerability Resolution (40-50% of time) 
├─ Input validation enhancement (Zod schemas)
├─ Authentication and authorization hardening
├─ Rate limiting implementation
└─ Error handling security improvements

Phase 3: Advanced Security Features (25-30% of time)
├─ Encryption implementation (AES-256-GCM)
├─ Security monitoring and logging
├─ Webhook security and replay protection
└─ Compliance validation (PCI DSS)

Phase 4: Documentation & Deployment (10-15% of time)
├─ Security audit report generation
├─ Deployment automation scripts
├─ Compliance metrics documentation
└─ Security monitoring setup
```

### Security Implementation Best Practices
- **Systematic Audit Approach**: Use formal 8-phase security methodology for comprehensive coverage
- **TodoWrite for Security**: Critical for tracking complex security implementations with multiple phases
- **Professional Documentation**: Create audit-quality reports with severity classifications and compliance metrics
- **Build Validation**: Always test security changes with full build validation to prevent breaking changes
- **Environment Security**: Validate encryption keys and secure configuration before deployment

### Proven Security Metrics
- **Implementation Time**: 66 minutes for comprehensive encryption system (vs 4-6 hours estimated)
- **Vulnerability Resolution**: 5 critical + 8 high-priority issues resolved in single session
- **Compliance Improvement**: PCI DSS compliance from 65% to 85%
- **Performance Impact**: <50ms additional latency with proper optimization

## 🚨 Critical Workflow Violations & Prevention

*Based on documented workflow violations from retrospective analysis*

### Branch Management Violations

**NEVER Work on Main Branch** - Critical violation identified in multiple sessions:

```bash
# WRONG: Working directly on main branch
git add . && git commit -m "fixes"

# CORRECT: Always create feature branches
git checkout -b feature/[issue-number]-[description]
git add . && git commit -m "feat: description (#issue-number)"
git push -u origin feature/[issue-number]-[description]
```

**Documented Impact of Violations:**
- **Session Duration Impact**: 44% longer sessions when workflow violations occur
- **Quality Degradation**: Higher error rates and rework requirements
- **Audit Trail Loss**: Missing GitHub issue tracking and PR review process
- **Rollback Difficulty**: No clean separation of changes for easy reversion

### Prevention Strategies
1. **Pre-Implementation Check**: Always verify current branch before starting work
2. **Automated Workflow**: Use `=impl` command for automatic branch creation and PR generation
3. **Branch Naming**: Follow `feature/[issue-number]-[sanitized-description]` convention
4. **Issue Linking**: Always reference GitHub issues in commits and PRs

### Workflow Compliance Checklist
```markdown
✅ GitHub Task Issue exists and is properly formatted
✅ Feature branch created with proper naming convention
✅ TodoWrite tracking initialized for complex implementations
✅ Regular commit messages with issue references
✅ Build validation after each major change
✅ PR creation with comprehensive description
✅ GitHub issues updated with PR links and completion status
```

## ⚡ Enhanced Efficiency Patterns & Performance Optimization

*Based on documented performance improvements from retrospective analysis*

### 🏃‍♂️ 15-Minute Implementation Strategy

**Achieved Results**: Consistent 15-minute implementations vs 34+ minute baseline

#### Prerequisites for High-Speed Implementation
```markdown
✅ Clear reference pattern from previous successful session
✅ TodoWrite tracking system initialized  
✅ Component structure already analyzed
✅ Integration points identified
✅ Success criteria defined
```

#### Speed Optimization Techniques

**1. Pattern Recognition & Replication**
- **Time Savings**: 56% faster when following proven patterns
- **Method**: Use `/docs/retrospective/` files as implementation guides
- **Key**: Adapt existing solutions rather than creating from scratch

**2. MultiEdit for Simultaneous Operations**
```bash
# Instead of multiple single edits:
Edit file → Read result → Edit file → Read result

# Use MultiEdit for simultaneous operations:
MultiEdit with [removal + integration] in single operation
```

**3. TodoWrite Integration Best Practices**

Based on proven results showing **15-minute implementations** vs 34+ minute sessions:

#### When to Use TodoWrite
- **Complex multi-step tasks** requiring 3+ distinct phases
- **Multi-component refactoring** (e.g., UI consolidation patterns)
- **Full-stack implementations** spanning API and frontend changes
- **Large refactoring projects** with dependency management needs
- **Security implementations** with multiple validation requirements

#### TodoWrite Workflow Pattern
```markdown
1. Phase Planning: Break complex tasks into 5-8 manageable todos
2. Progress Tracking: Mark each todo in_progress → completed as work progresses
3. Visibility: Provides real-time progress visibility for stakeholders
4. Accountability: Ensures no steps are skipped in complex workflows
```

#### Proven Efficiency Gains
- **Pattern Replication**: 56% faster implementation (15 min vs 34 min) when following proven patterns
- **Progress Visibility**: Reduces context switching and improves focus
- **Systematic Approach**: Prevents missing critical implementation steps
- **Security Implementation**: 66% time reduction (66 min vs 4-6 hours estimated) with systematic TodoWrite tracking
- **Multi-Component Refactoring**: Consistent sub-20-minute implementations with reference patterns

### 🔄 Pattern Replication Strategy

#### Reference Implementation Approach
1. **Document Successful Patterns**: Create detailed retrospectives for reusable approaches
2. **Systematic Replication**: Use previous session files as implementation guides
3. **Adapt, Don't Recreate**: Modify proven patterns for new contexts
4. **Measure Efficiency**: Track implementation time improvements

#### Proven Pattern Examples
- **UI Consolidation**: Reward card → chip integration (achieved 56% speed improvement)
- **Component Refactoring**: Systematic removal and integration approaches  
- **API Updates**: Phase-by-phase endpoint migration strategies
- **Security Implementation**: AES-256-GCM encryption with monitoring (66-minute execution)
- **Database Migration**: Systematic backup → update → test approach (135-minute complex migration)
- **Payment Security**: Comprehensive audit with PCI DSS compliance improvement (31-minute execution)

## 🛡️ Database Best Practices

*Enhanced with PostgreSQL sequence management insights from retrospectives*

### PostgreSQL Sequence Management
```sql
-- Check sequence current value
SELECT last_value FROM "Pack_id_seq";

-- Reset sequence to match data
SELECT setval('"Pack_id_seq"', (SELECT MAX(id) FROM "Pack") + 1);

-- Fix auto-increment synchronization
SELECT setval('"TableName_id_seq"', COALESCE(MAX(id), 0) + 1) FROM "TableName";
```

#### PostgreSQL Sequence Issues

*From retrospective: "Auto-increment sequences can become desynchronized in PostgreSQL"*

**Common symptoms:**
- Unique constraint violations on primary key fields during seeding
- Database insertion failures with "duplicate key value violates unique constraint"
- Auto-increment sequence out of sync with actual data

**Diagnosis and Resolution:**
```sql
-- Check current sequence value
SELECT last_value FROM "TableName_id_seq";

-- Check maximum ID in table
SELECT MAX(id) FROM "TableName";

-- Reset sequence to match data (if sequence < max ID)
SELECT setval('"TableName_id_seq"', COALESCE(MAX(id), 0) + 1) FROM "TableName";

-- Example for Pack table:
SELECT setval('"Pack_id_seq"', (SELECT MAX(id) FROM "Pack") + 1);
```

**Prevention strategies:**
- Always reset sequences after manual data insertion
- Use `COALESCE(MAX(id), 0) + 1` to handle empty tables
- Check sequence synchronization after database migrations
- Create debugging scripts for complex sequence issues

### Debugging Strategy
1. **Temporary Scripts**: Create debugging scripts instead of modifying main code
2. **Isolation Testing**: Test specific database operations in isolation
3. **Sequence Verification**: Check auto-increment sequences after data manipulation
4. **Transaction Safety**: Use transactions for multi-step database operations

## 📝 Enhanced Documentation Standards

*Updated with retrospective insights for comprehensive project documentation*

### PR Description Requirements
- **Implementation Summary**: Clear overview of changes made
- **Technical Details**: Specific technical implementation notes
- **Before/After Analysis**: Impact assessment and improvement metrics
- **Testing Validation**: Build success and functionality verification
- **Security Impact**: Vulnerability resolution and compliance improvements (for security PRs)

### Retrospective Documentation
- **AI Diary**: First-person reflection on approach and decision-making
- **Honest Feedback**: Critical assessment of session efficiency and quality
- **Pattern Recognition**: Identification of reusable patterns and approaches
- **Lessons Learned**: Specific insights for future implementation improvement
- **Technical Achievements**: Measurable improvements and security metrics (for complex implementations)

### Efficiency Factor Analysis

**Consistent High-Efficiency Sessions (15-49 minutes):**
- ✅ TodoWrite integration for progress tracking
- ✅ Reference patterns from previous successful implementations
- ✅ Systematic phase-by-phase approach
- ✅ Proactive build validation and incremental testing
- ✅ Clear GitHub issue tracking and proper workflow adherence

**Variable Efficiency Sessions (45-135 minutes):**
- 🔄 Complex dependency analysis required
- 🔄 Schema investigation and interface alignment needed
- 🔄 Multi-system integration with unknown factors
- 🔄 Novel implementation without reference patterns
