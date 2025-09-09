import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil', // NOTE: Using current SDK version - monitor for stability in production
  typescript: true,
})

export const formatAmountForStripe = (amount: number): number => {
  // Convert THB to satang (smallest unit for Stripe)
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  // Convert satang back to THB
  return Math.round(amount / 100)
}