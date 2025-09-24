"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Logo, ProfileLoadingState, ErrorState, UnifiedCreditBadge } from "@/components/ui";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";
import { ReferralSection } from "@/components/referral/ReferralSection";
import { SkeletonProfile } from "@/components/common/SkeletonLoader";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { data, loading, error, refresh } = useProfile();
  const { t } = useTranslation();

  // Authentication state check for profile page

  // Don't render until auth is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 mb-4">{t('common.profile.authRequired')}</h1>
          <p className="body-normal text-neutral-content mb-4">
            {t('common.profile.signInToView')}
          </p>
          <Link href="/sign-in" className="btn btn-primary">
            {t('common.buttons.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Header */}
      <UnifiedNavbar />

      {/* Main Content */}
      <main className="content-container flex-1 pb-20 md:pb-6 pt-20">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">{t('pages.profile.title')}</h1>
          <p className="body-large text-neutral-content">
            {t('pages.profile.meta.description')}
          </p>
        </div>

        {loading ? (
          <SkeletonProfile />
        ) : error ? (
          <ErrorState
            title={t('common.status.error')}
            message={error}
            onRetry={refresh}
            retryText={t('common.buttons.retry')}
          />
        ) : data ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* User Info Card */}
            <div className="card card-mystical">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="heading-3">{t('common.profile.accountInfo')}</h2>
                  <Logo size="sm" showText={false} />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="avatar">
                    <div className="w-16 rounded-full">
                      <Image
                        src={user?.imageUrl || "/api/placeholder/64/64"}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-neutral-content">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-neutral-content">
                      {t('common.profile.memberSince')}{" "}
                      {safeFormatDistanceToNow(
                        data.profile?.createdAt,
                        "ไม่ทราบวันที่"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Card */}
            <div className="card card-mystical">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="heading-3">{t('common.profile.readingCredits')}</h2>
                  <div className="badge badge-primary">
                    รวม: {data.credits.totalCredits}
                  </div>
                </div>
                <div className="text-center mb-4">
                  <UnifiedCreditBadge
                    stars={data.credits.stars}
                    freePoints={data.credits.freePoint}
                    variant="profile"
                    showTooltip={true}
                  />
                  <div className="body-small text-neutral-content mt-2">
                    เครดิตของคุณ
                  </div>
                </div>

                {/* Usage Info */}
                <div className="text-xs text-neutral-content mb-4">
                  <p>
                    {t('common.profile.todayUsage', { used: data.credits.dailyUsed, limit: data.credits.dailyLimit })}
                  </p>
                  <p>
                    {t('common.profile.monthlyUsage', { used: data.credits.monthlyUsed, limit: data.credits.monthlyLimit })}
                  </p>
                </div>

                <div className="card-actions justify-end">
                  <Link href="/packages" className="btn btn-primary">
                    <span className="mr-2">💳</span>
                    {t('common.profile.buyMoreCredits')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Dashboard - Removed during refactor */}
            {/* Prestige System - Removed during refactor */}
            {/* Achievement Progress - Removed during refactor */}

            {/* Admin Access Section */}
            {(() => {
              // Check if user has admin role
              const publicMetadata = user?.publicMetadata as { role?: 'admin' | 'user' };
              const isAdmin = publicMetadata?.role === 'admin';
              
              if (isAdmin) {
                return (
                  <div className="card card-mystical">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="heading-3">{t('common.profile.adminAccess')}</h2>
                        <div className="badge badge-secondary">{t('common.profile.adminRole')}</div>
                      </div>
                      <p className="body-normal text-neutral-content mb-4">
                        {t('common.profile.adminDescription')}
                      </p>
                      <div className="card-actions justify-end">
                        <Link href="/meamor" className="btn btn-secondary">
                          <span className="mr-2">⚙️</span>
                          {t('common.profile.openAdminDashboard')}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Referral Section */}
            <ReferralSection />

            {/* Preferences Card */}
            {/* <div className="card card-mystical">
              <div className="card-body">
                <h2 className="heading-3 mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center">
                        <span className="mr-2">📧</span>
                        Email notifications
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center">
                        <span className="mr-2">🔔</span>
                        Daily reading reminders
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text flex items-center">
                        <span className="mr-2">🌙</span>
                        Dark mode
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        ) : null}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
