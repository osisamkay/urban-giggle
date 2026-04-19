import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { productId, updates } = await request.json();

    if (!productId || !updates) {
      return NextResponse.json({ error: 'productId and updates are required' }, { status: 400 });
    }

    // 1. Verify Ownership
    // Find the seller profile for the authenticated user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('seller_profiles')
      .select('id')
      .eq('user_id', authResult.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'You must be a registered seller to update products' }, { status: 403 });
    }

    // 2. Verify the product belongs to this seller
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this product' }, { status: 403 });
    }

    // 3. Sanitize Updates (Prevent privilege escalation/field injection)
    const allowedFields = ['title', 'description', 'category', 'price', 'unit', 'inventory', 'images', 'specifications', 'sourcingInfo'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    // 4. Execute Update
    const { data, error: updateError } = await supabaseAdmin
      .from('products')
      .update(filteredUpdates)
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Update Product Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
