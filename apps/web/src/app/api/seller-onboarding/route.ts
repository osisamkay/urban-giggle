export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { businessName, description, location, certifications } = body;

        if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
            return NextResponse.json(
                { error: 'Business name is required and must be at least 2 characters.' },
                { status: 400 }
            );
        }

        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Check if user already has a seller profile
        const { data: existingProfile } = await supabaseAdmin
            .from('seller_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

        if (existingProfile) {
            return NextResponse.json(
                { error: 'You already have a seller profile.' },
                { status: 400 }
            );
        }

        // Update user role to SELLER
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ role: 'SELLER' })
            .eq('id', authUser.id);

        if (userError) {
            console.error('Failed to update user role:', userError);
            return NextResponse.json(
                { error: 'Failed to update user role: ' + userError.message },
                { status: 500 }
            );
        }

        // Create seller profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('seller_profiles')
            .insert({
                user_id: authUser.id,
                business_name: businessName.trim(),
                description: description?.trim() || null,
                location: location?.trim() || null,
                certifications: certifications || [],
                verified: false,
                rating: 0,
                total_sales: 0,
            })
            .select()
            .single();

        if (profileError) {
            console.error('Failed to create seller profile:', profileError);
            // Rollback role change
            await supabaseAdmin
                .from('users')
                .update({ role: 'BUYER' })
                .eq('id', authUser.id);

            return NextResponse.json(
                { error: 'Failed to create seller profile: ' + profileError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Seller profile created successfully!',
            profile
        });

    } catch (error: any) {
        console.error('Seller onboarding error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
