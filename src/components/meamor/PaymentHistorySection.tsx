"use client";

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';

interface PaymentRecord {
  id: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  creditsAdded: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
  };
  pack: {
    id: number;
    title: string;
    price: number;
    creditAmount: number;
  };
}

interface PaymentData {
  payments: PaymentRecord[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface PaymentAnalytics {
  overview: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalRevenue: number;
    averagePaymentAmount: number;
    overallSuccessRate: number;
  };
  timeBasedMetrics: {
    today: {
      totalPayments: number;
      successfulPayments: number;
      successRate: number;
    };
    last7Days: {
      totalPayments: number;
      successfulPayments: number;
      successRate: number;
    };
    last30Days: {
      totalPayments: number;
      successfulPayments: number;
      successRate: number;
    };
  };
}

interface PaymentHistorySectionProps {
  className?: string;
}

export function PaymentHistorySection({ className = '' }: PaymentHistorySectionProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const [paymentsRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/payment-tracking?${params}`),
        fetch('/api/admin/payment-analytics')
      ]);

      if (!paymentsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch payment data');
      }

      const [paymentsData, analyticsData] = await Promise.all([
        paymentsRes.json(),
        analyticsRes.json()
      ]);

      setPaymentData(paymentsData.data);
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value)) // Reset to page 1 when changing filters
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const formatCurrency = (amount: number) => {
    // Ensure consistent Thai Baht formatting with no decimals for whole numbers
    return `฿${amount.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card variant="mystical" className={className}>
        <CardBody>
          <h3 className="heading-3 mb-4">Payment Management</h3>
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
          <h3 className="heading-3 mb-4">Payment Management</h3>
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Payment Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="mystical">
            <CardBody>
              <h4 className="heading-4 mb-2">Total Revenue</h4>
              <div className="text-3xl font-bold text-success">
                {formatCurrency(analytics.overview.totalRevenue)}
              </div>
              <div className="text-sm text-neutral-content">
                {analytics.overview.totalPayments} payments
              </div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h4 className="heading-4 mb-2">Success Rate</h4>
              <div className="text-3xl font-bold text-primary">
                {analytics.overview.overallSuccessRate}%
              </div>
              <div className="text-sm text-neutral-content">
                {analytics.overview.successfulPayments} successful
              </div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h4 className="heading-4 mb-2">Average Amount</h4>
              <div className="text-3xl font-bold text-secondary">
                {formatCurrency(analytics.overview.averagePaymentAmount)}
              </div>
              <div className="text-sm text-neutral-content">Per transaction</div>
            </CardBody>
          </Card>

          <Card variant="mystical">
            <CardBody>
              <h4 className="heading-4 mb-2">Failed Payments</h4>
              <div className="text-3xl font-bold text-error">
                {analytics.overview.failedPayments}
              </div>
              <div className="text-sm text-neutral-content">Need attention</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Payment History Table */}
      <Card variant="mystical">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="heading-3 mb-4 md:mb-0">Payment History</h3>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search users or payment ID..."
                className="input input-bordered w-full md:w-64"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              
              <select
                className="select select-bordered w-full md:w-40"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {paymentData && paymentData.payments.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment ID</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentData.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                {payment.user.imageUrl ? (
                                  <img src={payment.user.imageUrl} alt={payment.user.name} />
                                ) : (
                                  <div className="bg-neutral-focus w-full h-full flex items-center justify-center">
                                    <span className="text-xs">{payment.user.name?.charAt(0) || 'U'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{payment.user.name || 'Unknown'}</div>
                              <div className="text-sm opacity-50">{payment.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="font-semibold">{payment.pack.title}</div>
                            <div className="text-sm opacity-50">{payment.pack.creditAmount} credits</div>
                          </div>
                        </td>
                        <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                        <td>
                          <div className={`badge ${getStatusBadgeColor(payment.status)}`}>
                            {payment.status}
                          </div>
                        </td>
                        <td className="font-mono text-sm">{payment.stripePaymentId.slice(-8)}</td>
                        <td className="text-sm">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paymentData.payments.map((payment) => (
                  <div key={payment.id} className="bg-base-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            {payment.user.imageUrl ? (
                              <img src={payment.user.imageUrl} alt={payment.user.name} />
                            ) : (
                              <div className="bg-neutral-focus w-full h-full flex items-center justify-center">
                                <span className="text-xs">{payment.user.name?.charAt(0) || 'U'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{payment.user.name || 'Unknown'}</div>
                          <div className="text-xs opacity-50">{payment.user.email}</div>
                        </div>
                      </div>
                      <div className={`badge ${getStatusBadgeColor(payment.status)}`}>
                        {payment.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="opacity-70">Package:</span>
                        <div className="font-semibold">{payment.pack.title}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Amount:</span>
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Payment ID:</span>
                        <div className="font-mono">{payment.stripePaymentId.slice(-8)}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Date:</span>
                        <div>{formatDate(payment.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {paymentData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    className="btn btn-sm"
                    disabled={!paymentData.pagination.hasPrev}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm">
                    Page {paymentData.pagination.page} of {paymentData.pagination.totalPages}
                  </span>
                  
                  <button
                    className="btn btn-sm"
                    disabled={!paymentData.pagination.hasNext}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-neutral-content">
              No payment data available
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}