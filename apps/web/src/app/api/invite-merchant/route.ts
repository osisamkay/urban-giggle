import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, type AuthUser } from '@/lib/supabase/server-auth';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await requireAdmin();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const body = await request.json();
        const { email, businessName, firstName, lastName } = body;

        console.log('[Invite Merchant] Admin', authResult.user.email, 'inviting:', email);

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if service role key is configured
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Invite Merchant] SUPABASE_SERVICE_ROLE_KEY is not configured');
            return NextResponse.json(
                { error: 'Server configuration error: Service role key not configured. Please restart the server after adding the key to .env.local' },
                { status: 500 }
            );
        }

        console.log('[Invite Merchant] Service role key is configured, checking existing users...');

        // Check if user already exists in auth
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            // Check if they're already a seller
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('id, role')
                .eq('email', email.toLowerCase())
                .single();

            if (userData && userData.role === 'SELLER') {
                return NextResponse.json(
                    { error: 'This user is already a seller on the platform' },
                    { status: 400 }
                );
            }

            // If user exists but not a seller, we could update their role
            // For now, just inform them
            return NextResponse.json(
                { error: 'This email is already registered. Please contact the user to apply for seller status.' },
                { status: 400 }
            );
        }

        // Send the invitation email via Supabase Auth
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/onboarding`;

        console.log('[Invite Merchant] Sending invitation to:', email);
        console.log('[Invite Merchant] Redirect URL:', redirectUrl);

        const { data, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl,
            data: {
                role: 'SELLER',
                business_name: businessName || '',
                first_name: firstName || '',
                last_name: lastName || '',
                invited_as_merchant: true
            }
        });

        if (authError) {
            console.error('[Invite Merchant] Auth invite error:', authError);

            // Handle specific errors
            if (authError.message.includes('rate limit')) {
                return NextResponse.json(
                    { error: 'Too many invitation requests. Please wait a few minutes before trying again.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: authError.message },
                { status: 500 }
            );
        }

        console.log('[Invite Merchant] Invitation sent successfully:', data);

        return NextResponse.json({
            success: true,
            message: `Invitation sent to ${email}. They will receive an email to set up their merchant account.`
        });
    } catch (error: any) {
        console.error('Invite merchant error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send invitation' },
            { status: 500 }
        );
    }
}
