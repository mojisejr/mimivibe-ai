# Round 11: Error Handling & Loading States

## 📋 Overview
Implement comprehensive error boundaries, retry mechanisms, consistent loading states, and offline handling for production-ready application stability.

## 🎯 Success Criteria
- [ ] Error boundaries prevent app crashes with graceful fallbacks
- [ ] Retry mechanisms for transient failures
- [ ] Consistent loading states across all components
- [ ] Offline handling with appropriate user feedback

## 🔧 Technical Implementation

### Task A: Comprehensive Error Boundaries
1. **Global Error Boundary**
   - Wrap entire application with error boundary
   - Catch JavaScript errors and prevent app crashes
   - Display user-friendly error messages
   - Implement error reporting and logging

2. **Page-Level Error Boundaries**
   - Wrap each page with specific error boundaries
   - Handle page-specific errors gracefully
   - Provide page-specific error recovery options
   - Maintain navigation functionality during errors

3. **Component-Level Error Boundaries**
   - Wrap critical components (payments, readings)
   - Isolate errors to prevent cascade failures
   - Provide component-specific fallbacks
   - Implement error recovery actions

### Task B: Retry Mechanisms
1. **API Request Retries**
   - Implement exponential backoff for failed requests
   - Configure retry limits and timeout handling
   - Distinguish between retryable and non-retryable errors
   - Add retry buttons for user-initiated retries

2. **Smart Retry Logic**
   - Network-aware retry strategies
   - Rate limiting protection
   - User consent for expensive operations
   - Background retry for non-critical requests

3. **Retry UI Components**
   - Retry buttons with loading states
   - Retry counters and progress indicators
   - Error context display
   - Manual retry triggers

### Task C: Consistent Loading States
1. **Skeleton Components**
   - Create skeleton loaders for all major components
   - Match actual component dimensions and layout
   - Implement shimmer effects and animations
   - Progressive loading for complex components

2. **Loading Indicators**
   - Spinners for quick actions
   - Progress bars for known duration tasks
   - Infinite loading for streaming operations
   - Context-aware loading messages

3. **Loading State Management**
   - Centralized loading state management
   - Loading state composition for complex flows
   - Minimum loading time to prevent flashing
   - Loading state persistence across navigation

### Task D: Offline Handling
1. **Connection Detection**
   - Network status monitoring
   - Connection quality detection
   - Offline/online state management
   - Connection change notifications

2. **Offline UI**
   - Offline mode indicators
   - Cached content display
   - Offline action queuing
   - Sync status indicators

3. **Sync Management**
   - Queue offline actions for sync
   - Automatic sync on reconnection
   - Conflict resolution strategies
   - Sync progress indicators

## 📱 Components to Create/Update
- `src/components/error/ErrorBoundary.tsx` - Global error boundary
- `src/components/error/PageErrorBoundary.tsx` - Page-level error handling
- `src/components/error/ComponentErrorBoundary.tsx` - Component-level errors
- `src/components/loading/SkeletonLoader.tsx` - Skeleton loading components
- `src/components/loading/LoadingSpinner.tsx` - Loading indicators
- `src/components/loading/ProgressBar.tsx` - Progress indicators
- `src/components/offline/OfflineIndicator.tsx` - Offline status
- `src/components/offline/SyncManager.tsx` - Sync management
- `src/hooks/useErrorBoundary.ts` - Error boundary management
- `src/hooks/useRetry.ts` - Retry mechanism
- `src/hooks/useOffline.ts` - Offline state management
- `src/utils/errorReporting.ts` - Error reporting utilities

## 🎨 Design Requirements
- Non-intrusive error messages that don't break user flow
- Loading states that match component content structure
- Clear offline indicators without alarming users
- Consistent error styling across all components
- Mobile-optimized error and loading states
- Accessibility for error messages and loading states

## 🧪 Testing Checklist
- [ ] Error boundaries catch all types of errors
- [ ] Retry mechanisms work for various failure scenarios
- [ ] Loading states display correctly for all components
- [ ] Offline handling works with poor connectivity
- [ ] Error messages are user-friendly and actionable
- [ ] Loading states don't flash or flicker
- [ ] Retry logic respects rate limits
- [ ] Offline queuing and sync work properly

## 🔄 Integration Points
- Existing API endpoints and error responses
- Authentication system for error context
- Toast notifications for error feedback
- Navigation system for error recovery
- Database for offline action queuing

## 📊 Error Types & Handling
```typescript
const errorTypes = {
  network: {
    description: 'Connection failures, timeouts',
    handling: 'Retry with exponential backoff',
    userAction: 'Check connection, retry button'
  },
  authentication: {
    description: 'Auth token expired, unauthorized',
    handling: 'Redirect to login, refresh token',
    userAction: 'Re-authenticate'
  },
  validation: {
    description: 'Form validation, data format errors',
    handling: 'Show field-specific errors',
    userAction: 'Correct input, resubmit'
  },
  server: {
    description: '500 errors, service unavailable',
    handling: 'Retry later, fallback content',
    userAction: 'Wait and retry'
  },
  client: {
    description: 'JavaScript errors, component crashes',
    handling: 'Error boundary, graceful fallback',
    userAction: 'Refresh page, contact support'
  }
};
```

## 📱 Loading State Examples
```typescript
const loadingStates = {
  readingGeneration: {
    type: 'progress',
    message: 'กำลังทำนายไพ่...',
    estimatedTime: '30s',
    allowCancel: true
  },
  historyLoad: {
    type: 'skeleton',
    components: ['ReadingCard', 'ReadingCard', 'ReadingCard'],
    shimmer: true
  },
  payment: {
    type: 'spinner',
    message: 'กำลังประมวลผลการชำระเงิน...',
    allowCancel: false
  },
  profileUpdate: {
    type: 'inline',
    message: 'กำลังบันทึก...',
    showInButton: true
  }
};
```

## 🔧 Retry Configuration
```typescript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  nonRetryableStatuses: [400, 401, 403, 404, 422]
};
```

## 📊 Expected Outcomes
- Stable application that gracefully handles all error scenarios
- Consistent and informative loading states across all features
- Intelligent retry mechanisms that improve user experience
- Comprehensive offline support with proper sync management
- Production-ready error handling and reporting
- Improved user confidence through proper error communication