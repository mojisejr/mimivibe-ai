"use client";


import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";

interface AchievementStats {
  completed: number;
  ready: number;
  inProgress: number;
  total: number;
}

export function AchievementProgress() {

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AchievementStats>({ 
    completed: 0, 
    ready: 0, 
    inProgress: 0, 
    total: 0 
  });

  useEffect(() => {
    // Fetch achievement stats from progress API
    const fetchAchievementStats = async () => {
      try {
        const response = await fetch('/api/achievements/progress');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.achievements) {
            const achievements = result.data.achievements;
            const completed = achievements.filter((a: any) => a.progress.completed).length;
            const ready = achievements.filter((a: any) => 
              !a.progress.completed && a.progress.current >= a.progress.required
            ).length;
            const inProgress = achievements.filter((a: any) => 
              !a.progress.completed && a.progress.current > 0 && a.progress.current < a.progress.required
            ).length;
            const total = achievements.length;

            setStats({ completed, ready, inProgress, total });
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch achievement stats:', error);
        setLoading(false);
      }
    };

    fetchAchievementStats();
  }, []);

  if (loading || stats.total === 0) {
    return (
      <div className="card card-mystical">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3">Achievement Progress</h2>
            <div className="skeleton w-12 h-6"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="skeleton h-16 w-full"></div>
            <div className="skeleton h-16 w-full"></div>
            <div className="skeleton h-16 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Achievement Progress</h2>
          <div className="badge badge-primary">
            {stats.completed}/{stats.total}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <div className="text-xs text-neutral-content">สำเร็จแล้ว</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{stats.ready}</div>
            <div className="text-xs text-neutral-content">พร้อมรับ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
            <div className="text-xs text-neutral-content">กำลังทำ</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-content mb-1">
            <span>ความคืบหน้า</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-base-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-success to-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Ready Achievements Notification */}
        {stats.ready > 0 && (
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>คุณมี {stats.ready} ความสำเร็จพร้อมรับรางวัล!</span>
          </div>
        )}


      </div>
    </div>
  );
}