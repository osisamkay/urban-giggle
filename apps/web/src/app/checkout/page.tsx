'use client';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutContent from './CheckoutContent';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const user = useAuthStore((state) => state.user);
  const { items, getTotal } = useCartStore();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState('');

  const subtotal = getTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else if (items.length === 0) {
      router.push('/cart');
    } else if (total > 0 && !clientSecret) {
      // Fetch payment intent only if not already fetched or if total changed significantly?
      // For simplicity, we fetch once or if total changes.
      // Actually we need to debounce or handle race conditions if total changes often,
      // but for checkout page, cart usually static.

      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            console.error('Failed to get client secret', data);
          }
        })
        .catch(err => console.error('Error fetching payment intent:', err));
    }
  }, [user, items, router, total, clientSecret]);

  if (!user || items.length === 0) {
    return null; // redirecting
  }

  const appearance = { theme: 'stripe' as const };
  const options = { clientSecret, appearance };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
      </div>
    );
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
