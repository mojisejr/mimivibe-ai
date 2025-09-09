"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CampaignAnalytics {
  eligibleUsers: number;
  conversions: number;
  conversionRate: number;
}

interface CampaignControlsProps {
  isAdmin?: boolean;
}

export function CampaignControls({ isAdmin = false }: CampaignControlsProps) {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/first-payment/toggle');
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const toggleCampaign = async () => {
    if (!isAdmin || isActive === null) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/campaigns/first-payment/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const result = await response.json();

      if (result.success) {
        setIsActive(!isActive);
        setAnalytics(result.data.analytics);
      } else {
        setError(result.message || 'Failed to toggle campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <motion.div
      className="card card-compact bg-base-100 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-body">
        <h2 className="card-title">
          🎯 First Payment Campaign Controls
        </h2>

        {error && (
          <div className="alert alert-error alert-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Campaign Active</span>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={isActive || false}
              onChange={toggleCampaign}
              disabled={loading || isActive === null}
            />
          </label>
        </div>

        {loading && (
          <div className="flex items-center space-x-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span>Updating campaign status...</span>
          </div>
        )}

        {analytics && (
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Eligible Users</div>
              <div className="stat-value text-primary">
                {analytics.eligibleUsers.toLocaleString()}
              </div>
              <div className="stat-desc">Users with no payments</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-8 h-8 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div className="stat-title">Conversions</div>
              <div className="stat-value text-secondary">
                {analytics.conversions.toLocaleString()}
              </div>
              <div className="stat-desc">First payments made</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-accent">
                <div className="avatar online">
                  <div className="w-16 rounded-full">
                    <div className="w-full h-full bg-accent rounded-full flex items-center justify-center text-accent-content font-bold">
                      %
                    </div>
                  </div>
                </div>
              </div>
              <div className="stat-title">Conversion Rate</div>
              <div className="stat-value text-accent">
                {analytics.conversionRate.toFixed(2)}%
              </div>
              <div className="stat-desc">
                {analytics.conversionRate > 0 ? '↗︎ ' : ''}Campaign effectiveness
              </div>
            </div>
          </div>
        )}

        <div className="card-actions justify-end">
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Refresh Analytics
          </button>
        </div>
      </div>
    </motion.div>
  );
}