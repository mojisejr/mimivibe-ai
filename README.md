# MiMiVibes - Tarot Card Reading Application

## 🔮 Project Overview

**MiMiVibes** is a comprehensive tarot card reading web application built with Next.js, featuring AI-powered card interpretations, user profiles, reading history, and gamification elements.

**Current Version**: Phase 2 Round 10  
**Latest Updates**: Enhanced UI/UX, mobile optimization, dynamic URL system, standardized card displays

---

## ✨ Features

### Core Features
- 🎴 **AI Tarot Readings** - Interactive card selection and AI-generated interpretations
- 👤 **User Profiles** - Personal reading history and statistics
- 🎮 **Gamification** - Experience points, levels, daily login rewards
- 💰 **Credit System** - Point-based reading system with Stripe payments
- 🔗 **Referral System** - Dynamic referral links with rewards
- 📱 **Mobile Optimized** - Responsive design with touch-friendly interactions

### Recent Phase 2 Round 10 Enhancements
- **Card Display Improvements**: Title Case formatting (the_fool → The Fool)
- **Mobile UX Optimization**: Smaller cards with modal popups for detailed views
- **Loading States**: Comprehensive loading indicators for all user actions
- **Dynamic URL System**: Fixed production deployment issues for referral links
- **Standardized Components**: Consistent card display across /ask and /history pages

---

## 🚀 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: Clerk Auth
- **Payments**: Stripe
- **Deployment**: Vercel
- **AI Integration**: OpenAI GPT models

---

## 📱 Pages & Features

### `/ask` - Card Reading Page
- Interactive tarot card selection interface
- AI-powered card interpretations
- Save/delete reading functionality
- Mobile-optimized card display with modals
- Loading states for all user actions

### `/history` - Reading History
- Personal reading archive
- Detailed reading views with standardized card displays
- Reading management (view/delete)
- Responsive grid layout

### `/profile` - User Profile
- User statistics and progress tracking
- Credit balance management
- Experience points and level system
- Referral code and link generation

### `/payments` - Credit Purchase
- Stripe-integrated payment system
- Multiple credit packages
- Secure payment processing
- Mobile-optimized checkout

---

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL (for production)
- Stripe account (for payments)
- Clerk account (for authentication)
- OpenAI API key

### Installation
```bash
# Clone repository
git clone [repository-url]
cd mimi-vibes-v3

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in your API keys and database URL

# Setup database
npx prisma db push
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mimivibes"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Payments (Stripe)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AI Integration
OPENAI_API_KEY=""

# App URL (Production)
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## 📚 Documentation

- **[UI Components](./docs/UI-COMPONENTS.md)** - Component architecture and design system
- **[API Features](./docs/API-FEATURES.md)** - Backend API endpoints and features
- **[UI Integration](./docs/UI-INTEGRATION.md)** - Frontend-backend integration patterns
- **[Progress Tracking](./docs/PROGRESS.md)** - Development progress and milestones

---

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database admin
npx prisma db push   # Push schema changes
npx prisma generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

---

## 🌐 Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Production Setup
- Configure `NEXT_PUBLIC_APP_URL` for your domain
- Set up Stripe webhooks endpoint
- Configure Clerk production instance
- Set up PostgreSQL database

---

## 🎯 Recent Improvements (Phase 2 Round 10)

### UI/UX Enhancements
- **Card Names**: Transformed from snake_case to Title Case formatting
- **Card Meanings**: Removed from card display for cleaner design  
- **Card Images**: Changed from object-cover to object-contain with white backgrounds
- **Mobile Optimization**: Smaller cards with modal popups for detailed views
- **Loading States**: Added comprehensive spinners and disabled states

### Technical Improvements
- **Dynamic URL System**: Fixed referral links production deployment issue
- **Component Standardization**: Unified card display across different pages
- **Responsive Design**: Enhanced mobile-first approach with touch-friendly interactions
- **Error Handling**: Improved TypeScript error resolution and build stability

### Bug Fixes
- Fixed mobile modal sizing issues
- Resolved TypeScript compilation errors
- Improved card detail modal z-index layering
- Enhanced responsive breakpoint handling

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔮 Mystical Tech Stack

*Built with modern web technologies to deliver magical tarot reading experiences*

**Frontend Magic**: ⚡ Next.js + 🎨 Tailwind CSS + 📱 Mobile-First Design  
**Backend Sorcery**: 🔮 AI Integration + 💳 Stripe Payments + 🔐 Secure Authentication  
**Data Enchantment**: 🗄️ PostgreSQL + 📊 Real-time Updates + 🎮 Gamification
