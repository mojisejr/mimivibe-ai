"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/meamor/AdminDashboard';
import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { AdminMetadata } from '@/lib/clerk-admin';

export default function MeamorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // User not authenticated, redirect to sign-in
        router.push('/sign-in');
        return;
      }

      // Check if user has admin role
      const publicMetadata = user.publicMetadata as { role?: 'admin' | 'user' };
      const adminStatus = publicMetadata?.role === 'admin';
      
      setIsAdmin(adminStatus);
      setLoading(false);

      // If not admin, redirect to profile
      if (!adminStatus) {
        router.push('/profile');
        return;
      }
    }
  }, [user, isLoaded, router]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="body-large text-neutral-content">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 mb-4">Authentication Required</h1>
          <p className="body-normal text-neutral-content mb-4">
            Please sign in to access the admin dashboard
          </p>
          <button 
            onClick={() => router.push('/sign-in')} 
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 mb-4">Access Denied</h1>
          <p className="body-normal text-neutral-content mb-4">
            Admin privileges required to access this dashboard
          </p>
          <button 
            onClick={() => router.push('/profile')} 
            className="btn btn-primary"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // Admin user - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Header */}
      <UnifiedNavbar />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <AdminDashboard />
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}