'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui';
import { Button, Input } from '@/components/ui';
import { AlertTriangle, Shield, Activity, Users, Search, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/ToastContainer';

interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  activeThreats: number;
  blockedIPs: number;
  recentActivity: {
    failedLogins: number;
    suspiciousRequests: number;
    rateLimitHits: number;
  };
}

interface SecurityAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userId?: string;
  metadata?: any;
  createdAt: string;
}

interface SecurityDashboardProps {
  className?: string;
}

export default function SecurityDashboard({ className }: SecurityDashboardProps = {}) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  // Fetch security metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/security/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch security metrics'
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Error loading security metrics'
      });
    }
  };

  // Fetch security alerts
  const fetchAlerts = async (page = 1, search = '', severity = 'all') => {
    setAlertsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(severity !== 'all' && { severity })
      });

      const response = await fetch(`/api/admin/security/alerts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch security alerts'
        });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Error loading security alerts'
      });
    } finally {
      setAlertsLoading(false);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: number) => {
    try {
      const response = await fetch(`/api/admin/security/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Alert deleted successfully'
        });
        fetchAlerts(currentPage, searchTerm, severityFilter);
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete alert'
        });
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Error deleting alert'
      });
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMetrics(),
      fetchAlerts(currentPage, searchTerm, severityFilter)
    ]);
    setRefreshing(false);
    addToast({
      type: 'success',
      title: 'Success',
      message: 'Data refreshed'
    });
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchMetrics(),
        fetchAlerts()
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAlerts(1, searchTerm, severityFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, severityFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts(currentPage, searchTerm, severityFilter);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, searchTerm, severityFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'badge-error';
      case 'high':
        return 'badge-warning';
      case 'medium':
        return 'badge-info';
      case 'low':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events and system threats</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Total Alerts</h3>
                    <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
                    <p className="text-xs text-base-content/60">Security events detected</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Critical Alerts</h3>
                    <div className="text-2xl font-bold text-error">{metrics.criticalAlerts}</div>
                    <p className="text-xs text-base-content/60">Require immediate attention</p>
                  </div>
                  <Shield className="h-8 w-8 text-error" />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Active Threats</h3>
                    <div className="text-2xl font-bold text-warning">{metrics.activeThreats}</div>
                    <p className="text-xs text-base-content/60">Currently being monitored</p>
                  </div>
                  <Activity className="h-8 w-8 text-warning" />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-base-content/60">Blocked IPs</h3>
                    <div className="text-2xl font-bold">{metrics.blockedIPs}</div>
                    <p className="text-xs text-base-content/60">IP addresses blocked</p>
                  </div>
                  <Users className="h-8 w-8 text-info" />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      {metrics && (
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-2">Recent Security Activity</h2>
            <p className="text-base-content/60 mb-4">Last 24 hours</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-500">{metrics.recentActivity.failedLogins}</div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{metrics.recentActivity.suspiciousRequests}</div>
                <p className="text-sm text-muted-foreground">Suspicious Requests</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{metrics.recentActivity.rateLimitHits}</div>
                <p className="text-sm text-muted-foreground">Rate Limit Hits</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Security Alerts */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-2">Security Alerts</h2>
          <p className="text-base-content/60 mb-4">Recent security events and threats</p>
          
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/60" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
            <select 
              className="select select-bordered w-40"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {alertsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center p-8 text-base-content/60">
                No security alerts found
              </div>
            ) : (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`badge ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </div>
                      <span className="font-medium">{alert.type}</span>
                      <span className="text-sm text-base-content/60">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/80 mb-1">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-base-content/60">
                      <span>IP: {alert.ipAddress}</span>
                      {alert.userId && <span>User: {alert.userId}</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteAlert(alert.id)}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAlerts(currentPage - 1, searchTerm, severityFilter)}
                disabled={currentPage === 1 || alertsLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAlerts(currentPage + 1, searchTerm, severityFilter)}
                disabled={currentPage === totalPages || alertsLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};