# MiMiVibes - Frontend API Integration Patterns

## 🎯 Overview

**Purpose**: Frontend API integration patterns for Phase 2 development  
**Size**: ~2,500 tokens  
**Focus**: API call patterns, loading states, error handling, data fetching strategies

---

## 📱 Frontend Integration Architecture

### Data Fetching Strategy

```typescript
const integrationPatterns = {
  // API Call Patterns
  apiCalls: {
    profile: {
      userData: "GET /api/user/profile",
      userStats: "GET /api/user/stats",
      userCredits: "GET /api/user/credits",
    },
    history: {
      readingHistory: "GET /api/readings/history",
      specificReading: "POST /api/readings/history",
    },
    gamification: {
      levels: "GET /api/gamification/levels",
      dailyLogin: "GET /api/campaigns/daily-login/status",
      coinExchange: "GET /api/coins/exchange-rates",
      referralStatus: "GET /api/referrals/status",
    },
  },

  // Loading States
  loadingStates: {
    skeleton: "Skeleton loading for cards and lists",
    spinner: "Spinner for buttons and actions",
    progress: "Progress bars for long operations",
    shimmer: "Shimmer effect for content areas",
  },

  // Error Handling
  errorHandling: {
    network: "Network error with retry button",
    validation: "Form validation errors",
    server: "Server error with fallback UI",
    timeout: "Request timeout handling",
  },
};
```

---

## 🔄 API Integration Patterns

### 1. Profile Page Integration

#### User Data Fetching

```typescript
// Profile data fetching pattern
const fetchUserProfile = async () => {
  try {
    const [profile, stats, credits] = await Promise.all([
      fetch("/api/user/profile"),
      fetch("/api/user/stats"),
      fetch("/api/user/credits"),
    ]);

    return {
      profile: await profile.json(),
      stats: await stats.json(),
      credits: await credits.json(),
    };
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
};
```

#### Loading States for Profile

```typescript
const ProfileLoadingState = () => (
  <div className="space-y-6">
    {/* User Info Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="flex items-center space-x-4">
          <div className="avatar skeleton w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-4 w-48" />
          </div>
        </div>
      </div>
    </div>

    {/* Credits Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-24 mb-4" />
        <div className="skeleton h-8 w-16 mb-4" />
        <div className="skeleton h-10 w-32" />
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="card card-mystical">
      <div className="card-body">
        <div className="skeleton h-6 w-20 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="skeleton h-8 w-12 mx-auto mb-2" />
            <div className="skeleton h-4 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <div className="skeleton h-8 w-8 mx-auto mb-2" />
            <div className="skeleton h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

#### Error Handling for Profile

```typescript
const ProfileErrorState = ({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) => (
  <div className="card card-mystical">
    <div className="card-body text-center">
      <div className="text-error mb-4">
        <svg
          className="w-12 h-12 mx-auto mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-lg font-semibold">เกิดข้อผิดพลาด</h3>
        <p className="text-sm text-neutral-content">{error}</p>
      </div>
      <button onClick={retry} className="btn btn-primary">
        ลองใหม่อีกครั้ง
      </button>
    </div>
  </div>
);
```

### 2. History Page Integration

#### Reading History Fetching

```typescript
// History data fetching pattern
const fetchReadingHistory = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `/api/readings/history?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reading history");
    }

    return await response.json();
  } catch (error) {
    throw new Error("ไม่สามารถโหลดประวัติการดูดวงได้");
  }
};
```

#### History Loading State

```typescript
const HistoryLoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card card-mystical">
        <div className="card-body">
          <div className="skeleton h-6 w-32 mb-2" />
          <div className="skeleton h-4 w-20 mb-4" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
          </div>
          <div className="skeleton h-8 w-24 mt-4 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);
```

#### History Empty State

```typescript
const HistoryEmptyState = () => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">🔮</div>
    <h3 className="text-xl font-semibold mb-2">ยังไม่มีประวัติการดูดวง</h3>
    <p className="text-neutral-content mb-6">
      เริ่มต้นการเดินทางทางจิตวิญญาณของคุณด้วยการดูดวงครั้งแรก
    </p>
    <Link href="/ask" className="btn btn-primary">
      ดูดวงครั้งแรก
    </Link>
  </div>
);
```

### 3. Real-time Data Updates

#### Credit Balance Updates

```typescript
// Real-time credit balance updates
const useCreditBalance = () => {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh credits after reading completion
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, error, refetch: fetchCredits };
};
```

#### EXP & Level Updates

```typescript
// Real-time EXP and level updates
const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};
```

---

## 🎨 UI Component Patterns

### 1. Loading Components

#### Skeleton Loading

```typescript
const SkeletonCard = () => (
  <div className="card card-mystical animate-pulse">
    <div className="card-body">
      <div className="skeleton h-6 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/6" />
      </div>
    </div>
  </div>
);
```

#### Spinner Component

```typescript
const Spinner = ({
  size = "md",
  text = "กำลังโหลด...",
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className={`loading loading-spinner loading-${size} text-primary`} />
    {text && <p className="text-sm text-neutral-content">{text}</p>}
  </div>
);
```

### 2. Error Components

#### Error Boundary

```typescript
import { Logo } from "@/components/ui/Logo";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card card-mystical max-w-md">
            <div className="card-body text-center">
              {/* Logo + Error Icon */}
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Logo size="lg" showText={false} />
                <div className="text-error">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-sm text-neutral-content mb-4">
                เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองรีเฟรชหน้าเว็บ
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                รีเฟรชหน้าเว็บ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Network Error Component

```typescript
import { Logo } from "@/components/ui/Logo";

const NetworkError = ({ retry }: { retry: () => void }) => (
  <div className="card card-mystical">
    <div className="card-body text-center">
      {/* Logo + Warning Icon */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Logo size="md" showText={false} />
        <div className="text-warning">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold">การเชื่อมต่อมีปัญหา</h3>
      <p className="text-sm text-neutral-content">
        ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
      </p>
      <button onClick={retry} className="btn btn-warning mt-4">
        ลองใหม่อีกครั้ง
      </button>
    </div>
  </div>
);
```

---

## 🔧 Integration Utilities

### 1. API Client Utility

```typescript
// Centralized API client
class ApiClient {
  private baseUrl = "/api";

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### 2. Data Fetching Hooks

```typescript
// Custom hooks for data fetching
export const useApiData = <T>(endpoint: string, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};
```

---

## 📱 Mobile-First Integration

### 1. Responsive Data Display

```typescript
// Responsive data display patterns
const ResponsiveDataCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}) => (
  <div className="card card-mystical">
    <div className="card-body p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-primary">{icon}</div>
          <div>
            <h3 className="text-sm font-medium text-neutral-content">
              {title}
            </h3>
            <p className="text-lg font-bold">{value}</p>
          </div>
        </div>
        {trend && (
          <div
            className={`badge badge-sm ${
              trend === "up"
                ? "badge-success"
                : trend === "down"
                ? "badge-error"
                : "badge-neutral"
            }`}
          >
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          </div>
        )}
      </div>
    </div>
  </div>
);
```

### 2. Touch-Friendly Interactions

```typescript
// Touch-friendly interaction patterns
const TouchFriendlyButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      btn btn-primary min-h-[44px] px-6 py-3
      ${loading ? "loading" : ""}
      ${disabled ? "btn-disabled" : ""}
      active:scale-95 transition-transform
    `}
  >
    {loading ? (
      <span className="loading loading-spinner loading-sm" />
    ) : (
      children
    )}
  </button>
);
```

---

## 🎯 Integration Best Practices

### 1. Performance Optimization

- **Lazy Loading**: Load data only when needed
- **Caching**: Cache API responses for better UX
- **Debouncing**: Debounce search and filter inputs
- **Pagination**: Implement infinite scroll or pagination

### 2. Error Recovery

- **Retry Logic**: Automatic retry for failed requests
- **Fallback UI**: Graceful degradation when APIs fail
- **Offline Support**: Handle offline scenarios
- **User Feedback**: Clear error messages in Thai

### 3. Accessibility

- **Screen Readers**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant colors

### 4. Thai Language Support

- **Localization**: All text in Thai
- **Cultural Sensitivity**: Appropriate messaging
- **Error Messages**: User-friendly Thai errors
- **Loading States**: Thai progress messages

---

**Integration Focus**: Seamless frontend-backend integration with excellent UX  
**Performance Target**: Sub-2 second loading times  
**Error Handling**: Graceful degradation with clear user feedback  
**Mobile Priority**: Touch-friendly, responsive design
