# MiMiVibes - Stripe Payment UI Integration

## 🎯 Overview

**Purpose**: Stripe payment UI integration for Phase 2 development  
**Size**: ~2,000 tokens  
**Focus**: Stripe Elements setup, payment flow UI, payment confirmation, transaction display

---

## 💳 Payment UI Architecture

### Stripe Integration Strategy

```typescript
const paymentIntegration = {
  // Stripe Elements Setup
  stripeElements: {
    card: "CardElement for credit card input",
    cardNumber: "CardNumberElement for card number only",
    cardExpiry: "CardExpiryElement for expiry date",
    cardCvc: "CardCvcElement for CVC code",
    postalCode: "PostalCodeElement for billing address",
  },

  // Payment Flow States
  paymentStates: {
    initial: "Package selection and payment intent creation",
    processing: "Payment processing with loading states",
    success: "Payment success with confirmation",
    failed: "Payment failure with error handling",
    pending: "Payment pending webhook confirmation",
  },

  // UI Components
  uiComponents: {
    packageCard: "Package selection cards with pricing",
    paymentForm: "Stripe Elements payment form",
    confirmationModal: "Payment success confirmation",
    errorModal: "Payment error with retry options",
    transactionHistory: "Payment history display",
  },
};
```

---

## 🎨 Payment UI Components

### 1. Package Selection Cards

#### Package Card Component

```typescript
interface Package {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  credits: number;
  popular?: boolean;
  features: string[];
}

const PackageCard = ({
  package: pkg,
  onSelect,
  selected = false,
}: {
  package: Package;
  onSelect: (pkg: Package) => void;
  selected?: boolean;
}) => (
  <div
    className={`
      card card-mystical cursor-pointer transition-all duration-200
      ${selected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-lg"}
      ${pkg.popular ? "ring-2 ring-secondary" : ""}
    `}
    onClick={() => onSelect(pkg)}
  >
    {pkg.popular && (
      <div className="badge badge-secondary absolute -top-3 left-1/2 transform -translate-x-1/2">
        ยอดนิยม
      </div>
    )}

    <div className="card-body">
      <h3 className="card-title text-center mb-2">{pkg.title}</h3>
      <p className="text-center text-neutral-content mb-4">{pkg.subtitle}</p>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-primary mb-1">
          ฿{pkg.price.toLocaleString()}
        </div>
        <div className="text-sm text-neutral-content">{pkg.credits} เครดิต</div>
      </div>

      <ul className="space-y-2 mb-6">
        {pkg.features.map((feature, index) => (
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
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={`
          btn w-full ${selected ? "btn-primary" : "btn-outline btn-primary"}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(pkg);
        }}
      >
        {selected ? "เลือกแล้ว" : "เลือกแพ็คเกจ"}
      </button>
    </div>
  </div>
);
```

#### Package Grid Component

```typescript
const PackageGrid = ({
  packages,
  selectedPackage,
  onPackageSelect,
}: {
  packages: Package[];
  selectedPackage: Package | null;
  onPackageSelect: (pkg: Package) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {packages.map((pkg) => (
      <PackageCard
        key={pkg.id}
        package={pkg}
        selected={selectedPackage?.id === pkg.id}
        onSelect={onPackageSelect}
      />
    ))}
  </div>
);
```

### 2. Stripe Payment Form

#### Payment Form Component

```typescript
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface PaymentFormProps {
  selectedPackage: Package;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm = ({
  selectedPackage,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          credits: selectedPackage.credits,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: paymentError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: "User Name", // Get from user profile
            },
          },
        });

      if (paymentError) {
        setError(paymentError.message || "เกิดข้อผิดพลาดในการชำระเงิน");
        onPaymentError(paymentError.message || "เกิดข้อผิดพลาดในการชำระเงิน");
      } else {
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Summary */}
      <div className="card card-mystical">
        <div className="card-body">
          <h3 className="card-title mb-4">สรุปการสั่งซื้อ</h3>
          <div className="flex justify-between items-center mb-2">
            <span>แพ็คเกจ:</span>
            <span className="font-semibold">{selectedPackage.title}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span>เครดิต:</span>
            <span className="font-semibold">
              {selectedPackage.credits} เครดิต
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-primary">
            <span>ราคารวม:</span>
            <span>฿{selectedPackage.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="card card-mystical">
        <div className="card-body">
          <h3 className="card-title mb-4">ข้อมูลการชำระเงิน</h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text">หมายเลขบัตรเครดิต</span>
            </label>
            <div className="input input-bordered">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn btn-primary w-full mt-6"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                กำลังประมวลผล...
              </>
            ) : (
              `ชำระเงิน ฿${selectedPackage.price.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
```

### 3. Payment Confirmation Modal

#### Success Modal

```typescript
import { Logo } from "@/components/ui/Logo";

const PaymentSuccessModal = ({
  paymentIntent,
  onClose,
}: {
  paymentIntent: any;
  onClose: () => void;
}) => (
  <div className="modal modal-open">
    <div className="modal-box">
      <div className="text-center">
        {/* Logo + Success Icon */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Logo size="md" showText={false} />
          <div className="text-success">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">ชำระเงินสำเร็จ!</h3>
        <p className="text-neutral-content mb-4">
          การชำระเงินของคุณเสร็จสิ้นแล้ว เครดิตจะถูกเพิ่มเข้าบัญชีของคุณทันที
        </p>

        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-content">หมายเลขคำสั่งซื้อ:</span>
              <p className="font-mono">{paymentIntent.id}</p>
            </div>
            <div>
              <span className="text-neutral-content">จำนวนเงิน:</span>
              <p className="font-semibold">
                ฿{(paymentIntent.amount / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-primary">
            ตกลง
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

#### Error Modal

```typescript
import { Logo } from "@/components/ui/Logo";

const PaymentErrorModal = ({
  error,
  onRetry,
  onClose,
}: {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}) => (
  <div className="modal modal-open">
    <div className="modal-box">
      <div className="text-center">
        {/* Logo + Error Icon */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Logo size="md" showText={false} />
          <div className="text-error">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-neutral-content mb-6">{error}</p>

        <div className="modal-action">
          <button onClick={onRetry} className="btn btn-primary">
            ลองใหม่อีกครั้ง
          </button>
          <button onClick={onClose} className="btn btn-outline">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

### 4. Transaction History

#### Transaction List Component

```typescript
interface Transaction {
  id: string;
  amount: number;
  credits: number;
  status: "success" | "pending" | "failed";
  createdAt: string;
  packageTitle: string;
}

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => (
  <div className="space-y-4">
    {transactions.map((transaction) => (
      <div key={transaction.id} className="card card-mystical">
        <div className="card-body p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{transaction.packageTitle}</h4>
              <p className="text-sm text-neutral-content mb-2">
                {new Date(transaction.createdAt).toLocaleDateString("th-TH")}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-primary font-semibold">
                  +{transaction.credits} เครดิต
                </span>
                <span className="text-neutral-content">
                  ฿{transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className={`badge badge-sm ${
                  transaction.status === "success"
                    ? "badge-success"
                    : transaction.status === "pending"
                    ? "badge-warning"
                    : "badge-error"
                }`}
              >
                {transaction.status === "success"
                  ? "สำเร็จ"
                  : transaction.status === "pending"
                  ? "รอดำเนินการ"
                  : "ล้มเหลว"}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
```

---

## 🔧 Payment Integration Utilities

### 1. Stripe Configuration

```typescript
// Stripe configuration setup
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Stripe provider wrapper
const StripeProvider = ({ children }: { children: React.ReactNode }) => (
  <Elements stripe={stripePromise}>{children}</Elements>
);
```

### 2. Payment Hooks

```typescript
// Custom hooks for payment management
export const usePaymentIntent = (packageId: string) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  return { clientSecret, loading, error, createPaymentIntent };
};
```

### 3. Payment Status Tracking

```typescript
// Payment status tracking utility
export const usePaymentStatus = (paymentIntentId: string) => {
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (response.ok) {
          const { status: paymentStatus } = await response.json();
          setStatus(paymentStatus);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentIntentId) {
      checkStatus();
    }
  }, [paymentIntentId]);

  return { status, loading };
};
```

---

## 📱 Mobile Payment Experience

### 1. Mobile-Optimized Payment Form

```typescript
// Mobile-optimized payment form
const MobilePaymentForm = ({
  selectedPackage,
  onSubmit,
}: {
  selectedPackage: Package;
  onSubmit: (paymentMethod: any) => void;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      {/* Package Summary */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-content">แพ็คเกจ:</span>
          <span className="font-semibold">{selectedPackage.title}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-neutral-content">ราคา:</span>
          <span className="text-lg font-bold text-primary">
            ฿{selectedPackage.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">หมายเลขบัตรเครดิต</span>
          </label>
          <div className="input input-bordered">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn btn-primary w-full min-h-[48px]"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              กำลังประมวลผล...
            </>
          ) : (
            `ชำระเงิน ฿${selectedPackage.price.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
};
```

### 2. Touch-Friendly Payment Buttons

```typescript
// Touch-friendly payment buttons
const PaymentButton = ({
  amount,
  onClick,
  loading = false,
  disabled = false,
}: {
  amount: number;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      btn btn-primary w-full min-h-[56px] text-lg font-semibold
      ${loading ? "loading" : ""}
      ${disabled ? "btn-disabled" : ""}
      active:scale-95 transition-transform
    `}
  >
    {loading ? (
      <>
        <span className="loading loading-spinner loading-md" />
        กำลังประมวลผล...
      </>
    ) : (
      `ชำระเงิน ฿${amount.toLocaleString()}`
    )}
  </button>
);
```

---

## 🎯 Payment UI Best Practices

### 1. Security

- **PCI Compliance**: Use Stripe Elements for secure card input
- **HTTPS Only**: Ensure all payment flows use HTTPS
- **No Card Storage**: Never store card data on your servers
- **Webhook Verification**: Verify webhook signatures

### 2. User Experience

- **Clear Pricing**: Show exact amounts including fees
- **Progress Indicators**: Show payment processing status
- **Error Recovery**: Provide clear error messages and retry options
- **Confirmation**: Clear success confirmation with transaction details

### 3. Mobile Optimization

- **Touch Targets**: Minimum 44px touch targets
- **Keyboard Handling**: Proper keyboard handling for card input
- **Responsive Design**: Optimize for mobile screens
- **Loading States**: Clear loading states for mobile users

### 4. Thai Language Support

- **Localized Text**: All payment text in Thai
- **Currency Format**: Thai Baht formatting (฿)
- **Date Format**: Thai date formatting
- **Error Messages**: User-friendly Thai error messages

---

**Payment Focus**: Secure, user-friendly payment experience  
**Security Priority**: PCI compliance and secure payment processing  
**Mobile Priority**: Touch-friendly payment interface  
**Thai Support**: Complete Thai language localization
