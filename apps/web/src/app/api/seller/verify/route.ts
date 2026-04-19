import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { documents, status } = await request.json();

    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: 'Documents array is required' }, { status: 400 });
    }

    // 1. Find the seller profile for the authenticated user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('seller_profiles')
      .select('id')
      .eq('user_id', authResult.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    // 2. Update profile with documents and set status to PENDING
    const { data, error: updateError } = await supabaseAdmin
      .from('seller_profiles')
      .update({ 
        kyc_documents: documents, 
        kyc_status: 'PENDING' 
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: 'Verification documents submitted. Our team will review them shortly.',
      data 
    });
  } catch (e: any) {
    console.error('Submit KYC Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
