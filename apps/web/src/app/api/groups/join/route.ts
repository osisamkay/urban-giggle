export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { groupId, quantity } = await request.json();

    if (!groupId || quantity === undefined) {
      return NextResponse.json({ error: 'groupId and quantity are required' }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than zero' }, { status: 400 });
    }

    // 1. Verify Group is Active and Deadline not passed
    const { data: group, error: groupError } = await supabaseAdmin
      .from('group_purchases')
      .select('status, deadline')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'This group is no longer active' }, { status: 400 });
    }

    if (new Date(group.deadline) < new Date()) {
      return NextResponse.json({ error: 'The deadline for this group has passed' }, { status: 400 });
    }

    // 2. Prevent duplicate joins (one user per group)
    const { data: existing } = await supabaseAdmin
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', authResult.user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You have already joined this group' }, { status: 400 });
    }

    // 3. Execute Join
    const { data, error: insertError } = await supabaseAdmin
      .from('group_participants')
      .insert({
        group_id: groupId,
        user_id: authResult.user.id,
        quantity,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Update Group Total atomically
    await (supabaseAdmin as any).rpc('update_group_quantities', { p_group_id: groupId });

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Join Group Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
