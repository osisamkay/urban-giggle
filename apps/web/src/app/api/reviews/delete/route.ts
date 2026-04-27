export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // 1. Ownership Verification
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.user_id !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this review' }, { status: 403 });
    }

    // 2. Execute Delete
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) throw deleteError;

    // 3. Update Rating
    const { data: prod } = await supabaseAdmin.from('reviews').select('product_id').eq('id', reviewId).single();
    if (prod) {
      await (supabaseAdmin as any).rpc('update_product_rating', { p_product_id: prod.product_id });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Delete Review Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
