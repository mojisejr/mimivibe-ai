export interface PaymentHistoryItem {
  id: string
  stripePaymentId: string
  amount: number // Amount in satang
  amountDisplay: string // Amount in THB for display
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  creditsAdded: number
  createdAt: string
  pack: {
    id: number
    title: string
    subtitle: string | null
    creditAmount: number
  }
}

export interface PaymentHistoryResponse {
  success: boolean
  data: {
    payments: PaymentHistoryItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
    summary: {
      totalAmount: number // Total amount in satang
      totalAmountDisplay: string // Total amount in THB for display
      totalCredits: number
      totalTransactions: number
      successRate: number // Percentage
    }
  }
}

export interface PaymentFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  packId?: number
  status?: 'succeeded' | 'failed' | 'pending'
  search?: string // For Stripe Payment ID search
}

export interface PaymentSummaryStats {
  totalAmount: string // Formatted THB amount
  totalCredits: number
  totalTransactions: number
  successRate: number
}