# Round 9.6C: Feature Improvements

> **🎯 Context**: Phase C of Round 9.6 - Feature accuracy improvements and API integration enhancements  
> **⏱️ Duration**: 2 hours  
> **🔴 Priority**: Medium (Feature Enhancement)

## 🚀 Implementation Brief

You are implementing **Round 9.6C: Feature Improvements** for MiMiVibes, a Thai tarot reading application. This phase addresses 2 feature improvement issues that enhance system accuracy and data integration.

### Tech Stack Context
- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, PostgreSQL + Prisma ORM
- **AI**: LangGraph workflow + Multi-LLM (OpenAI GPT-4-turbo + Gemini)
- **Deployment**: Vercel (60s timeout limit)

---

## 🎯 Phase C Tasks

### **Issue #8: History Filter System Improvements**
**Problem**: Topic filter shows non-existent categories, card count filter allows values beyond system capability.

**Root Cause**: Filter options not aligned with actual system capabilities and data.

**Files to Fix**:
- `/src/components/history/SearchFilters.tsx` (filter options)
- `/src/hooks/useSearch.ts` (topic classification)
- `/src/lib/constants/filters.ts` (create filter constants)

**Implementation**:
```typescript
// Remove topic filter completely and fix card count options
const CARD_COUNT_OPTIONS = [
  { value: "all", label: "ทุกจำนวน" },
  { value: "3", label: "3 ใบ" },
  { value: "5", label: "5 ใบ" }
];

// Remove topic filter from SearchFilters component
const SearchFilters = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Keep: Search input */}
      <div className="form-control">
        <input
          type="text"
          placeholder="ค้นหาคำถาม..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      {/* Keep: Review status filter */}
      <div className="form-control">
        <select
          value={filters.reviewStatus}
          onChange={(e) => onFilterChange('reviewStatus', e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="reviewed">รีวิวแล้ว</option>
          <option value="not-reviewed">ยังไม่รีวิว</option>
        </select>
      </div>

      {/* Fixed: Card count filter - only 3 and 5 cards */}
      <div className="form-control">
        <select
          value={filters.cardCount}
          onChange={(e) => onFilterChange('cardCount', e.target.value)}
          className="select select-bordered w-full"
        >
          {CARD_COUNT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
```

---

### **Issue #9: Landing Page API Integration**
**Problem**: Home page (/) pricing cards use mock data instead of real API data.

**Root Cause**: Landing page not connected to actual package pricing API.

**Files to Fix**:
- `/src/app/page.tsx` (pricing cards section)
- `/src/hooks/usePackages.ts` (create API hook)
- `/src/components/landing/PricingCards.tsx` (create component)

**Implementation**:
```typescript
// Create usePackages hook for API integration
const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/payments/packages');
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        setPackages(data.packages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
};

// Create PricingCards component
const PricingCards = () => {
  const { packages, loading, error } = usePackages();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-64 w-full rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>ไม่สามารถโหลดแพ็คเกจได้: {error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-primary">{pkg.name}</h3>
            <p className="text-3xl font-bold text-secondary">
              {pkg.price}฿
            </p>
            <p className="text-sm text-base-content/70">
              {pkg.description}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>⭐ {pkg.stars} ดาว</li>
              <li>🎁 {pkg.bonusCoins} เหรียญโบนัส</li>
              <li>📱 ใช้งานได้ทันที</li>
            </ul>
            <div className="card-actions justify-end">
              <Link href="/packages" className="btn btn-primary">
                เลือกแพ็คเกจ
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] History filters show only valid options (no topic filter)
- [ ] Card count filter shows only "3 ใบ" and "5 ใบ" options
- [ ] Landing page displays real pricing from API
- [ ] Pricing cards show correct prices (99฿, 199฿, 399฿)
- [ ] Loading states work properly for pricing cards
- [ ] Error handling works when API fails

### Success Criteria
- [ ] Topic filter completely removed from history page
- [ ] Card count filter limited to system capabilities (3, 5 cards)
- [ ] Landing page uses real API data for pricing
- [ ] Pricing cards display correct information and formatting
- [ ] Loading states and error handling work properly

---

## 🔧 Implementation Notes

### Filter System Improvements
```typescript
// Remove topic-related code completely
const filterReadings = (readings: ReadingWithCards[], filters: FilterState) => {
  return readings.filter(reading => {
    // Remove topic filter logic
    const searchMatch = !filters.search || 
      reading.question.toLowerCase().includes(filters.search.toLowerCase());
    
    const reviewMatch = filters.reviewStatus === 'all' || 
      (filters.reviewStatus === 'reviewed' && reading.isReviewed) ||
      (filters.reviewStatus === 'not-reviewed' && !reading.isReviewed);
    
    const cardCountMatch = filters.cardCount === 'all' || 
      reading.cards.length.toString() === filters.cardCount;
    
    return searchMatch && reviewMatch && cardCountMatch;
  });
};
```

### API Integration Pattern
```typescript
// Consistent API hook pattern
const useApiData = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

---

## 📋 File Priority Order

1. **High Priority**: `/src/components/history/SearchFilters.tsx` (remove topic filter)
2. **High Priority**: `/src/hooks/useSearch.ts` (update filter logic)
3. **Medium Priority**: `/src/hooks/usePackages.ts` (create API hook)
4. **Medium Priority**: `/src/app/page.tsx` (integrate pricing cards)

---

## 🎯 Key Constraints

- **System Capability**: Only 3 and 5 card readings are supported
- **API Consistency**: Use existing `/api/payments/packages` endpoint
- **UX Continuity**: Maintain existing design patterns and components
- **Performance**: Ensure loading states don't cause UI jumping

---

**Implementation Strategy**: Remove topic filter first, then fix card count options, then integrate real API data for pricing cards. Test each change to ensure no regression.

**Final Result**: After completing Phase C, all 9 critical issues from manual testing will be resolved, improving production quality and user experience.