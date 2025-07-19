"use client";

import PaymentHistoryPage from "@/components/payments/PaymentHistoryPage";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Header */}
      <UnifiedNavbar />

      {/* Payment History Content */}
      <PaymentHistoryPage />

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}