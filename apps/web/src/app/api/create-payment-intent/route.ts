import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/supabase/server-auth';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const stripe = getStripe();
        // Rate limit: 10 payment intents per minute per IP
        const rateLimitResponse = checkRateLimit(request, { maxRequests: 10, windowMs: 60_000 });
        if (rateLimitResponse) return rateLimitResponse;

        // Verify authentication — only logged-in users can create payment intents
        const authResult = await requireAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { amount, currency = 'cad' } = await request.json();

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Valid positive amount required' }, { status: 400 });
        }

        if (amount > 99999) {
            return NextResponse.json({ error: 'Amount exceeds maximum' }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Payment intent creation error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment. Please try again.' },
            { status: 500 }
        );
    }
}
