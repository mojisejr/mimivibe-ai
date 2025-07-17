"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#8B5CF6', // primary color from DaisyUI
        colorBackground: '#FFFFFF',
        colorText: '#1F2937',
        colorDanger: '#EF4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#F9FAFB',
          border: '1px solid #D1D5DB',
        },
        '.Input:focus': {
          borderColor: '#8B5CF6',
          boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.1)',
        },
        '.Label': {
          color: '#374151',
          fontWeight: '500',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
}