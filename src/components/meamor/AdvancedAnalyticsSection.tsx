"use client";

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';

interface ActivityData {
  timeRange: string;
  summary: {
    totalReadings: number;
    totalPayments: number;
    totalRevenue: number;
    activeUsers: number;
  };
  dailyActivity: {
    readings: Record<string, number>;
    payments: Record<string, any>;
  };
  peakHours: Array<{
    hour: number;
    activity_count: number;
  }>;
  userBehavior: Array<{
    userId: string;
    userEmail: string;
    userName: string;
    readingCount: number;
    paymentCount: number;
    totalSpent: number;
    avgPaymentAmount: number;
    avgSessionInterval: number;
    lastActivity: number;
  }>;
  retentionMetrics: {
    total_users: number;
    avg_active_days: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
}

interface AdvancedAnalyticsSectionProps {
  className?: string;
}

export function AdvancedAnalyticsSection({ className = '' }: AdvancedAnalyticsSectionProps) {
  const [analyticsData, setAnalyticsData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        timeRange
      });

      const response = await fetch(`/api/admin/user-activity?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getActivityChart = () => {
    if (!analyticsData?.dailyActivity) return null;

    const dates = Object.keys(analyticsData.dailyActivity.readings).sort();
    const maxReadings = Math.max(...Object.values(analyticsData.dailyActivity.readings));
    const maxPayments = Math.max(
      ...Object.values(analyticsData.dailyActivity.payments).map((p: any) => p.count)
    );

    return dates.slice(-14).map(date => ({
      date,
      readings: analyticsData.dailyActivity.readings[date] || 0,
      payments: analyticsData.dailyActivity.payments[date]?.count || 0,
      readingHeight: ((analyticsData.dailyActivity.readings[date] || 0) / maxReadings) * 100,
      paymentHeight: ((analyticsData.dailyActivity.payments[date]?.count || 0) / maxPayments) * 100
    }));
  };

  const getPeakHoursChart = () => {
    if (!analyticsData?.peakHours) return [];
    
    const maxActivity = Math.max(...analyticsData.peakHours.map(h => Number(h.activity_count)));
    
    return Array.from({ length: 24 }, (_, hour) => {
      const data = analyticsData.peakHours.find(h => Number(h.hour) === hour);
      const count = data ? Number(data.activity_count) : 0;
      return {
        hour,
        count,
        height: maxActivity > 0 ? (count / maxActivity) * 100 : 0
      };
    });
  };

  const getRetentionRate = () => {
    if (!analyticsData?.retentionMetrics) return { weekly: 0, monthly: 0 };
    
    const total = analyticsData.retentionMetrics.total_users || 1;
    return {
      weekly: Math.round((analyticsData.retentionMetrics.weekly_active_users / total) * 100),
      monthly: Math.round((analyticsData.retentionMetrics.monthly_active_users / total) * 100)
    };
  };

  if (loading) {
    return (
      <Card variant="mystical" className={className}>
        <CardBody>
          <h3 className="heading-3 mb-4">Advanced Analytics</h3>
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="mystical" className={className}>
        <CardBody>
          <h3 className="heading-3 mb-4">Advanced Analytics</h3>
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  const activityChart = getActivityChart();
  const peakHoursChart = getPeakHoursChart();
  const retentionRates = getRetentionRate();

  return (
    <div className={className}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="heading-3">Advanced Analytics</h3>
        <div className="flex gap-2">
          {[
            { value: '1d', label: '24h' },
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' }
          ].map(option => (
            <button
              key={option.value}
              className={`btn btn-sm ${timeRange === option.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="mystical">
              <CardBody>
                <h4 className="heading-4 mb-2">Total Activity</h4>
                <div className="text-3xl font-bold text-primary">
                  {analyticsData.summary.totalReadings}
                </div>
                <div className="text-sm text-neutral-content">Readings Generated</div>
              </CardBody>
            </Card>

            <Card variant="mystical">
              <CardBody>
                <h4 className="heading-4 mb-2">Revenue</h4>
                <div className="text-3xl font-bold text-success">
                  {formatCurrency(analyticsData.summary.totalRevenue)}
                </div>
                <div className="text-sm text-neutral-content">
                  {analyticsData.summary.totalPayments} payments
                </div>
              </CardBody>
            </Card>

            <Card variant="mystical">
              <CardBody>
                <h4 className="heading-4 mb-2">Active Users</h4>
                <div className="text-3xl font-bold text-secondary">
                  {analyticsData.summary.activeUsers}
                </div>
                <div className="text-sm text-neutral-content">
                  {retentionRates.weekly}% weekly retention
                </div>
              </CardBody>
            </Card>

            <Card variant="mystical">
              <CardBody>
                <h4 className="heading-4 mb-2">Avg. Session</h4>
                <div className="text-3xl font-bold text-accent">
                  {analyticsData.userBehavior.length > 0 
                    ? Math.round(analyticsData.userBehavior.reduce((sum, user) => sum + user.avgSessionInterval, 0) / analyticsData.userBehavior.length * 10) / 10
                    : 0}h
                </div>
                <div className="text-sm text-neutral-content">Between activities</div>
              </CardBody>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card variant="mystical" className="mb-8">
            <CardBody>
              <h4 className="heading-4 mb-4">Daily Activity Trend</h4>
              {activityChart && (
                <div className="flex items-end justify-between h-40 gap-1">
                  {activityChart.map((day, index) => (
                    <div key={day.date} className="flex flex-col items-center flex-1">
                      <div className="flex items-end gap-1 h-32 mb-2">
                        <div
                          className="bg-primary/70 min-w-[4px] rounded-t transition-all tooltip"
                          style={{ height: `${day.readingHeight}%` }}
                          data-tip={`${day.readings} readings`}
                        ></div>
                        <div
                          className="bg-success/70 min-w-[4px] rounded-t transition-all tooltip"
                          style={{ height: `${day.paymentHeight}%` }}
                          data-tip={`${day.payments} payments`}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-content transform -rotate-45">
                        {formatDate(day.date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/70 rounded"></div>
                  <span className="text-sm">Readings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success/70 rounded"></div>
                  <span className="text-sm">Payments</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Peak Hours Chart */}
          <Card variant="mystical" className="mb-8">
            <CardBody>
              <h4 className="heading-4 mb-4">Peak Activity Hours</h4>
              <div className="flex items-end justify-between h-32 gap-1">
                {peakHoursChart.map((hour) => (
                  <div key={hour.hour} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-accent/70 min-w-[8px] rounded-t transition-all tooltip"
                      style={{ height: `${hour.height}%` }}
                      data-tip={`${hour.count} activities at ${hour.hour}:00`}
                    ></div>
                    <div className="text-xs text-neutral-content mt-1">
                      {hour.hour}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-neutral-content mt-2">
                Hours (24h format)
              </div>
            </CardBody>
          </Card>

          {/* User Behavior Analysis */}
          <Card variant="mystical" className="mb-8">
            <CardBody>
              <h4 className="heading-4 mb-4">Top User Behavior</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Active Users */}
                <div>
                  <h5 className="heading-5 mb-3">Most Active Users</h5>
                  <div className="space-y-2">
                    {analyticsData.userBehavior.slice(0, 5).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-base-200 rounded">
                        <div>
                          <div className="font-semibold text-sm">{user.userName || 'Unknown'}</div>
                          <div className="text-xs opacity-70">{user.userEmail}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">📖 {user.readingCount}</div>
                          <div className="text-xs opacity-70">
                            {formatCurrency(user.totalSpent)} spent
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Spenders */}
                <div>
                  <h5 className="heading-5 mb-3">Top Spenders</h5>
                  <div className="space-y-2">
                    {analyticsData.userBehavior
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between p-3 bg-base-200 rounded">
                          <div>
                            <div className="font-semibold text-sm">{user.userName || 'Unknown'}</div>
                            <div className="text-xs opacity-70">{user.userEmail}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-success">
                              {formatCurrency(user.totalSpent)}
                            </div>
                            <div className="text-xs opacity-70">
                              💳 {user.paymentCount} payments
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Retention Metrics */}
          <Card variant="mystical">
            <CardBody>
              <h4 className="heading-4 mb-4">User Retention Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analyticsData.retentionMetrics.total_users || 0}
                  </div>
                  <div className="text-sm text-neutral-content">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    {retentionRates.weekly}%
                  </div>
                  <div className="text-sm text-neutral-content">Weekly Retention</div>
                  <div className="text-xs opacity-70">
                    {analyticsData.retentionMetrics.weekly_active_users} users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {retentionRates.monthly}%
                  </div>
                  <div className="text-sm text-neutral-content">Monthly Retention</div>
                  <div className="text-xs opacity-70">
                    {analyticsData.retentionMetrics.monthly_active_users} users
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-sm text-neutral-content mb-2">
                  Average Active Days: {Math.round((analyticsData.retentionMetrics.avg_active_days || 0) * 10) / 10} days
                </div>
                <div className="progress w-full h-2">
                  <div 
                    className="progress-primary h-full rounded-full" 
                    style={{ width: `${Math.min(analyticsData.retentionMetrics.avg_active_days || 0, 30) / 30 * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}