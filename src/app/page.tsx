"use client";

import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Navbar } from "@/components/layout";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastContainer";

export default function HomePage() {
  const { isSignedIn, userId } = useAuth();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false);

  const handleReferralCode = useCallback(async (code: string) => {
    try {
      // Validate referral code
      const response = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store referral code for later processing
          localStorage.setItem('pendingReferral', code);
          setReferralCode(code);
          addToast({ type: 'success', title: '🎉 Referral code valid!', message: 'You\'ll receive bonus rewards when you sign up!' });
        } else {
          addToast({ type: 'error', title: '❌ Invalid referral code', message: 'Please check your referral link and try again.' });
        }
      } else {
        addToast({ type: 'error', title: '❌ Invalid referral code', message: 'Please check your referral link and try again.' });
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      addToast({ type: 'error', title: '❌ Error validating referral code', message: 'Please try again later.' });
    }
  }, [addToast]);

  const processReferral = useCallback(async (code: string, newUserId: string) => {
    try {
      const response = await fetch('/api/referrals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code, newUserId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addToast({ type: 'success', title: '🎁 Welcome!', message: 'You received referral bonus rewards!' });
          localStorage.removeItem('pendingReferral');
        } else {
          console.error('Referral processing failed:', data.error);
          localStorage.removeItem('pendingReferral');
        }
      } else {
        console.error('Referral processing failed');
        localStorage.removeItem('pendingReferral');
      }
    } catch (error) {
      console.error('Referral processing error:', error);
      localStorage.removeItem('pendingReferral');
    }
  }, [addToast]);

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && !referralCode) {
      handleReferralCode(refCode);
    }
  }, [searchParams, referralCode, handleReferralCode]);

  // Process referral after login
  useEffect(() => {
    if (isSignedIn && userId && !hasProcessedReferral) {
      const storedReferralCode = localStorage.getItem('pendingReferral');
      if (storedReferralCode) {
        processReferral(storedReferralCode, userId);
        setHasProcessedReferral(true);
      }
    }
  }, [isSignedIn, userId, hasProcessedReferral, processReferral]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Header */}
      <Navbar logoSize="xl" showText={false} />

      {/* Sign In Button for Non-Authenticated Users */}
      <SignedOut>
        <div className="fixed top-4 right-4 z-50">
          <SignInButton mode="modal">
            <button className="btn btn-primary">Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Hero Section */}
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

        {/* Features Section */}
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

      {/* Mobile Navigation */}
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
