import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin-only API to verify/suspend merchant
export async function POST(request: NextRequest) {
    try {
        // Verify admin user
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Check if user is admin
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();

        if (!userData || userData.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const body = await request.json();
        const { sellerId, verified } = body;

        if (!sellerId || typeof verified !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request - sellerId and verified required' }, { status: 400 });
        }

        // Update seller profile verification status
        const { error } = await supabaseAdmin
            .from('seller_profiles')
            .update({ verified })
            .eq('id', sellerId);

        if (error) {
            console.error('Verify merchant error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: verified ? 'Merchant verified' : 'Merchant suspended' });
    } catch (error: any) {
        console.error('Admin verify merchant API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
