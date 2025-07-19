"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { DailyLoginCalendar } from "@/components/events/DailyLoginCalendar";
import { AchievementBadges } from "@/components/events/AchievementBadges";
import { EventsHeader } from "@/components/events/EventsHeader";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

interface CampaignData {
  id: string;
  title: string;
  type: "DAILY_LOGIN";
  startDate: string;
  endDate: string;
  progress: {
    current: number;
    total: number;
    claimed: boolean[];
  };
  rewards: Array<{
    day: number;
    exp: number;
    coins: number;
    description: string;
  }>;
}

interface EventsData {
  campaigns: CampaignData[];
}

export default function EventsPage() {
  const { user, isLoaded } = useUser();
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/campaigns/active");
      if (!response.ok) {
        throw new Error(`Failed to fetch events data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setEventsData(result.data);
      } else {
        throw new Error(result.error || "Failed to load events data");
      }
    } catch (error) {
      console.error("Events data fetch error:", error);
      setError(error instanceof Error ? error.message : "Failed to load events data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchEventsData();
    } else if (isLoaded && !user) {
      setLoading(false);
      setError("Authentication required");
    }
  }, [isLoaded, user]);

  const handleClaimReward = async (day: number) => {
    try {
      const response = await fetch("/api/campaigns/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day }),
      });

      if (!response.ok) {
        throw new Error("Failed to claim reward");
      }

      const result = await response.json();
      if (result.success) {
        // Refresh events data to show updated status
        await fetchEventsData();
        return result;
      } else {
        throw new Error(result.error || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Claim reward error:", error);
      throw error;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <SkeletonLoader type="events" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              กิจกรรมพิเศษ 🎉
            </h1>
            <p className="text-base-content/70">
              กรุณาเข้าสู่ระบบเพื่อเข้าร่วมกิจกรรม
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              กิจกรรมพิเศษ 🎉
            </h1>
            <div className="alert alert-error max-w-md mx-auto">
              <span>{error}</span>
            </div>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => fetchEventsData()}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dailyLoginCampaign = eventsData?.campaigns.find(
    (campaign) => campaign.type === "DAILY_LOGIN"
  );

  return (
    <div className="min-h-screen bg-base-100">
      <UnifiedNavbar />
      <div className="pt-20 px-4 pb-24 safe-area-bottom">
        <div className="max-w-4xl mx-auto space-y-8">
          <EventsHeader />
          
          {dailyLoginCampaign && (
            <DailyLoginCalendar
              campaign={dailyLoginCampaign}
              onClaimReward={handleClaimReward}
              onRefresh={fetchEventsData}
            />
          )}
          
          <AchievementBadges />
        </div>
      </div>
    </div>
  );
}