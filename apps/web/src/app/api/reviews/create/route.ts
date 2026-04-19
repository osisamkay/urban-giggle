import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { productId, rating, title, comment } = await request.json();

    if (!productId || rating === undefined) {
      return NextResponse.json({ error: 'productId and rating are required' }, { status: 400 });
    }

    // 1. Anti-Spam: Check if user has already reviewed this product
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', authResult.user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    // 2. Server-Side Purchase Verification (Cannot be faked by client)
    const { data: orders } = await supabaseAdmin
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId)
      .eq('order_id', (await supabaseAdmin.from('orders').select('id').eq('buyer_id', authResult.user.id).select('id')).data?.[0]?.id); 
      // Simplified check: does a record exist for this user and product?
      // Note: Correcting the logic for a clean join
    
    const { data: purchaseCheck } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .in('order_id', (await supabaseAdmin.from('orders').select('id').eq('buyer_id', authResult.user.id).select('id')).data?.map(o => o.id) || []);

    const verified = purchaseCheck && purchaseCheck.length > 0;

    // 3. Execute Insert
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: authResult.user.id,
        rating,
        title,
        comment,
        verified,
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Atomic Rating Update (Call RPC or perform aggregated update)
    await (supabaseAdmin as any).rpc('update_product_rating', { p_product_id: productId });

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Create Review Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
