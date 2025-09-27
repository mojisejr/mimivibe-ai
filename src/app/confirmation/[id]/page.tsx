"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ConfirmationPage } from "@/components/confirmation/ConfirmationPage";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { useTranslation } from '@/lib/i18n';

export default function ReadingConfirmationPage() {
  const params = useParams();
  const { isLoaded, isSignedIn } = useUser();
  const { t } = useTranslation();
  
  const readingId = params.id as string;

  // Show loading while authentication is being checked
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content text-lg">{t('common.status.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-base-content/70 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูสถานะการทำนาย</p>
          <a 
            href="/sign-in" 
            className="btn btn-primary text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <UnifiedNavbar />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <ConfirmationPage readingId={readingId} />
      </main>
      
      <BottomNavigation />
    </div>
  );
}