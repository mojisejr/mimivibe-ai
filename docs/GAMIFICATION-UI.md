# MiMiVibes - Gamification UI Components

## 🎯 Overview

**Purpose**: Gamification UI components for Phase 2 development  
**Size**: ~2,500 tokens  
**Focus**: EXP & Level display, daily login rewards, coin exchange interface, referral system UI

---

## 🎮 Gamification UI Architecture

### UI Component Strategy

```typescript
const gamificationUI = {
  // EXP & Level System
  levelSystem: {
    levelDisplay: "Current level with progress bar",
    expProgress: "EXP progress visualization",
    levelUpModal: "Level up celebration modal",
    levelBenefits: "Level-based benefits display",
  },

  // Daily Login Campaigns
  dailyLogin: {
    loginStreak: "Daily login streak counter",
    rewardCalendar: "Monthly reward calendar",
    claimButton: "Daily reward claim button",
    streakBonus: "Streak bonus indicators",
  },

  // Coin Exchange System
  coinExchange: {
    coinBalance: "Current coin balance display",
    exchangeRate: "Coin to star exchange rate",
    exchangeForm: "Coin exchange form",
    exchangeHistory: "Exchange transaction history",
  },

  // Referral System
  referralSystem: {
    referralCode: "User's referral code display",
    referralStats: "Referral statistics",
    referralHistory: "Recent referrals list",
    shareButton: "Share referral code button",
  },
};
```

---

## 🏆 EXP & Level System UI

### 1. Level Display Component

#### Level Progress Card

```typescript
interface LevelData {
  currentLevel: number;
  currentExp: number;
  expToNextLevel: number;
  totalExp: number;
  levelBenefits: string[];
}

const LevelProgressCard = ({ levelData }: { levelData: LevelData }) => {
  const progressPercentage =
    (levelData.currentExp / levelData.expToNextLevel) * 100;

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">
              เลเวล {levelData.currentLevel}
            </h3>
            <p className="text-sm text-neutral-content">
              {levelData.currentExp} / {levelData.expToNextLevel} EXP
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {levelData.currentLevel}
            </div>
            <div className="text-xs text-neutral-content">เลเวล</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-base-300 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Level Benefits */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">สิทธิพิเศษในเลเวลนี้:</h4>
          <ul className="space-y-1">
            {levelData.levelBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm">
                <svg
                  className="w-4 h-4 text-primary mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

#### Level Up Modal

```typescript
import { Logo } from "@/components/ui/Logo";

const LevelUpModal = ({
  newLevel,
  rewards,
  onClose,
}: {
  newLevel: number;
  rewards: { exp: number; coins: number };
  onClose: () => void;
}) => (
  <div className="modal modal-open">
    <div className="modal-box">
      <div className="text-center">
        {/* Logo + Celebration Animation */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Logo size="lg" showText={false} />
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
          <div className="text-4xl font-bold text-primary mb-2">
            เลเวล {newLevel}!
          </div>
          <p className="text-neutral-content">
            ยินดีด้วย! คุณได้เลื่อนเลเวลแล้ว
          </p>
        </div>

        {/* Rewards Display */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">รางวัลเลเวลใหม่:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                +{rewards.exp}
              </div>
              <div className="text-sm text-neutral-content">EXP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                +{rewards.coins}
              </div>
              <div className="text-sm text-neutral-content">เหรียญ</div>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-primary">
          ตกลง
        </button>
      </div>
    </div>
  </div>
);
```

### 2. EXP Visualization

#### EXP Gauge Component

```typescript
const ExpGauge = ({
  currentExp,
  expToNextLevel,
  level,
}: {
  currentExp: number;
  expToNextLevel: number;
  level: number;
}) => {
  const progress = (currentExp / expToNextLevel) * 100;

  return (
    <div className="relative">
      <div className="w-full h-4 bg-base-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-base-content">
          {currentExp} / {expToNextLevel} EXP
        </span>
      </div>
    </div>
  );
};
```

---

## 📅 Daily Login Campaigns UI

### 1. Login Streak Display

#### Streak Counter Component

```typescript
interface StreakData {
  currentStreak: number;
  maxStreak: number;
  todayClaimed: boolean;
  monthlyProgress: number;
}

const LoginStreakCard = ({ streakData }: { streakData: StreakData }) => (
  <div className="card card-mystical">
    <div className="card-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">เข้าสู่ระบบต่อเนื่อง</h3>
          <p className="text-sm text-neutral-content">
            เข้าสู่ระบบทุกวันเพื่อรับรางวัล
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-neutral-content">วัน</div>
        </div>
      </div>

      {/* Streak Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>ความต่อเนื่องสูงสุด: {streakData.maxStreak} วัน</span>
          <span>{Math.round(streakData.monthlyProgress * 100)}%</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${streakData.monthlyProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Claim Button */}
      <button
        className={`btn w-full ${
          streakData.todayClaimed ? "btn-disabled" : "btn-primary"
        }`}
        disabled={streakData.todayClaimed}
      >
        {streakData.todayClaimed ? "รับรางวัลแล้ว" : "รับรางวัลวันนี้"}
      </button>
    </div>
  </div>
);
```

#### Monthly Calendar Component

```typescript
interface CalendarData {
  month: string;
  claimedDays: number[];
  totalDays: number;
}

const MonthlyCalendar = ({ calendarData }: { calendarData: CalendarData }) => {
  const daysInMonth = new Date(2024, 1, 0).getDate(); // Example for February
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <h3 className="text-lg font-bold mb-4">{calendarData.month}</h3>

        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
            <div
              key={day}
              className="text-center text-xs text-neutral-content p-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const isClaimed = calendarData.claimedDays.includes(day);
            return (
              <div
                key={day}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded
                  ${
                    isClaimed
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-neutral-content"
                  }
                `}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center text-sm text-neutral-content">
          รับรางวัลแล้ว {calendarData.claimedDays.length} /{" "}
          {calendarData.totalDays} วัน
        </div>
      </div>
    </div>
  );
};
```

### 2. Reward Claim Interface

#### Daily Reward Modal

```typescript
import { Logo } from "@/components/ui/Logo";

const DailyRewardModal = ({
  rewards,
  streak,
  onClaim,
  onClose,
}: {
  rewards: { exp: number; coins: number };
  streak: number;
  onClaim: () => void;
  onClose: () => void;
}) => (
  <div className="modal modal-open">
    <div className="modal-box">
      <div className="text-center">
        {/* Logo + Gift Icon */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Logo size="md" showText={false} />
          <div className="text-4xl">🎁</div>
        </div>

        <h3 className="text-xl font-bold mb-2">รางวัลประจำวัน</h3>
        <p className="text-neutral-content mb-4">
          เข้าสู่ระบบต่อเนื่อง {streak} วัน
        </p>

        {/* Rewards Display */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                +{rewards.exp}
              </div>
              <div className="text-sm text-neutral-content">EXP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                +{rewards.coins}
              </div>
              <div className="text-sm text-neutral-content">เหรียญ</div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClaim} className="btn btn-primary">
            รับรางวัล
          </button>
          <button onClick={onClose} className="btn btn-outline">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

---

## 🪙 Coin Exchange System UI

### 1. Coin Balance Display

#### Coin Balance Card

```typescript
interface CoinData {
  currentCoins: number;
  exchangeRate: number;
  dailyLimit: number;
  dailyUsed: number;
}

const CoinBalanceCard = ({ coinData }: { coinData: CoinData }) => {
  const remainingLimit = coinData.dailyLimit - coinData.dailyUsed;

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">เหรียญของฉัน</h3>
            <p className="text-sm text-neutral-content">แลกเหรียญเป็นเครดิต</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-secondary">
              {coinData.currentCoins}
            </div>
            <div className="text-xs text-neutral-content">เหรียญ</div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bg-base-200 rounded-lg p-3 mb-4">
          <div className="text-center">
            <div className="text-sm text-neutral-content mb-1">
              อัตราแลกเปลี่ยน
            </div>
            <div className="text-lg font-semibold">
              {coinData.exchangeRate} เหรียญ = 1 เครดิต
            </div>
          </div>
        </div>

        {/* Daily Limit */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>จำกัดการแลกเปลี่ยนวันนี้</span>
            <span>
              {remainingLimit} / {coinData.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(coinData.dailyUsed / coinData.dailyLimit) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. Exchange Form

#### Coin Exchange Form

```typescript
const CoinExchangeForm = ({
  coinData,
  onExchange,
}: {
  coinData: CoinData;
  onExchange: (coins: number) => void;
}) => {
  const [exchangeAmount, setExchangeAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const maxExchange = Math.min(
    coinData.currentCoins,
    coinData.dailyLimit - coinData.dailyUsed,
    Math.floor(coinData.currentCoins / coinData.exchangeRate) *
      coinData.exchangeRate
  );

  const creditsToReceive = Math.floor(exchangeAmount / coinData.exchangeRate);

  const handleExchange = async () => {
    if (exchangeAmount <= 0 || exchangeAmount > maxExchange) return;

    setLoading(true);
    try {
      await onExchange(exchangeAmount);
      setExchangeAmount(0);
    } catch (error) {
      console.error("Exchange failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <h3 className="text-lg font-bold mb-4">แลกเหรียญเป็นเครดิต</h3>

        <div className="space-y-4">
          {/* Exchange Amount Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">จำนวนเหรียญที่จะแลก</span>
            </label>
            <input
              type="number"
              min="0"
              max={maxExchange}
              value={exchangeAmount}
              onChange={(e) => setExchangeAmount(Number(e.target.value))}
              className="input input-bordered"
              placeholder="0"
            />
            <label className="label">
              <span className="label-text-alt">
                สูงสุด: {maxExchange} เหรียญ
              </span>
            </label>
          </div>

          {/* Exchange Preview */}
          {exchangeAmount > 0 && (
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-neutral-content mb-2">
                  คุณจะได้รับ
                </div>
                <div className="text-2xl font-bold text-primary">
                  {creditsToReceive} เครดิต
                </div>
                <div className="text-sm text-neutral-content mt-1">
                  จาก {exchangeAmount} เหรียญ
                </div>
              </div>
            </div>
          )}

          {/* Exchange Button */}
          <button
            onClick={handleExchange}
            disabled={
              exchangeAmount <= 0 || exchangeAmount > maxExchange || loading
            }
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                กำลังแลกเปลี่ยน...
              </>
            ) : (
              "แลกเปลี่ยน"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔗 Referral System UI

### 1. Referral Code Display

#### Referral Code Card

```typescript
interface ReferralData {
  code: string;
  totalReferrals: number;
  totalRewards: { exp: number; coins: number };
  recentReferrals: Array<{
    name: string;
    date: string;
    reward: { exp: number; coins: number };
  }>;
}

const ReferralCodeCard = ({ referralData }: { referralData: ReferralData }) => (
  <div className="card card-mystical">
    <div className="card-body">
      <h3 className="text-lg font-bold mb-4">รหัสแนะนำเพื่อน</h3>

      {/* Referral Code */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-neutral-content mb-2">รหัสของคุณ</div>
          <div className="text-2xl font-mono font-bold text-primary mb-2">
            {referralData.code}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(referralData.code)}
            className="btn btn-sm btn-outline btn-primary"
          >
            คัดลอก
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex space-x-2 mb-4">
        <button className="btn btn-sm btn-outline flex-1">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          อีเมล
        </button>
        <button className="btn btn-sm btn-outline flex-1">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          แชร์
        </button>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {referralData.totalReferrals}
          </div>
          <div className="text-sm text-neutral-content">เพื่อนที่แนะนำ</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">
            {referralData.totalRewards.exp + referralData.totalRewards.coins}
          </div>
          <div className="text-sm text-neutral-content">รางวัลรวม</div>
        </div>
      </div>
    </div>
  </div>
);
```

### 2. Referral History

#### Recent Referrals List

```typescript
const RecentReferralsList = ({
  referrals,
}: {
  referrals: ReferralData["recentReferrals"];
}) => (
  <div className="card card-mystical">
    <div className="card-body">
      <h3 className="text-lg font-bold mb-4">เพื่อนที่แนะนำล่าสุด</h3>

      <div className="space-y-3">
        {referrals.map((referral, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span className="text-xs">{referral.name.charAt(0)}</span>
                </div>
              </div>
              <div>
                <div className="font-semibold">{referral.name}</div>
                <div className="text-sm text-neutral-content">
                  {new Date(referral.date).toLocaleDateString("th-TH")}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-primary">
                +{referral.reward.exp} EXP
              </div>
              <div className="text-sm text-secondary">
                +{referral.reward.coins} เหรียญ
              </div>
            </div>
          </div>
        ))}

        {referrals.length === 0 && (
          <div className="text-center py-8 text-neutral-content">
            <div className="text-4xl mb-2">👥</div>
            <p>ยังไม่มีเพื่อนที่แนะนำ</p>
            <p className="text-sm">แชร์รหัสของคุณเพื่อรับรางวัล</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
```

---

## 🎨 Gamification UI Utilities

### 1. Animation Components

#### Reward Animation

```typescript
const RewardAnimation = ({
  type,
  amount,
  onComplete,
}: {
  type: "exp" | "coins";
  amount: number;
  onComplete: () => void;
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-base-300 rounded-lg p-6 shadow-2xl animate-bounce">
        <div className="text-center">
          <div className="text-4xl mb-2">{type === "exp" ? "⭐" : "🪙"}</div>
          <div className="text-2xl font-bold text-primary">
            +{amount} {type === "exp" ? "EXP" : "เหรียญ"}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. Progress Indicators

#### Circular Progress

```typescript
const CircularProgress = ({
  progress,
  size = 60,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-base-300"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
```

---

## 🎯 Gamification UI Best Practices

### 1. Visual Feedback

- **Immediate Response**: Show rewards instantly
- **Smooth Animations**: Use CSS transitions for state changes
- **Progress Indicators**: Clear progress visualization
- **Celebration Effects**: Special effects for achievements

### 2. User Engagement

- **Clear Goals**: Show what users can achieve
- **Progress Tracking**: Visual progress indicators
- **Reward Anticipation**: Build excitement for rewards
- **Social Elements**: Share achievements with friends

### 3. Mobile Optimization

- **Touch-Friendly**: Large touch targets
- **Responsive Design**: Adapt to screen sizes
- **Quick Actions**: Easy access to common actions
- **Offline Support**: Cache gamification data

### 4. Thai Language Support

- **Localized Text**: All text in Thai
- **Cultural Context**: Appropriate reward descriptions
- **Number Formatting**: Thai number formatting
- **Date Formatting**: Thai date formatting

---

**Gamification Focus**: Engaging, rewarding user experience  
**Visual Priority**: Clear progress and achievement indicators  
**Mobile Priority**: Touch-friendly gamification interface  
**Thai Support**: Complete Thai language localization
