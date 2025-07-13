# Round Development Template

## 🔄 Development Approach: Paired Sub-Agent Rounds

### Round Structure (8 Rounds Total)

```typescript
const developmentRounds = {
  round1: {
    name: "Foundation Setup",
    focus: "Next.js + Auth + Theme",
    duration: "2-3h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "UI-SYSTEM.md"]
  },
  round2: {
    name: "Database Layer", 
    focus: "Prisma + Models + Basic APIs",
    duration: "3-4h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "API-AUTH.md"]
  },
  round3: {
    name: "LangGraph Integration",
    focus: "AI Workflow + Card System", 
    duration: "4-5h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "API-READINGS.md"]
  },
  round4: {
    name: "Chat UI & Reading Flow",
    focus: "Main UX + Real-time Features",
    duration: "4-5h", 
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "UI-COMPONENTS.md"]
  },
  round5: {
    name: "Payment & Credit System",
    focus: "Stripe + Transaction Management",
    duration: "3-4h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "API-PAYMENTS.md"]
  },
  round6: {
    name: "Gamification Features", 
    focus: "EXP + Coins + Daily Rewards",
    duration: "3-4h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "API-FEATURES.md"]
  },
  round7: {
    name: "History & Profile Management",
    focus: "User Dashboard + Data Management", 
    duration: "3-4h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "UI-LAYOUTS.md"]
  },
  round8: {
    name: "Mobile Polish & Deployment",
    focus: "Responsive + Performance + Deploy",
    duration: "2-3h",
    contextFiles: ["PROJECT-CORE.md", "ROUND-TEMPLATE.md", "UI-INTERACTIONS.md"]
  }
};
```

---

## 🎯 Round Execution Pattern

### Standard Workflow

```bash
# 1. Prepare context
cp PROJECT-CORE.md + ROUND-TEMPLATE.md + [SPECIFIC-FILE].md → context

# 2. Execute paired tasks
claude → [copy-paste round prompt] → implement Task A + Task B

# 3. Manual testing
npm run dev → test core functionality → verify mobile responsive

# 4. Git management  
git add . → git commit -m "Round X: [Task A] + [Task B]" → next round
```

### Quality Gates

```typescript
const qualityGates = {
  beforeRound: "Context files validated, objectives clear",
  duringRound: "Code compiles, no TypeScript errors", 
  afterRound: "Manual testing passed, responsive design verified",
  gitCommit: "Working state committed with clear message"
};
```

---

## 📝 Round Template Structure

### Task Definition Format

```typescript
interface RoundTasks {
  taskA: {
    title: string;
    description: string; 
    deliverables: string[];
    acceptanceCriteria: string[];
  };
  taskB: {
    title: string;
    description: string;
    deliverables: string[];
    acceptanceCriteria: string[];
  };
  integration: {
    description: string;
    testScenarios: string[];
  };
}
```

### Example Round Definition

```typescript
const exampleRound = {
  roundNumber: 1,
  roundName: "Foundation Setup",
  
  taskA: {
    title: "Next.js Project + Authentication",
    description: "Bootstrap Next.js 14 project with Clerk authentication and LINE LIFF integration",
    deliverables: [
      "Next.js 14 project with proper TypeScript config",
      "Clerk authentication setup with LINE provider",
      "Basic routing structure (/ask, /history, /profile)",
      "Environment variables configuration"
    ],
    acceptanceCriteria: [
      "User can login through LINE LIFF",
      "Protected routes redirect to login",
      "User session persists across page reloads"
    ]
  },
  
  taskB: {
    title: "Design System + Theme Setup", 
    description: "Implement MiMiVibes design system with DaisyUI and custom components",
    deliverables: [
      "DaisyUI + Tailwind CSS configuration",
      "Custom color theme implementation", 
      "Typography system setup",
      "Core component library (Button, Card, Input)"
    ],
    acceptanceCriteria: [
      "Theme colors match specification",
      "Components are responsive and accessible",
      "Dark mode support (optional)"
    ]
  },
  
  integration: {
    description: "Combine authentication with themed UI components",
    testScenarios: [
      "Login flow works with custom styled components",
      "User avatar displays correctly in navigation",
      "Mobile responsive design functions properly"
    ]
  }
};
```

---

## 🧪 Testing Strategies

### Manual Testing Checklist

```typescript
const testingChecklist = {
  functionality: [
    "All planned features work as expected",
    "No console errors or warnings",
    "API endpoints return correct responses",
    "Database operations complete successfully"
  ],
  
  responsive: [
    "Mobile (375px): All content accessible and usable",
    "Tablet (768px): Layout adapts appropriately", 
    "Desktop (1024px+): Full feature accessibility"
  ],
  
  performance: [
    "Initial page load < 3 seconds",
    "API responses < 2 seconds",
    "No memory leaks in browser"
  ],
  
  accessibility: [
    "Keyboard navigation works",
    "Color contrast meets WCAG standards",
    "Screen reader compatibility (basic)"
  ]
};
```

### Error Handling Standards

```typescript
const errorHandling = {
  apiErrors: "Graceful error messages with retry options",
  networkErrors: "Offline/connection status indicators", 
  validationErrors: "Clear field-level error messages",
  systemErrors: "Generic error page with contact information"
};
```

---

## 🔧 Development Standards

### Code Quality Requirements

```typescript
const codeStandards = {
  typescript: {
    strictMode: true,
    noImplicitAny: true,
    interfaces: "Define for all complex objects",
    types: "Use union types for enums and constants"
  },
  
  react: {
    functionalComponents: "Prefer over class components",
    hooks: "Use appropriately with dependency arrays",
    stateManagement: "Local state first, context for shared state",
    errorBoundaries: "Implement for critical components"
  },
  
  nextjs: {
    appRouter: "Use new App Router structure",
    serverComponents: "Default to server components when possible", 
    clientComponents: "Mark with 'use client' when needed",
    apiRoutes: "Follow REST conventions"
  }
};
```

### File Organization

```typescript
const fileStructure = {
  components: {
    location: "/src/components",
    structure: "Feature-based folders with index.ts exports",
    naming: "PascalCase for components, camelCase for utilities"
  },
  
  pages: {
    location: "/src/app", 
    structure: "Next.js App Router convention",
    naming: "kebab-case for routes, page.tsx for pages"
  },
  
  utilities: {
    location: "/src/lib",
    structure: "Functional modules with clear exports",
    naming: "camelCase for functions, UPPER_CASE for constants"
  }
};
```

---

## 🚀 Deployment Checklist

### Pre-deployment

```typescript
const preDeployment = {
  codeQuality: [
    "TypeScript compilation successful",
    "No ESLint warnings or errors",
    "All components have proper prop types"
  ],
  
  functionality: [
    "All user flows tested manually",
    "API endpoints tested with different inputs",
    "Payment flow tested with Stripe test mode"
  ],
  
  performance: [
    "Bundle size analyzed and optimized",
    "Images optimized and properly sized",
    "Unused dependencies removed"
  ]
};
```

### Environment Setup

```typescript
const environmentVariables = {
  required: [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY", 
    "DATABASE_URL",
    "GOOGLE_AI_API_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  ],
  
  optional: [
    "WEBHOOK_SECRET",
    "LINE_LIFF_ID",
    "SUPABASE_ANON_KEY"
  ]
};
```

---

## 📊 Progress Tracking

### Round Completion Criteria

```typescript
interface RoundCompletion {
  tasksCompleted: boolean;
  testingPassed: boolean; 
  documentationUpdated: boolean;
  gitCommitted: boolean;
  nextRoundPrepped: boolean;
}
```

### Success Metrics

```typescript
const successMetrics = {
  technical: [
    "Zero TypeScript compilation errors",
    "All planned features implemented", 
    "Mobile responsiveness verified",
    "Basic accessibility compliance"
  ],
  
  user: [
    "User can complete primary user flow",
    "Loading times meet performance targets",
    "Error states handle gracefully",
    "UI matches design specifications"
  ]
};
```

---

**Template Version**: 1.0  
**Compatible Rounds**: 1-8  
**Last Updated**: January 2025