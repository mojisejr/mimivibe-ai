# Payment History Page Design Specification

## 📋 Overview

เอกสารนี้เป็นการออกแบบ Payment History Page สำหรับ MiMiVibes ตาม convention และ best practices ของโปรเจค โดยผู้ใช้งานจะสามารถดูประวัติการชำระเงิน รายละเอียดการซื้อแพ็คเกจ และข้อมูลเพื่อใช้ในการตรวจสอบเมื่อเกิดปัญหา

## 🎯 Business Requirements

### 1. ข้อมูลที่ผู้ใช้งานต้องการเห็น
- **จำนวนเงินที่จ่าย**: ราคาจริงที่จ่ายไป (เช่น ฿99, ฿199, ฿399)
- **แพ็คเกจที่ซื้อ**: ชื่อแพ็คเกจ เช่น "แพ็คเริ่มต้น", "แพ็คคุ้มค่า", "แพ็คพรีเมียม"
- **วันที่และเวลา**: วันที่ชำระเงิน พร้อมเวลาที่แม่นยำ
- **Stripe Payment ID**: เพื่อใช้ตรวจสอบกรณีปัญหา (เช่น pi_3ABC123...)
- **สถานะการชำระเงิน**: สำเร็จ/ล้มเหลว/รอดำเนินการ
- **จำนวนเครดิตที่ได้รับ**: ดาวที่เพิ่มในบัญชี

### 2. User Experience Requirements
- **เรียงลำดับตามเวลา**: ล่าสุดขึ้นก่อน
- **การแบ่งหน้า**: Infinite scroll หรือ pagination
- **การค้นหา**: ตามช่วงเวลา, แพ็คเกจ, หรือ Stripe ID
- **Mobile-first**: ใช้งานได้ดีบนมือถือ
- **Error handling**: จัดการกรณีไม่มีข้อมูล

## 🏗️ Technical Architecture

### 1. Database Schema Analysis
```typescript
// PaymentHistory table structure
interface PaymentHistory {
  id: string;                // cuid()
  userId: string;            // User ID from Clerk
  stripePaymentId: string;   // Stripe payment intent ID
  packId: number;            // Package ID
  amount: number;            // Amount in cents/satang
  currency: string;          // Default: "thb"
  status: string;            // "succeeded", "failed", "pending"
  creditsAdded: number;      // Stars added to account
  createdAt: Date;           // Payment timestamp
  
  // Relations
  user: User;
  pack: Pack;
}

// Pack table structure
interface Pack {
  id: number;
  title: string;             // "แพ็คเริ่มต้น", "แพ็คคุ้มค่า", etc.
  subtitle?: string;         // Optional description
  price: number;             // Price in cents/satang
  creditAmount: number;      // Stars to add
  metadata: {
    features: string[];
    description: string;
    bestFor: string;
    valuePerReading: string;
  };
  isActive: boolean;
  popular: boolean;
}
```

### 2. API Endpoint Design
```typescript
// GET /api/payments/history
interface PaymentHistoryRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  packId?: number;
  status?: 'succeeded' | 'failed' | 'pending';
  search?: string; // Search in Stripe Payment ID
}

interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      totalAmount: number;
      totalCredits: number;
      totalTransactions: number;
      successRate: number;
    };
  };
}

interface PaymentHistoryItem {
  id: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  creditsAdded: number;
  createdAt: string;
  pack: {
    id: number;
    title: string;
    subtitle?: string;
    price: number;
    creditAmount: number;
  };
}
```

### 3. Component Structure
```typescript
// Page structure following MiMiVibes patterns
/src/app/payments/
├── page.tsx                 // Main payment history page
├── components/
│   ├── PaymentHistoryPage.tsx    // Main container
│   ├── PaymentCard.tsx           // Individual payment card
│   ├── PaymentFilters.tsx        // Filter controls
│   ├── PaymentSummary.tsx        // Summary statistics
│   └── PaymentDetailModal.tsx    // Payment detail modal

// Hooks
/src/hooks/
├── usePaymentHistory.ts     // Payment history data fetching
└── usePaymentFilters.ts     // Filter state management
```

## 🎨 UI/UX Design

### 1. Layout Structure
```typescript
// Following MiMiVibes design patterns
<main className="content-container flex-1 pb-20 md:pb-6 pt-20">
  <div className="container mx-auto px-4 py-6">
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-base-content">
        ประวัติการชำระเงิน
      </h1>
      <p className="text-base-content/70 mt-1">
        ดูประวัติการซื้อแพ็คเกจและรายละเอียดการชำระเงิน
      </p>
    </div>

    {/* Summary Cards */}
    <PaymentSummary />

    {/* Filters */}
    <PaymentFilters />

    {/* Payment List */}
    <PaymentHistoryList />
  </div>
</main>
```

### 2. Payment Card Design
```typescript
// Card component following MiMiVibes theme
<div className="card-mystical p-4 mb-4">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="font-semibold text-base-content">
        {pack.title}
      </h3>
      <p className="text-sm text-base-content/70">
        {formatDate(createdAt)}
      </p>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-primary">
        ฿{formatAmount(amount)}
      </p>
      <StatusBadge status={status} />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="text-base-content/70">เครดิตที่ได้รับ:</span>
      <span className="ml-2 text-primary">⭐ {creditsAdded}</span>
    </div>
    <div>
      <span className="text-base-content/70">Payment ID:</span>
      <span className="ml-2 font-mono text-xs">
        {stripePaymentId}
      </span>
    </div>
  </div>
</div>
```

### 3. Status Badge Design
```typescript
// Status indicators following DaisyUI patterns
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    succeeded: "badge-success",
    failed: "badge-error", 
    pending: "badge-warning"
  };

  const labels = {
    succeeded: "สำเร็จ",
    failed: "ล้มเหลว",
    pending: "รอดำเนินการ"
  };

  return (
    <div className={`badge ${styles[status]} badge-sm`}>
      {labels[status]}
    </div>
  );
};
```

### 4. Mobile Responsive Design
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: single column */}
  {/* Tablet: 2 columns */}
  {/* Desktop: 3 columns */}
</div>

// Touch-friendly buttons
<button className="btn btn-primary btn-sm min-h-[44px] min-w-[44px]">
  รายละเอียด
</button>
```

## 🔧 Implementation Plan

### Phase 1: Backend API (1-2 hours)
1. **Create API endpoint** `/api/payments/history`
2. **Implement pagination** with cursor-based pagination
3. **Add filtering** by date, package, status
4. **Add search** by Stripe Payment ID
5. **Add summary statistics** calculation

### Phase 2: Frontend Components (2-3 hours)
1. **Create PaymentHistoryPage** main container
2. **Implement PaymentCard** component
3. **Add PaymentFilters** component
4. **Create PaymentSummary** statistics
5. **Add PaymentDetailModal** for detailed view

### Phase 3: Integration & Testing (1 hour)
1. **Connect API** to components
2. **Add error handling** and loading states
3. **Test responsive design** on mobile/desktop
4. **Add animations** using Framer Motion

## 📊 Data Flow

### 1. Page Load Flow
```
User visits /payments → 
PaymentHistoryPage loads → 
usePaymentHistory hook fetches data → 
API calls /api/payments/history → 
Database query with pagination → 
Return formatted data → 
Render PaymentCard components
```

### 2. Filter Flow
```
User changes filters → 
usePaymentFilters updates state → 
usePaymentHistory refetches with new params → 
API applies filters to query → 
Return filtered results → 
Re-render component list
```

### 3. Detail View Flow
```
User clicks payment card → 
PaymentDetailModal opens → 
Display full payment details → 
Show Stripe Payment ID for copying → 
Allow close/navigation
```

## 🛡️ Security Considerations

### 1. Data Privacy
- **User isolation**: Only show payments for authenticated user
- **Sensitive data**: Limit Stripe data exposure
- **Authentication**: Require valid Clerk session

### 2. API Security
```typescript
// API route security
export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only return payments for this user
  const payments = await prisma.paymentHistory.findMany({
    where: { userId },
    // ... rest of query
  });
}
```

## 🚀 Performance Optimizations

### 1. Database Query Optimization
```typescript
// Efficient pagination query
const payments = await prisma.paymentHistory.findMany({
  where: { userId },
  include: {
    pack: {
      select: {
        id: true,
        title: true,
        subtitle: true,
        price: true,
        creditAmount: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit
});
```

### 2. Frontend Performance
- **Lazy loading**: Load more payments on scroll
- **Memoization**: Cache payment data
- **Skeleton loading**: Show loading states
- **Virtual scrolling**: For large datasets

## 🎯 Success Metrics

### 1. User Experience
- **Page load time**: < 2 seconds
- **Search response**: < 500ms
- **Mobile usability**: 100% touch-friendly
- **Error rate**: < 1% API failures

### 2. Business Value
- **User engagement**: Time spent on page
- **Support reduction**: Self-service payment lookup
- **Trust building**: Transparent payment history
- **Conversion**: Easier re-purchase decisions

## 📱 Mobile Considerations

### 1. Touch Interface
- **Minimum touch targets**: 44px × 44px
- **Swipe gestures**: For navigation
- **Pull-to-refresh**: For data updates
- **Haptic feedback**: For interactions

### 2. Performance
- **Lazy loading**: Load 10-20 items initially
- **Image optimization**: Compress pack images
- **Bundle splitting**: Separate payment components
- **Caching**: Store recent queries

## 🔮 Future Enhancements

### 1. Advanced Features
- **Export to PDF**: Download payment history
- **Email receipts**: Resend payment confirmations
- **Refund tracking**: Show refund status
- **Payment analytics**: Spending patterns

### 2. Integration Opportunities
- **Accounting systems**: Export for bookkeeping
- **Tax reporting**: Annual payment summaries
- **Loyalty programs**: Track purchase history
- **Subscription management**: For recurring payments

---

## 🤔 Design Questions for Discussion

### 1. UI/UX Questions
1. **การแสดงผล Stripe Payment ID**: ควรแสดงเต็มหรือย่อ (เช่น pi_3ABC...789)?
2. **การจัดกลุ่มข้อมูล**: ควรจัดกลุ่มตามเดือน/ปี หรือแสดงเป็นรายการต่อเนื่อง?
3. **การค้นหา**: ต้องการค้นหาแบบ real-time หรือ submit-based?
4. **สถิติสรุป**: ควรแสดงสถิติช่วงเวลาใด (เดือนนี้, ปีนี้, ทั้งหมด)?

### 2. Technical Questions
1. **Pagination**: ใช้ cursor-based หรือ offset-based pagination?
2. **Caching**: ควร cache ข้อมูลนานแค่ไหน?
3. **Real-time updates**: ต้องการ real-time updates หรือ manual refresh?
4. **Export functionality**: ต้องการ export เป็น PDF/CSV หรือไม่?

### 3. Business Questions
1. **Data retention**: ควรเก็บประวัติการชำระเงินนานแค่ไหน?
2. **Refund handling**: จะจัดการ refund cases อย่างไร?
3. **Customer support**: ต้องการ feature ติดต่อ support จากหน้านี้หรือไม่?
4. **Analytics**: ต้องการ track user behavior บนหน้านี้หรือไม่?

### 4. Performance Questions
1. **Load balancing**: จะจัดการ high traffic อย่างไร?
2. **Database indexing**: ควร index fields ไหนบ้าง?
3. **CDN**: ต้องการ CDN สำหรับ static assets หรือไม่?
4. **Monitoring**: ต้องการ monitoring/alerting อย่างไร?

---

**หมายเหตุ**: เอกสารนี้เป็น living document ที่สามารถปรับปรุงได้ตามความต้องการและ feedback ในระหว่างการพัฒนา