"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardBody } from '@/components/ui/Card';
import { PaymentHistorySection } from './PaymentHistorySection';

interface UserStats {
  totalMembers: number;
  newMembersToday: number;
  newMembers7Days: number;
  newMembers30Days: number;
}

interface RevenueStats {
  today: number;
  thisMonth: number;
  thisYear: number;
}

interface PopularPackage {
  id: number;
  title: string;
  purchaseCount: number;
  revenue: number;
}

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [popularPackages, setPopularPackages] = useState<PopularPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all admin data in parallel
        const [userStatsRes, revenueStatsRes, packagesRes] = await Promise.all([
          fetch('/api/admin/user-stats'),
          fetch('/api/admin/revenue-stats'),
          fetch('/api/admin/popular-packages')
        ]);

        if (!userStatsRes.ok || !revenueStatsRes.ok || !packagesRes.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const [userStatsData, revenueStatsData, packagesData] = await Promise.all([
          userStatsRes.json(),
          revenueStatsRes.json(),
          packagesRes.json()
        ]);

        setUserStats(userStatsData.data);
        setRevenueStats(revenueStatsData.data);
        setPopularPackages(packagesData.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 ${className}`}>
        <div className="content-container pt-8">
          <div className="text-center mb-8">
            <h1 className="heading-1 mb-4">Admin Dashboard</h1>
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 ${className}`}>
        <div className="content-container pt-8">
          <div className="text-center">
            <h1 className="heading-1 mb-4">Admin Dashboard</h1>
            <div className="alert alert-error max-w-md mx-auto">
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 ${className}`}>
      <div className="content-container pt-8 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-2">MeaMor Admin Dashboard</h1>
          <p className="body-large text-neutral-content">
            System monitoring and user management
          </p>
          <div className="badge badge-primary mt-2">
            Welcome, {user?.firstName}
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">Total Members</h3>
              <div className="text-3xl font-bold text-primary">
                {userStats?.totalMembers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-neutral-content">Active users</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">Today</h3>
              <div className="text-3xl font-bold text-success">
                +{userStats?.newMembersToday || 0}
              </div>
              <div className="text-sm text-neutral-content">New members</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">Last 7 Days</h3>
              <div className="text-3xl font-bold text-secondary">
                +{userStats?.newMembers7Days || 0}
              </div>
              <div className="text-sm text-neutral-content">New members</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">Last 30 Days</h3>
              <div className="text-3xl font-bold text-accent">
                +{userStats?.newMembers30Days || 0}
              </div>
              <div className="text-sm text-neutral-content">New members</div>
            </CardBody>
          </Card>
        </div>

        {/* Revenue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">Today&apos;s Revenue</h3>
              <div className="text-3xl font-bold text-success">
                ฿{revenueStats?.today?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-neutral-content">Thai Baht</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">This Month</h3>
              <div className="text-3xl font-bold text-primary">
                ฿{revenueStats?.thisMonth?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-neutral-content">Thai Baht</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h3 className="heading-4 mb-2">This Year</h3>
              <div className="text-3xl font-bold text-secondary">
                ฿{revenueStats?.thisYear?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-neutral-content">Thai Baht</div>
            </CardBody>
          </Card>
        </div>

        {/* Popular Packages */}
        <Card variant="mystical" className="mb-8">
          <CardBody>
            <h3 className="heading-3 mb-2">Most Popular Packages</h3>
            <p className="text-neutral-content mb-4">Ranked by purchase volume</p>
            {popularPackages.length > 0 ? (
              <div className="space-y-4">
                {popularPackages.map((pkg, index) => (
                  <div key={pkg.id} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="badge badge-primary">#{index + 1}</div>
                      <div>
                        <h4 className="font-semibold">{pkg.title}</h4>
                        <p className="text-sm text-neutral-content">
                          {pkg.purchaseCount} purchases
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">
                        ฿{pkg.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-neutral-content">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-content">
                No package data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Enhanced Payment Management */}
        <PaymentHistorySection className="mb-8" />

        {/* Quick Actions */}
        <Card variant="mystical">
          <CardBody>
            <h3 className="heading-3 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn btn-primary">
                <span className="mr-2">👥</span>
                Manage Users
              </button>
              <button className="btn btn-secondary">
                <span className="mr-2">💳</span>
                Payment History
              </button>
              <button className="btn btn-accent">
                <span className="mr-2">📊</span>
                Analytics
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}