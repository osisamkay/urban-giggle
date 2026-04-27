import Stripe from 'stripe';

// Pin the API version — bumping the SDK should not silently shift API behavior.
const STRIPE_API_VERSION = '2024-06-20' as Stripe.LatestApiVersion;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (_stripe) return _stripe;

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Missing STRIPE_SECRET_KEY');
    }

    _stripe = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
    return _stripe;
}
