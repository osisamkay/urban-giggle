import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ valid: false, message: 'Invalid items format' }, { status: 400 });
        }

        const productIds = items.map((i: any) => i.productId);

        const { data: products, error } = await supabase
            .from('products')
            .select('id, title, inventory, status')
            .in('id', productIds);

        if (error || !products) {
            console.error('Stock validation error:', error);
            return NextResponse.json({ valid: false, message: 'Failed to fetch product data' }, { status: 500 });
        }

        const errors = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);

            if (!product) {
                errors.push({ productId: item.productId, message: 'Product not found' });
                continue;
            }

            if (product.status === 'OUT_OF_STOCK' || product.status === 'INACTIVE' || product.status === 'DRAFT') {
                errors.push({ productId: item.productId, message: `Product "${product.title}" is currently unavailable.` });
            } else if (typeof product.inventory === 'number') {
                if (product.inventory < item.quantity) {
                    errors.push({
                        productId: item.productId,
                        message: `Only ${product.inventory} left in stock for "${product.title}". You requested ${item.quantity}.`
                    });
                }
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({ valid: false, errors });
        }

        return NextResponse.json({ valid: true });
    } catch (e) {
        console.error('Validation exception:', e);
        return NextResponse.json({ valid: false, message: 'Server error during validation' }, { status: 500 });
    }
}
