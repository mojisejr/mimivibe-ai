"use client";

import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Navbar } from "@/components/layout";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/ToastContainer";
import { motion } from "framer-motion";
import { PricingCards } from "@/components/landing/PricingCards";

// ===== OLD IMPLEMENTATION (COMMENTED OUT) =====
/*
export default function HomePage() {
  const { isSignedIn, userId } = useAuth();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false)
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);

  // Helper functions for user-specific referral storage
  const getPendingReferralForUser = useCallback((currentUserId: string) => {
    // Find the most recent valid pending referral
    const pendingReferralKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('pendingReferral_')
    );
    
    let mostRecentReferral = null;
    let mostRecentTimestamp = 0;
    
    for (const key of pendingReferralKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if referral is valid and not expired (24 hours)
          if (parsed.timestamp > mostRecentTimestamp && 
              Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000 &&
              parsed.referrerUserId !== currentUserId) {
            mostRecentReferral = parsed;
            mostRecentTimestamp = parsed.timestamp;
          }
        }
      } catch {
        // Remove invalid entries
        localStorage.removeItem(key);
      }
    }
    
    return mostRecentReferral;
  }, []);
  
  const clearPendingReferrals = useCallback(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pendingReferral_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);
  
  const getLegacyPendingReferral = useCallback(() => {
    // Check for old format referral and migrate if needed
    const legacyReferral = localStorage.getItem('pendingReferral');
    if (legacyReferral && typeof legacyReferral === 'string' && !legacyReferral.startsWith('{')) {
      // Old format: just the code string
      localStorage.removeItem('pendingReferral');
      return legacyReferral;
    }
    return null;
  }, []);

  const handleReferralCode = useCallback(
    async (code: string) => {
      try {
        // Validate referral code
        const response = await fetch("/api/referrals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: code }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Store referral code for later processing
            if (typeof window !== 'undefined') {
              localStorage.setItem("pendingReferral", code);
            }
            setReferralCode(code);
            addToast({
              type: "success",
              title: "🎉 Referral code valid!",
              message: "You'll receive bonus rewards when you sign up!",
            });
          } else {
            addToast({
              type: "error",
              title: "❌ Invalid referral code",
              message: "Please check your referral link and try again.",
            });
          }
        } else {
          addToast({
            type: "error",
            title: "❌ Invalid referral code",
            message: "Please check your referral link and try again.",
          });
        }
      } catch (error) {
        console.error("Referral validation error:", error);
        addToast({
          type: "error",
          title: "❌ Error validating referral code",
          message: "Please try again later.",
        });
      }
    },
    [addToast]
  );

  const processReferral = useCallback(
    async (code: string, newUserId: string, retryCount: number = 0) => {
      const MAX_RETRIES = 5; // Increased from 3 to 5 retries
      const RETRY_DELAYS = [5000, 10000, 20000, 30000, 45000]; // 5s, 10s, 20s, 30s, 45s - account for slow webhook

      try {
        const response = await fetch("/api/referrals/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: code, newUserId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          addToast({
            type: "success",
            title: "🎁 Welcome!",
            message: "You received referral bonus rewards!",
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem("pendingReferral");
          }
          return;
        }

        // Handle specific retry cases (202 status with sync pending)
        if (response.status === 202 && (data.code === 'USER_SYNC_PENDING' || data.code === 'DATABASE_SYNC_ERROR')) {
          if (retryCount < MAX_RETRIES) {
            const delay = data.retryAfter ? data.retryAfter * 1000 : RETRY_DELAYS[retryCount];
            const delayInSeconds = Math.round(delay / 1000);
            console.log(`User sync pending, retrying in ${delayInSeconds}s (attempt ${retryCount + 1}/${MAX_RETRIES}). User ID: ${newUserId}`);

            // More detailed user feedback based on retry attempt
            let message = '';
            if (retryCount === 0) {
              message = `Setting up your account... (${delayInSeconds}s)`;
            } else if (retryCount < 3) {
              message = `Still processing your account setup... (${delayInSeconds}s)`;
            } else {
              message = `Almost ready! Final account verification... (${delayInSeconds}s)`;
            }

            addToast({
              type: "info",
              title: "⏳ Account Setup in Progress",
              message: `${message} (${retryCount + 1}/${MAX_RETRIES})`,
            });

            setTimeout(() => {
              processReferral(code, newUserId, retryCount + 1);
            }, delay);
            return;
          } else {
            // Max retries reached - store for later processing
            console.error(`Max retries (${MAX_RETRIES}) reached for user ${newUserId}. Storing for later processing.`);

            // Store pending referral for later processing
            if (typeof window !== 'undefined') {
              const pendingReferral = {
                code,
                newUserId,
                timestamp: Date.now(),
                attempts: MAX_RETRIES
              };
              localStorage.setItem('delayedReferral', JSON.stringify(pendingReferral));
            }

            addToast({
              type: "warning",
              title: "⏰ Setup Taking Longer Than Expected",
              message: "Don't worry! Your referral bonus is saved and will be processed automatically. You can continue using the app.",
            });
          }
        } else if (!response.ok) {
          console.error("Referral processing failed:", data.error || response.statusText);
          addToast({
            type: "error",
            title: "❌ Referral Failed",
            message: data.error || "Failed to process referral bonus",
          });
        }

        // Clean up pending referral for non-retry cases
        if (response.status !== 202) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem("pendingReferral");
          }
        }
      } catch (error) {
        console.error("Error processing referral:", error);

        // Retry on network errors with increased delays
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          const delayInSeconds = Math.round(delay / 1000);
          console.log(`Network error, retrying in ${delayInSeconds}s (attempt ${retryCount + 1}/${MAX_RETRIES}). User: ${newUserId}`);

          addToast({
            type: "info",
            title: "🔄 Connection Issue",
            message: `Retrying in ${delayInSeconds}s (${retryCount + 1}/${MAX_RETRIES})...`,
          });

          setTimeout(() => {
            processReferral(code, newUserId, retryCount + 1);
          }, delay);
        } else {
          console.error(`All retry attempts failed for user ${newUserId}. Storing for later processing.`);

          // Store for later processing even on network errors
          if (typeof window !== 'undefined') {
            const pendingReferral = {
              code,
              newUserId,
              timestamp: Date.now(),
              error: 'network_error',
              attempts: MAX_RETRIES
            };
            localStorage.setItem('delayedReferral', JSON.stringify(pendingReferral));
          }

          addToast({
            type: "warning",
            title: "⚠️ Connection Issues",
            message: "Your referral is saved and will be processed when connection improves.",
          });
        }
      }
    },
    [addToast]
  );

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode && !referralCode) {
      handleReferralCode(refCode);
    }
  }, [searchParams, referralCode, handleReferralCode]);

  // Process referral after login with Clerk authentication delay handling
  useEffect(() => {
    if (isSignedIn && userId && !hasProcessedReferral) {
      const storedReferralCode = localStorage.getItem("pendingReferral");
      if (storedReferralCode) {
        console.log(`🎯 Referral processing triggered for user ${userId} with code: ${storedReferralCode}`);
        console.log(`⏰ Clerk auth state - isSignedIn: ${isSignedIn}, hasUserId: ${!!userId}`);

        // Add small delay to ensure Clerk authentication context is fully propagated
        // This helps prevent the credits API from returning 404 due to auth timing issues
        setTimeout(() => {
          console.log(`🚀 Starting referral processing after auth stabilization delay`);
          processReferral(storedReferralCode, userId);
        }, 1500); // 1.5 second delay for Clerk auth context to stabilize

        setHasProcessedReferral(true);
      } else {
        console.log(`ℹ️ No pending referral found for user ${userId}`);
      }
    } else {
      console.log(`⏳ Referral processing conditions not met:`, {
        isSignedIn,
        hasUserId: !!userId,
        hasProcessedReferral,
        timestamp: new Date().toISOString()
      });
    }
  }, [isSignedIn, userId, hasProcessedReferral, processReferral]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <Navbar logoSize="xl" showText={false} />

      <SignedOut>
        <div className="fixed top-4 right-4 z-50">
          <SignInButton mode="modal">
            <button className="btn btn-primary">Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      <main className="content-container">
        <div className="hero min-h-[80vh]">
          <div className="hero-content text-center">
            <div className="max-w-lg">
              <h1 className="heading-1 mb-6">
                Discover Your Path with{" "}
                <span className="text-primary">AI Tarot</span>
              </h1>
              <p className="body-large mb-8 text-neutral-content">
                Unlock mystical insights and guidance through the power of
                AI-enhanced tarot readings. Connect with your inner wisdom and
                explore what the cards reveal about your journey.
              </p>

              <SignedIn>
                <Link href="/ask" className="btn btn-mystical btn-lg">
                  Start Reading
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn btn-mystical btn-lg">
                    Begin Your Journey
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>

        <section className="py-16">
          <h2 className="heading-2 text-center mb-12">Why Choose MiMiVibes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">
                  AI-Powered Insights
                </h3>
                <p className="body-normal">
                  Our advanced AI interprets traditional tarot wisdom with
                  modern understanding
                </p>
              </div>
            </div>

            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">
                  Personalized Readings
                </h3>
                <p className="body-normal">
                  Each reading is tailored to your unique situation and
                  spiritual journey
                </p>
              </div>
            </div>

            <div className="card card-mystical">
              <div className="card-body text-center">
                <h3 className="heading-3 text-primary mb-4">24/7 Guidance</h3>
                <p className="body-normal">
                  Access mystical wisdom whenever you need clarity and direction
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SignedIn>
        <div className="btm-nav mobile-only">
          <Link href="/ask" className="btm-nav-item">
            <span className="text-xs">Ask</span>
          </Link>
          <Link href="/history" className="btm-nav-item">
            <span className="text-xs">History</span>
          </Link>
          <Link href="/profile" className="btm-nav-item">
            <span className="text-xs">Profile</span>
          </Link>
          <Link href="/packages" className="btm-nav-item">
            <span className="text-xs">Credits</span>
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
*/

// ===== NEW LANDING PAGE IMPLEMENTATION =====
export default function HomePage() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false);
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Helper functions for user-specific referral storage
  const getPendingReferralForUser = useCallback((currentUserId: string) => {
    // Find the most recent valid pending referral
    const pendingReferralKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("pendingReferral_")
    );

    let mostRecentReferral = null;
    let mostRecentTimestamp = 0;

    for (const key of pendingReferralKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if referral is valid and not expired (24 hours)
          if (
            parsed.timestamp > mostRecentTimestamp &&
            Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000 &&
            parsed.referrerUserId !== currentUserId
          ) {
            mostRecentReferral = parsed;
            mostRecentTimestamp = parsed.timestamp;
          }
        }
      } catch {
        // Remove invalid entries
        localStorage.removeItem(key);
      }
    }

    return mostRecentReferral;
  }, []);

  const clearPendingReferrals = useCallback(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("pendingReferral_")) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const getLegacyPendingReferral = useCallback(() => {
    // Check for old format referral and migrate if needed
    const legacyReferral = localStorage.getItem("pendingReferral");
    if (
      legacyReferral &&
      typeof legacyReferral === "string" &&
      !legacyReferral.startsWith("{")
    ) {
      // Old format: just the code string
      localStorage.removeItem("pendingReferral");
      return legacyReferral;
    }
    return null;
  }, []);

  // Process referral with ownership validation
  const processReferral = useCallback(
    async (code: string, newUserId: string) => {
      // Prevent multiple simultaneous processing
      if (isProcessingReferral) {
        console.log("🔄 Referral processing already in progress, skipping...");
        return;
      }

      // Check if this referral was already processed recently
      const processedKey = `processed_referral_${code}_${newUserId}`;
      const lastProcessed = localStorage.getItem(processedKey);
      if (lastProcessed) {
        const timeSinceProcessed = Date.now() - parseInt(lastProcessed);
        if (timeSinceProcessed < 60000) {
          // 1 minute cooldown
          console.log("🔄 Referral was processed recently, skipping...");
          return;
        }
      }

      // Validate referral ownership before processing
      const pendingReferralData = getPendingReferralForUser(newUserId);
      if (!pendingReferralData) {
        console.log("❌ No valid pending referral found for user");
        return;
      }

      // Additional ownership validation: prevent users from processing their own referral codes
      if (pendingReferralData.referrerUserId === newUserId) {
        console.log(
          "❌ User attempting to use their own referral code, clearing invalid referral"
        );
        clearPendingReferrals();
        addToast({
          type: "error",
          title: "Invalid referral",
          message: "You cannot use your own referral code.",
        });
        return;
      }

      setIsProcessingReferral(true);
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      const attemptProcess = async (): Promise<void> => {
        try {
          console.log(
            `🔄 Processing referral attempt ${retryCount + 1}/${maxRetries}`,
            {
              code,
              userId: newUserId,
              timestamp: new Date().toISOString(),
            }
          );

          const response = await fetch("/api/referrals/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referralCode: code,
              newUserId: newUserId,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            console.log("✅ Referral processed successfully:", data);

            addToast({
              type: "success",
              title: "🎁 Welcome!",
              message: "You received referral bonus rewards!",
            });

            // Mark as processed and clear stored referral code
            localStorage.setItem(processedKey, Date.now().toString());
            clearPendingReferrals();
            setReferralCode(null);
            setHasProcessedReferral(true);
            return;
          }

          // Handle specific error cases
          if (response.status === 409) {
            console.log(
              "ℹ️ Referral already processed or user already referred"
            );
            addToast({
              type: "info",
              title: "Already processed",
              message: "This referral code has already been used.",
            });
            localStorage.setItem(processedKey, Date.now().toString());
            clearPendingReferrals();
            setReferralCode(null);
            setHasProcessedReferral(true);
            return;
          }

          if (response.status === 404) {
            console.log("❌ Invalid referral code");
            addToast({
              type: "error",
              title: "Invalid referral code",
              message: "The referral code is not valid.",
            });
            clearPendingReferrals();
            setReferralCode(null);
            return;
          }

          // For other errors, attempt retry
          throw new Error(
            `API Error: ${response.status} - ${data.error || "Unknown error"}`
          );
        } catch (error) {
          console.error(
            `❌ Referral processing attempt ${retryCount + 1} failed:`,
            error
          );

          retryCount++;

          if (retryCount < maxRetries) {
            console.log(
              `🔄 Retrying in ${retryDelay}ms... (${retryCount}/${maxRetries})`
            );

            addToast({
              type: "info",
              title: "Retrying...",
              message: `Attempting to process referral (${retryCount}/${maxRetries})`,
            });

            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return attemptProcess();
          } else {
            console.error("🚨 Max retries reached, giving up");

            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes("fetch")) {
              addToast({
                type: "error",
                title: "Connection Error",
                message:
                  "Unable to connect. Please check your internet connection.",
              });
            } else {
              addToast({
                type: "error",
                title: "Processing Error",
                message:
                  "Failed to process referral code. Please try again later.",
              });
            }

            // Don't clear referral code on final failure, allow manual retry
          }
        } finally {
          setIsProcessingReferral(false);
        }
      };

      await attemptProcess();
    },
    [
      addToast,
      isProcessingReferral,
      getPendingReferralForUser,
      clearPendingReferrals,
    ]
  );

  // Keep referral functionality with user-specific storage
  const handleReferralCode = useCallback(
    async (code: string) => {
      try {
        const response = await fetch("/api/referrals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: code }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Store referral with session-specific key to prevent cross-user contamination
            const sessionId =
              Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const pendingReferralKey = `pendingReferral_${sessionId}`;

            localStorage.setItem(
              pendingReferralKey,
              JSON.stringify({
                code,
                sessionId,
                timestamp: Date.now(),
                referrerUserId: data.data?.referrerUserId || null,
              })
            );

            // Clean up old pending referrals to prevent storage bloat
            Object.keys(localStorage).forEach((key) => {
              if (
                key.startsWith("pendingReferral_") &&
                key !== pendingReferralKey
              ) {
                const stored = localStorage.getItem(key);
                if (stored) {
                  try {
                    const parsed = JSON.parse(stored);
                    // Remove referrals older than 24 hours
                    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                      localStorage.removeItem(key);
                    }
                  } catch {
                    localStorage.removeItem(key);
                  }
                }
              }
            });

            setReferralCode(code);
            addToast({
              type: "success",
              title: "🎉 Referral code valid!",
              message: "You'll receive bonus rewards when you sign up!",
            });
          } else {
            addToast({
              type: "error",
              title: "❌ Invalid referral code",
              message: "Please check your referral link and try again.",
            });
          }
        } else {
          addToast({
            type: "error",
            title: "❌ Invalid referral code",
            message: "Please check your referral link and try again.",
          });
        }
      } catch (error) {
        console.error("Referral validation error:", error);
        addToast({
          type: "error",
          title: "❌ Error validating referral code",
          message: "Please try again later.",
        });
      }
    },
    [addToast]
  );

  // Handle referral code from URL and process after login
  useEffect(() => {
    const refCode = searchParams.get("ref");

    // Handle referral code from URL
    if (refCode && !referralCode) {
      handleReferralCode(refCode);
    }

    // Process referral after login with delay to prevent double calls
    if (isSignedIn && userId && !hasProcessedReferral) {
      // Check for legacy referral format first
      const legacyReferral = getLegacyPendingReferral();
      if (legacyReferral) {
        console.log("🔄 Found legacy referral, migrating to new format");
        // Process legacy referral immediately to maintain backward compatibility
        const timer = setTimeout(() => {
          processReferral(legacyReferral, userId);
          setHasProcessedReferral(true);
        }, 1500);
        return () => clearTimeout(timer);
      }

      // Check for new format referrals
      const pendingReferralData = getPendingReferralForUser(userId);
      if (pendingReferralData) {
        // Add delay to ensure Clerk context is stable and prevent race conditions
        const timer = setTimeout(() => {
          processReferral(pendingReferralData.code, userId);
          setHasProcessedReferral(true);
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [
    searchParams,
    referralCode,
    handleReferralCode,
    isSignedIn,
    userId,
    hasProcessedReferral,
    processReferral,
    getLegacyPendingReferral,
    getPendingReferralForUser,
  ]);

  // Auto-redirect logged-in users to /ask page
  useEffect(() => {
    // Only redirect if:
    // 1. User is signed in
    // 2. We're on the root path ("/")
    // 3. We haven't already redirected (prevent infinite loops)
    // 4. We're not in server-side rendering
    if (
      isSignedIn &&
      pathname === "/" &&
      !hasRedirected &&
      typeof window !== "undefined"
    ) {
      setHasRedirected(true);
      router.push("/ask");
    }
  }, [isSignedIn, pathname, hasRedirected, router]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardHover = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 overflow-x-hidden">
      {/* Header */}
      <Navbar logoSize="xl" showText={false} />

      {/* Sign In Button for Non-Authenticated Users */}
      <SignedOut>
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <SignInButton mode="modal">
            <button className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300">
              เข้าสู่ระบบ
            </button>
          </SignInButton>
        </motion.div>
      </SignedOut>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 xl:pt-6">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-relaxed"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="text-base-content">เปิดเผยอนาคตของคุณด้วย</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AI ไพ่ทาโรต์
            </span>
            <br />
            <span className="text-base-content">แห่งแรกของไทย! ✨</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-neutral-content mb-8 max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            เชื่อมต่อกับปัญญาภายในของคุณผ่านพลังของ AI ที่เข้าใจจิตวิญญาณ
            ค้นพบคำแนะนำที่แม่นยำและเป็นส่วนตัวสำหรับการเดินทางของคุณ
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            className="sm:flex flex-wrap justify-center items-center gap-4 mb-8 hidden"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <div className="badge badge-primary gap-2 text-sm">
              <span>🔮</span>
              <span>แม่นยำ 95%</span>
            </div>
            <div className="badge badge-secondary gap-2 text-sm">
              <span>⚡</span>
              <span>ตอบทันที</span>
            </div>
            <div className="badge badge-accent gap-2 text-sm">
              <span>🛡️</span>
              <span>ปลอดภัย 100%</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <SignedIn>
              <Link href="/ask">
                <motion.button
                  className="btn btn-lg bg-gradient-to-r from-primary via-primary-focus to-secondary text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 px-8 py-4 text-xl font-bold min-w-[280px] relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-focus to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-2xl">🔮</span>
                    <span className="font-bold">ให้แม่หมอทำนาย</span>
                  </span>
                </motion.button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  className="btn btn-lg bg-gradient-to-r from-primary via-primary-focus to-secondary text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 px-8 py-4 text-xl font-bold min-w-[280px] relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-focus to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span className="font-bold">เริ่มต้นการเดินทาง</span>
                  </span>
                </motion.button>
              </SignInButton>
            </SignedOut>

            {/* <motion.button
              className="btn btn-outline btn-lg border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg mr-2">▶️</span>
              <span>ดูตัวอย่าง</span>
            </motion.button> */}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-base-content">
              ทำไมต้องเลือก <span className="text-primary">MiMiVIBE</span>? 🤔
            </h2>
            <p className="text-lg text-neutral-content max-w-2xl mx-auto">
              เราใช้เทคโนโลยี AI ล้ำสมัยผสมผสานกับภูมิปัญญาโบราณ
              เพื่อมอบประสบการณ์การดูดวงที่แม่นยำและเป็นส่วนตัว
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Feature 1: AI-Powered */}
            <motion.div className="group" variants={cardHover}>
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <div className="card-body text-center p-8">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl">🤖</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-4">
                    AI ทรงปัญญา
                  </h3>
                  <p className="text-base-content leading-relaxed">
                    AI ที่เรียนรู้จากข้อมูลไพ่ทาโรต์มากกว่า 10,000 การทำนาย
                    ให้คำแนะนำที่แม่นยำและเข้าใจบริบทของคุณ
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Personalized */}
            <motion.div className="group" variants={cardHover}>
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border-2 border-secondary/20 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <div className="card-body text-center p-8">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl">💫</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-secondary mb-4">
                    เป็นส่วนตัว 100%
                  </h3>
                  <p className="text-base-content leading-relaxed">
                    แต่ละการทำนายถูกปรับแต่งให้เหมาะกับสถานการณ์และ
                    การเดินทางทางจิตวิญญาณของคุณโดยเฉพาะ
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: 24/7 */}
            <motion.div className="group" variants={cardHover}>
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <div className="card-body text-center p-8">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl">🌙</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-accent mb-4">
                    พร้อมให้คำแนะนำ 24/7
                  </h3>
                  <p className="text-base-content leading-relaxed">
                    เข้าถึงภูมิปัญญามิสติคได้ทุกเมื่อที่คุณต้องการความชัดเจน
                    และทิศทางในชีวิต
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-base-200 to-base-300">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-base-content">
              วิธีการใช้งาน <span className="text-primary">ง่ายนิดเดียว</span>{" "}
              ✨
            </h2>
            <p className="text-lg text-neutral-content max-w-2xl mx-auto">
              เพียง 3 ขั้นตอนง่ายๆ คุณก็จะได้คำแนะนำที่แม่นยำจากแม่หมอมีมี่
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Step 1 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-sm">💭</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">ถามคำถาม</h3>
              <p className="text-base-content">
                บอกแม่หมอมีมี่ว่าคุณอยากรู้อะไร เกี่ยวกับความรัก การงาน
                หรือการตัดสินใจสำคัญในชีวิต
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm">🔮</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">
                หยิบไพ่ขึ้นมา
              </h3>
              <p className="text-base-content">
                AI จะหยิบไพ่ทาโรต์จากพลังของจักวาล
                และวิเคราะห์ความหมายอย่างลึกซึ้ง
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-sm">✨</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-accent mb-4">รับคำทำนาย</h3>
              <p className="text-base-content">
                รับคำทำนายที่แม่นยำ พร้อมคำแนะนำที่เป็นประโยชน์
                และข้อความให้กำลังใจจากแม่หมอมีมี่
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-base-content">
              แพ็กเกจที่ <span className="text-primary">คุ้มค่า</span> 💎
            </h2>
            <p className="text-lg text-neutral-content max-w-2xl mx-auto">
              เลือกแพ็กเกจที่เหมาะกับคุณ
            </p>
          </motion.div>

          <PricingCards />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-base-content">
              พร้อมที่จะ <span className="text-primary">เปิดเผยอนาคต</span>{" "}
              แล้วหรือยัง? 🚀
            </h2>
            <p className="text-lg text-neutral-content mb-8 max-w-2xl mx-auto">
              เข้าร่วมกับผู้ใช้มากกว่า 10,000
              คนที่ได้ค้นพบคำตอบที่พวกเขากำลังมองหา
              เริ่มต้นการเดินทางทางจิตวิญญาณของคุณวันนี้
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SignedIn>
                <Link href="/ask">
                  <motion.button
                    className="btn btn-lg bg-gradient-to-r from-accent to-accent-focus text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl mr-2">🔮</span>
                    <span className="text-lg font-semibold">เริ่มทำนายเลย</span>
                  </motion.button>
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <motion.button
                    className="btn btn-lg bg-gradient-to-r from-accent to-accent-focus text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl mr-2">🎯</span>
                    <span className="text-lg font-semibold">เริ่มต้นฟรี</span>
                  </motion.button>
                </SignInButton>
              </SignedOut>

              <motion.button
                className="btn btn-outline btn-lg border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg mr-2">📞</span>
                <span>ติดต่อเรา</span>
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-sm text-neutral-content">
                <span>🔒</span>
                <span>ปลอดภัย 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-content">
                <span>⚡</span>
                <span>ตอบทันที</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-content">
                <span>💎</span>
                <span>คุณภาพสูง</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Navigation */}
      {/* <SignedIn>
        <div className="btm-nav mobile-only">
          <Link href="/ask" className="btm-nav-item">
            <span className="text-xs">Ask</span>
          </Link>
          <Link href="/history" className="btm-nav-item">
            <span className="text-xs">History</span>
          </Link>
          <Link href="/profile" className="btm-nav-item">
            <span className="text-xs">Profile</span>
          </Link>
          <Link href="/packages" className="btm-nav-item">
            <span className="text-xs">Credits</span>
          </Link>
        </div>
      </SignedIn> */}
    </div>
  );
}
